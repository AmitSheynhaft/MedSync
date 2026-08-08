import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './entities/userEntity';
import { Patient } from '../patients/entities/patientEntity';
import { Caregiver } from '../caregivers/entities/caregiverEntity';
import { Secretary } from './entities/secretaryEntity';
import { hashPassword, isHashedPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';
import { ROLE_DOCTOR, ROLE_PATIENT, ROLE_SECRETARY } from '../common/constants/roles';
import { PaginatedResult } from '../common/pagination/pagination.types';
import {
  resolvePagination,
  toPaginatedResult,
} from '../common/pagination/pagination.util';
import {
  AdminUserListItem,
  CreateUserInput,
  SafeUser,
  UpdateUserInput,
} from './types/user.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Caregiver)
    private readonly caregiverRepository: Repository<Caregiver>,
    @InjectRepository(Secretary)
    private readonly secretaryRepository: Repository<Secretary>,
    private readonly rolesService: RolesService,
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
      relations: ['role', 'patient', 'caregiver'],
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

    const user = this.userRepository.create({
      roleId,
      fullName: createUserInput.fullName,
      email: normalizedEmail,
      password,
      phone: createUserInput.phone,
      birthDate: createUserInput.birthDate
        ? new Date(createUserInput.birthDate)
        : null,
      gender: createUserInput.gender,
    });
    const savedUser = await this.userRepository.save(user);

    // Auto-create the role-specific profile so role-gated features work immediately.
    const roleName = (await this.rolesService.getRoleById(roleId)).name;
    if (roleName === ROLE_PATIENT) {
      await this.patientRepository.save(
        this.patientRepository.create({ userId: savedUser.id }),
      );
    } else if (roleName === ROLE_SECRETARY) {
      await this.secretaryRepository.save(
        this.secretaryRepository.create({
          userId: savedUser.id,
          idNumber: randomUUID(),
          clinicId: createUserInput.clinicId ?? null,
        }),
      );
    } else if (roleName === ROLE_DOCTOR) {
      await this.caregiverRepository.save(
        this.caregiverRepository.create({
          userId: savedUser.id,
          clinicId: createUserInput.clinicId ?? null,
          specialization: null,
        }),
      );
    }

    return savedUser;
  }

  private async resolveRoleIdForCreateUser(
    createUserInput: CreateUserInput,
  ): Promise<string> {
    if (createUserInput.roleId) {
      const role = await this.rolesService.getRoleById(createUserInput.roleId);
      return role.id;
    }
    const roleName = createUserInput.roleName?.trim() || 'patient';
    const role = await this.rolesService.getOrCreateRoleByName(roleName);
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
        ? new Date(userUpdates.birthDate)
        : null;
    if (userUpdates.roleName !== undefined) {
      const roleName = userUpdates.roleName.trim();
      if (!roleName) {
        throw new BadRequestException('roleName must not be empty');
      }
      const role = await this.rolesService.getOrCreateRoleByName(roleName);
      user.roleId = role.id;
    } else if (userUpdates.roleId !== undefined) {
      user.roleId = userUpdates.roleId;
    }
    if (userUpdates.password) user.password = hashPassword(userUpdates.password);

    const savedUser = await this.userRepository.save(user);
    return this.mapUserEntityToSafeUser(savedUser);
  }

  async deleteUserById(userId: string): Promise<void> {
    const deleteResult = await this.userRepository.delete(userId);
    if (!deleteResult.affected)
      throw new NotFoundException(`User ${userId} not found`);
  }
}
