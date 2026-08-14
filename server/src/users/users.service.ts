import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './entities/userEntity';
import { Patient } from '../patients/entities/patientEntity';
import { PatientClinic } from '../patients/entities/patientClinicEntity';
import { Caregiver } from '../caregivers/entities/caregiverEntity';
import { Secretary } from './entities/secretaryEntity';
import { hashPassword, isHashedPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';
import { ROLE_DOCTOR, ROLE_PATIENT, ROLE_SECRETARY } from '../common/constants/roles';
import { ROLE_ADMIN } from '../common/constants/roles';
import { PaginatedResult } from '../common/pagination/pagination.types';
import { resolvePagination, toPaginatedResult } from '../common/pagination/pagination.util';
import { AdminUserListItem, CreateUserInput, SafeUser, UpdateUserInput } from './types/user.types';
import { IUser } from '../common/types/entity-interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(PatientClinic)
    private readonly patientClinicRepository: Repository<PatientClinic>,
    @InjectRepository(Caregiver)
    private readonly caregiverRepository: Repository<Caregiver>,
    @InjectRepository(Secretary)
    private readonly secretaryRepository: Repository<Secretary>,
    private readonly rolesService: RolesService,
    private readonly dataSource: DataSource,
  ) {}

  private mapUserEntityToSafeUser(user: User): SafeUser {
    if (!user) return user;
    const { password: _password, roleId: _roleId, role, ...rest } = user;
    // Never expose the role's internal uuid — only its name is meaningful to clients.
    return {
      ...rest,
      role: role ? { name: role.name } : role,
    } as SafeUser;
  }

  async getAllUsers(
    roleName?: string,
    page?: number,
    limit?: number,
  ): Promise<SafeUser[] | PaginatedResult<SafeUser>> {
    const trimmedRoleName = roleName?.trim();
    const where = trimmedRoleName ? { role: { name: trimmedRoleName } } : undefined;

    if (page === undefined && limit === undefined) {
      const userEntities = await this.userRepository.find({
        where,
        relations: ['role'],
        order: { createdAt: 'DESC' },
      });
      return userEntities.map((userEntity) =>
        this.mapUserEntityToSafeUser(userEntity),
      );
    }

    const pagination = resolvePagination(page, limit);
    const [userEntities, total] = await this.userRepository.findAndCount({
      where,
      relations: ['role'],
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    });
    const items = userEntities.map((userEntity) =>
      this.mapUserEntityToSafeUser(userEntity),
    );
    return toPaginatedResult(items, total, pagination);
  }

  /**
   * Lean listing for the admin users table. Selects only the columns the UI
   * displays (name, email, phone, birth date, gender) plus the role name.
   * Avoids fetching the password hash, timestamps, and profile relations.
   */
  async getAdminUsers(
    roleName?: string,
    page?: number,
    limit?: number,
  ): Promise<AdminUserListItem[] | PaginatedResult<AdminUserListItem>> {
    const trimmedRoleName = roleName?.trim();

    const baseQuery = () => {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.role', 'role')
        .select([
          'user.id',
          'user.fullName',
          'user.email',
          'user.phone',
          'user.birthDate',
          'user.gender',
          'role.name',
        ])
        .orderBy('user.createdAt', 'DESC')
        .addOrderBy('user.id', 'DESC');
      if (trimmedRoleName) {
        qb.where('role.name = :roleName', { roleName: trimmedRoleName });
      }
      return qb;
    };

    const toItem = (user: User): AdminUserListItem => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? null,
      birthDate: user.birthDate ?? null,
      gender: user.gender ?? null,
      role: user.role ? { name: user.role.name } : null,
    });

    if (page === undefined && limit === undefined) {
      const rows = await baseQuery().getMany();
      return rows.map(toItem);
    }

    const pagination = resolvePagination(page, limit);
    const [rows, total] = await baseQuery()
      .skip(pagination.skip)
      .take(pagination.take)
      .getManyAndCount();
    return toPaginatedResult(rows.map(toItem), total, pagination);
  }

  async getUserById(userId: string): Promise<SafeUser> {
    const userEntity = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'patient', 'caregiver'],
    });
    if (!userEntity) throw new NotFoundException(`User ${userId} not found`);
    return this.mapUserEntityToSafeUser(userEntity);
  }

  async getUserByIdWithRole(userId: string): Promise<SafeUser | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'patient', 'caregiver', 'secretary'],
    });
    return userEntity ? this.mapUserEntityToSafeUser(userEntity) : null;
  }

  getRawUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['role', 'patient', 'caregiver'],
    });
  }

  async createUser(createUserInput: CreateUserInput): Promise<User> {
    if (
      !createUserInput?.email ||
      !createUserInput?.password ||
      !createUserInput?.fullName
    ) {
      throw new BadRequestException('fullName, email and password are required');
    }
    const normalizedEmail = createUserInput.email.toLowerCase();
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser)
      throw new ConflictException(`Email '${normalizedEmail}' already in use`);

    const password = isHashedPassword(createUserInput.password)
      ? createUserInput.password
      : hashPassword(createUserInput.password);

    const roleId = await this.resolveRoleIdForCreateUser(createUserInput);
    const roleName = (await this.rolesService.getRoleById(roleId)).name;

    if (roleName === ROLE_SECRETARY && !createUserInput.clinicId?.trim()) {
      throw new BadRequestException('clinicId is required for secretary');
    }
    if (roleName === ROLE_DOCTOR) {
      if (!createUserInput.licenseNumber?.trim())
        throw new BadRequestException('licenseNumber is required for doctor');
      if (!createUserInput.specialization?.trim())
        throw new BadRequestException('specialization is required for doctor');
    }

    return this.dataSource.transaction(async (manager) => {
      const user = manager.getRepository(User).create({
        roleId,
        fullName: createUserInput.fullName,
        email: normalizedEmail,
        password,
        phone: createUserInput.phone,
        birthDate: createUserInput.birthDate
          ? new Date(createUserInput.birthDate as string)
          : null,
        gender: createUserInput.gender,
      });
      const savedUser = await manager.getRepository(User).save(user);

      if (roleName === ROLE_PATIENT) {
        const patient = await manager.getRepository(Patient).save(
          manager.getRepository(Patient).create({ userId: savedUser.id }),
        );
        if (createUserInput.clinicId?.trim()) {
          await manager.getRepository(PatientClinic).save(
            manager.getRepository(PatientClinic).create({
              patientId: patient.id,
              clinicId: createUserInput.clinicId.trim(),
            }),
          );
        }
      } else if (roleName === ROLE_SECRETARY) {
        await manager.getRepository(Secretary).save(
          manager.getRepository(Secretary).create({
            userId: savedUser.id,
            idNumber: createUserInput.idNumber?.trim() || randomUUID(),
            clinicId: createUserInput.clinicId!.trim(),
          }),
        );
      } else if (roleName === ROLE_DOCTOR) {
        await manager.getRepository(Caregiver).save(
          manager.getRepository(Caregiver).create({
            userId: savedUser.id,
            licenseNumber: createUserInput.licenseNumber?.trim() || undefined,
            specialization: createUserInput.specialization?.trim() || undefined,
            clinicId: createUserInput.clinicId?.trim() || undefined,
          }),
        );
      }

      return savedUser;
    });
  }

  private async resolveRoleIdForCreateUser(
    createUserInput: CreateUserInput,
  ): Promise<string> {
    if (createUserInput.roleId) {
      const role = await this.rolesService.getRoleById(createUserInput.roleId);
      return role.id;
    }
    const roleName = createUserInput.roleName?.trim() || 'patient';
    const role = await this.rolesService.getRoleByName(roleName);
    return role.id;
  }

  async updateUserById(
    userId: string,
    userUpdates: UpdateUserInput,
  ): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (userUpdates.email && userUpdates.email.toLowerCase() !== user.email) {
      const existingUserWithEmail = await this.userRepository.findOne({
        where: { email: userUpdates.email.toLowerCase() },
      });
      if (existingUserWithEmail) throw new ConflictException('Email already in use');
      user.email = userUpdates.email.toLowerCase();
    }
    if (userUpdates.fullName !== undefined) user.fullName = userUpdates.fullName;
    if (userUpdates.phone !== undefined) user.phone = userUpdates.phone;
    if (userUpdates.gender !== undefined) user.gender = userUpdates.gender;
    if (userUpdates.birthDate !== undefined)
      user.birthDate = userUpdates.birthDate
        ? new Date(userUpdates.birthDate as string)
        : null;
    if (userUpdates.password) user.password = hashPassword(userUpdates.password);
    // Note: roleName/roleId changes are intentionally not handled here.
    // Role updates are admin-only and go through updateUserByIdAsAdmin.

    const savedUser = await this.userRepository.save(user);
    return this.mapUserEntityToSafeUser(savedUser);
  }

  async updateUserByIdAsAdmin(
    userId: string,
    userUpdates: UpdateUserInput,
    actingUser?: IUser,
  ): Promise<SafeUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'caregiver',
        'secretary',
        'patient',
        'patient.patientClinics',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (actingUser?.role?.name === ROLE_ADMIN) {
      const adminClinicId =
        actingUser.caregiver?.clinicId ?? actingUser.secretary?.clinicId;

      if (adminClinicId && !this.isUserInClinic(user, adminClinicId)) {
        throw new ForbiddenException('Cannot update users outside your clinic');
      }
    }

    // Update base user fields
    if (userUpdates.email && userUpdates.email.toLowerCase() !== user.email) {
      const existingUserWithEmail = await this.userRepository.findOne({
        where: { email: userUpdates.email.toLowerCase() },
      });
      if (existingUserWithEmail) throw new ConflictException('Email already in use');
      user.email = userUpdates.email.toLowerCase();
    }
    if (userUpdates.fullName !== undefined) user.fullName = userUpdates.fullName;
    if (userUpdates.phone !== undefined) user.phone = userUpdates.phone;
    if (userUpdates.gender !== undefined) user.gender = userUpdates.gender;
    if (userUpdates.birthDate !== undefined)
      user.birthDate = userUpdates.birthDate
        ? new Date(userUpdates.birthDate as string)
        : null;
    if (userUpdates.password) user.password = hashPassword(userUpdates.password);

    // Role change
    if (userUpdates.roleName !== undefined) {
      const roleName = userUpdates.roleName.trim();
      if (!roleName) throw new BadRequestException('roleName must not be empty');
      const role = await this.rolesService.getRoleByName(roleName);
      user.roleId = role.id;
    } else if (userUpdates.roleId !== undefined) {
      user.roleId = userUpdates.roleId;
    }

    await this.userRepository.save(user);

    // Update caregiver profile fields
    if (user.caregiver) {
      let caregiverDirty = false;
      if (userUpdates.licenseNumber !== undefined) {
        user.caregiver.licenseNumber = userUpdates.licenseNumber || undefined;
        caregiverDirty = true;
      }
      if (userUpdates.specialization !== undefined) {
        user.caregiver.specialization = userUpdates.specialization || undefined;
        caregiverDirty = true;
      }
      if (userUpdates.clinicId !== undefined) {
        user.caregiver.clinicId = userUpdates.clinicId || undefined;
        caregiverDirty = true;
      }
      if (caregiverDirty) {
        await this.caregiverRepository.save(user.caregiver);
      }
    }

    // Update secretary profile fields
    if (user.secretary) {
      let secretaryDirty = false;
      if (userUpdates.idNumber !== undefined && userUpdates.idNumber.trim()) {
        user.secretary.idNumber = userUpdates.idNumber.trim();
        secretaryDirty = true;
      }
      if (userUpdates.clinicId !== undefined && userUpdates.clinicId.trim()) {
        user.secretary.clinicId = userUpdates.clinicId.trim();
        secretaryDirty = true;
      }
      if (secretaryDirty) {
        await this.secretaryRepository.save(user.secretary);
      }
    }

    return this.getUserById(userId);
  }

  private isUserInClinic(user: User, clinicId: string): boolean {
    if (user.caregiver?.clinicId === clinicId) return true;
    if (user.secretary?.clinicId === clinicId) return true;
    return (user.patient?.patientClinics ?? []).some(
      (patientClinic) => patientClinic.clinicId === clinicId,
    );
  }

  async deleteUserById(userId: string, actingUser?: IUser): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['caregiver', 'secretary', 'patient', 'patient.patientClinics'],
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (actingUser?.role?.name === ROLE_ADMIN) {
      const adminClinicId =
        actingUser.caregiver?.clinicId ?? actingUser.secretary?.clinicId;
      if (adminClinicId && !this.isUserInClinic(user, adminClinicId)) {
        throw new ForbiddenException('Cannot delete users outside your clinic');
      }

      // Detach from clinic rather than hard-delete, preserving visit history.
      if (user.caregiver?.id) {
        user.caregiver.clinicId = null;
        user.caregiver.clinicName = null;
        await this.caregiverRepository.save(user.caregiver);
      }
      if (user.secretary?.id) {
        // secretary.clinicId is NOT NULL so the profile must be removed.
        await this.secretaryRepository.delete({ id: user.secretary.id });
      }
      if (user.patient?.id) {
        const clinicFilter = adminClinicId
          ? { patientId: user.patient.id, clinicId: adminClinicId }
          : { patientId: user.patient.id };
        await this.patientClinicRepository.delete(clinicFilter);
      }
      return;
    }

    const deleteResult = await this.userRepository.delete(userId);
    if (!deleteResult.affected)
      throw new NotFoundException(`User ${userId} not found`);
  }
}
