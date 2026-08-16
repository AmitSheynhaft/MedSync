import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './entities/userEntity';
import { Patient } from '../patients/entities/patientEntity';
import { PatientClinic } from '../patients/entities/patientClinicEntity';
import { Caregiver } from '../caregivers/entities/caregiverEntity';
import { Secretary } from './entities/secretaryEntity';
import { hashPassword, isHashedPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';
import {
  ROLE_ADMIN,
  ROLE_DOCTOR,
  ROLE_PATIENT,
  ROLE_SECRETARY,
} from '../common/constants/roles';
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

  // ── Mapping ─────────────────────────────────────────────────────

  private mapUserEntityToSafeUser(user: User): SafeUser {
    if (!user) return user;
    const { password: _password, roleId: _roleId, role, ...rest } = user;
    // Never expose the role uuid — only its name is meaningful to clients.
    return { ...rest, role: role ? { name: role.name } : role } as SafeUser;
  }

  private toAdminListItem(user: User): AdminUserListItem {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? null,
      birthDate: user.birthDate ?? null,
      gender: user.gender ?? null,
      role: user.role ? { name: user.role.name } : null,
    };
  }

  // ── Reads ────────────────────────────────────────────────────────

  async getAllUsers(
    roleName?: string,
    page?: number,
    limit?: number,
  ): Promise<SafeUser[] | PaginatedResult<SafeUser>> {
    const where = roleName?.trim() ? { role: { name: roleName.trim() } } : undefined;
    const order = { createdAt: 'DESC' as const, id: 'DESC' as const };

    if (page === undefined && limit === undefined) {
      const rows = await this.userRepository.find({ where, relations: ['role'], order });
      return rows.map((u) => this.mapUserEntityToSafeUser(u));
    }

    const pagination = resolvePagination(page, limit);
    const [rows, total] = await this.userRepository.findAndCount({
      where, relations: ['role'], order,
      skip: pagination.skip, take: pagination.take,
    });
    return toPaginatedResult(rows.map((u) => this.mapUserEntityToSafeUser(u)), total, pagination);
  }

  async getAdminUserById(userId: string): Promise<AdminUserListItem & {
    clinicId: string | null;
    licenseNumber: string | null;
    specialization: string | null;
    idNumber: string | null;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'caregiver', 'secretary', 'patient'],
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return {
      ...this.toAdminListItem(user),
      clinicId: user.caregiver?.clinicId ?? user.secretary?.clinicId ?? null,
      licenseNumber: user.caregiver?.licenseNumber ?? null,
      specialization: user.caregiver?.specialization ?? null,
      idNumber: user.secretary?.idNumber ?? null,
    };
  }

  async getAdminUsers(
    roleName?: string,
    page?: number,
    limit?: number,
  ): Promise<AdminUserListItem[] | PaginatedResult<AdminUserListItem>> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select(['user.id', 'user.fullName', 'user.email', 'user.phone', 'user.birthDate', 'user.gender', 'role.name'])
      .orderBy('user.createdAt', 'DESC')
      .addOrderBy('user.id', 'DESC');

    if (roleName?.trim()) qb.where('role.name = :roleName', { roleName: roleName.trim() });

    if (page === undefined && limit === undefined) {
      return (await qb.getMany()).map((u) => this.toAdminListItem(u));
    }

    const pagination = resolvePagination(page, limit);
    const [rows, total] = await qb.skip(pagination.skip).take(pagination.take).getManyAndCount();
    return toPaginatedResult(rows.map((u) => this.toAdminListItem(u)), total, pagination);
  }

  async getUserById(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'patient', 'caregiver'],
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return this.mapUserEntityToSafeUser(user);
  }

  async getUserByIdWithRole(userId: string): Promise<SafeUser | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'patient', 'caregiver', 'secretary'],
    });
    return user ? this.mapUserEntityToSafeUser(user) : null;
  }

  getRawUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['role', 'patient', 'caregiver'],
    });
  }

  // ── Create ───────────────────────────────────────────────────────

  async createUser(input: CreateUserInput): Promise<User> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }

    const normalizedEmail = input.email.toLowerCase();
    await this.assertEmailAvailable(normalizedEmail);

    const password = isHashedPassword(input.password)
      ? input.password
      : hashPassword(input.password);

    const roleId = await this.resolveRoleId(input);
    const roleName = (await this.rolesService.getRoleById(roleId)).name;

    this.validateRoleSpecificCreateFields(roleName, input);

    return this.dataSource.transaction(async (manager) => {
      const savedUser = await manager.getRepository(User).save(
        manager.getRepository(User).create({
          roleId,
          fullName: input.fullName,
          email: normalizedEmail,
          password,
          phone: input.phone,
          birthDate: input.birthDate ? new Date(input.birthDate as string) : null,
          gender: input.gender,
        }),
      );
      await this.createRoleProfile(manager, savedUser.id, roleName, input);
      return savedUser;
    });
  }

  // ── Update (self) ────────────────────────────────────────────────

  async updateUserById(userId: string, updates: UpdateUserInput): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    await this.applyBaseUserFields(user, updates);
    // Role changes are admin-only; use updateUserByIdAsAdmin for those.

    return this.mapUserEntityToSafeUser(await this.userRepository.save(user));
  }

  // ── Update (admin) ───────────────────────────────────────────────

  async updateUserByIdAsAdmin(
    userId: string,
    updates: UpdateUserInput,
    actingUser?: IUser,
  ): Promise<SafeUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'caregiver', 'secretary', 'patient', 'patient.patientClinics'],
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    this.assertAdminCanManageUser(user, actingUser);

    await this.applyBaseUserFields(user, updates);
    await this.applyRoleChange(user, updates);
    await this.userRepository.save(user);

    await this.updateCaregiverProfile(user, updates);
    await this.updateSecretaryProfile(user, updates);
    await this.upsertPatientClinicMembership(user, updates);

    return this.getUserById(userId);
  }

  // ── Delete ────────────────────────────────────────────────────────

  async deleteUserById(userId: string, actingUser?: IUser): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['caregiver', 'secretary', 'patient', 'patient.patientClinics'],
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (actingUser?.role?.name === ROLE_ADMIN) {
      this.assertAdminCanManageUser(user, actingUser);
    }

    await this.dataSource.transaction(async (manager) => {
      // visits.caregiver_id has RESTRICT FK — must remove visits before deleting caregiver
      if (user.caregiver) {
        await manager
          .createQueryBuilder()
          .delete()
          .from('visits')
          .where('"caregiver_id" = :caregiverId', { caregiverId: user.caregiver.id })
          .execute();
      }
      const result = await manager.delete(User, { id: userId });
      if (!result.affected) throw new NotFoundException(`User ${userId} not found`);
    });
  }

  // ── Private: validation ──────────────────────────────────────────

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException(`Email '${email}' already in use`);
  }

  private validateRoleSpecificCreateFields(roleName: string, input: CreateUserInput): void {
    if (roleName === ROLE_SECRETARY && !input.clinicId?.trim())
      throw new BadRequestException('clinicId is required for secretary');
    if (roleName === ROLE_DOCTOR) {
      if (!input.licenseNumber?.trim())
        throw new BadRequestException('licenseNumber is required for doctor');
      if (!input.specialization?.trim())
        throw new BadRequestException('specialization is required for doctor');
    }
  }

  private assertAdminCanManageUser(user: User, actingUser?: IUser): void {
    if (actingUser?.role?.name !== ROLE_ADMIN) return;
    const adminClinicId = actingUser.caregiver?.clinicId ?? actingUser.secretary?.clinicId;
    if (adminClinicId && !this.isUserInClinic(user, adminClinicId))
      throw new ForbiddenException('Cannot manage users outside your clinic');
  }

  private isUserInClinic(user: User, clinicId: string): boolean {
    if (user.caregiver?.clinicId === clinicId) return true;
    if (user.secretary?.clinicId === clinicId) return true;
    if ((user.patient?.patientClinics ?? []).some((pc) => pc.clinicId === clinicId)) return true;
    // Detached users (no clinic on any profile) can be reassigned by any admin.
    return (
      !user.caregiver?.clinicId &&
      !user.secretary?.clinicId &&
      (user.patient?.patientClinics ?? []).length === 0
    );
  }

  // ── Private: field application ───────────────────────────────────

  private async applyBaseUserFields(user: User, updates: UpdateUserInput): Promise<void> {
    if (updates.email && updates.email.toLowerCase() !== user.email) {
      const conflict = await this.userRepository.findOne({
        where: { email: updates.email.toLowerCase() },
      });
      if (conflict) throw new ConflictException('Email already in use');
      user.email = updates.email.toLowerCase();
    }
    if (updates.fullName  !== undefined) user.fullName  = updates.fullName;
    if (updates.phone     !== undefined) user.phone     = updates.phone;
    if (updates.gender    !== undefined) user.gender    = updates.gender;
    if (updates.birthDate !== undefined)
      user.birthDate = updates.birthDate ? new Date(updates.birthDate as string) : null;
    if (updates.password) user.password = hashPassword(updates.password);
  }

  private async applyRoleChange(user: User, updates: UpdateUserInput): Promise<void> {
    if (updates.roleName !== undefined) {
      if (!updates.roleName.trim()) throw new BadRequestException('roleName must not be empty');
      user.roleId = (await this.rolesService.getRoleByName(updates.roleName.trim())).id;
    } else if (updates.roleId !== undefined) {
      user.roleId = updates.roleId;
    }
  }

  // ── Private: profile upserts ─────────────────────────────────────

  private async createRoleProfile(
    manager: EntityManager,
    userId: string,
    roleName: string,
    input: CreateUserInput,
  ): Promise<void> {
    if (roleName === ROLE_PATIENT) {
      const patient = await manager.getRepository(Patient).save(
        manager.getRepository(Patient).create({ userId }),
      );
      if (input.clinicId?.trim()) {
        await manager.getRepository(PatientClinic).save(
          manager.getRepository(PatientClinic).create({
            patientId: patient.id,
            clinicId: input.clinicId.trim(),
          }),
        );
      }
    } else if (roleName === ROLE_SECRETARY) {
      await manager.getRepository(Secretary).save(
        manager.getRepository(Secretary).create({
          userId,
          idNumber: input.idNumber?.trim() || randomUUID(),
          clinicId: input.clinicId!.trim(),
        }),
      );
    } else if (roleName === ROLE_DOCTOR) {
      await manager.getRepository(Caregiver).save(
        manager.getRepository(Caregiver).create({
          userId,
          licenseNumber: input.licenseNumber!.trim(),
          specialization: input.specialization!.trim(),
          clinicId: input.clinicId?.trim() || undefined,
        }),
      );
    }
  }

  private async updateCaregiverProfile(user: User, updates: UpdateUserInput): Promise<void> {
    if (!user.caregiver) return;
    let dirty = false;
    if (updates.licenseNumber !== undefined) { user.caregiver.licenseNumber = updates.licenseNumber || undefined; dirty = true; }
    if (updates.specialization !== undefined) { user.caregiver.specialization = updates.specialization || undefined; dirty = true; }
    if (updates.clinicId !== undefined) { user.caregiver.clinicId = updates.clinicId || undefined; dirty = true; }
    if (dirty) await this.caregiverRepository.save(user.caregiver);
  }

  private async updateSecretaryProfile(user: User, updates: UpdateUserInput): Promise<void> {
    if (user.secretary) {
      let dirty = false;
      if (updates.idNumber?.trim()) { user.secretary.idNumber = updates.idNumber.trim(); dirty = true; }
      if (updates.clinicId?.trim()) { user.secretary.clinicId = updates.clinicId.trim(); dirty = true; }
      if (dirty) await this.secretaryRepository.save(user.secretary);
      return;
    }
    // Secretary profile removed during clinic detach — recreate for reassignment.
    if (updates.clinicId?.trim() && user.role?.name === ROLE_SECRETARY) {
      await this.secretaryRepository.save(
        this.secretaryRepository.create({
          userId: user.id,
          idNumber: updates.idNumber?.trim() || randomUUID(),
          clinicId: updates.clinicId.trim(),
        }),
      );
    }
  }

  private async upsertPatientClinicMembership(user: User, updates: UpdateUserInput): Promise<void> {
    if (!user.patient || !updates.clinicId?.trim()) return;
    const clinicId = updates.clinicId.trim();
    const exists = await this.patientClinicRepository.findOne({
      where: { patientId: user.patient.id, clinicId },
    });
    if (!exists) {
      await this.patientClinicRepository.save(
        this.patientClinicRepository.create({ patientId: user.patient.id, clinicId }),
      );
    }
  }

  private async detachUserFromClinic(user: User, actingUser: IUser): Promise<void> {
    const adminClinicId = actingUser.caregiver?.clinicId ?? actingUser.secretary?.clinicId;
    this.assertAdminCanManageUser(user, actingUser);

    if (user.caregiver?.id) {
      user.caregiver.clinicId = null;
      user.caregiver.clinicName = null;
      await this.caregiverRepository.save(user.caregiver);
    }
    if (user.secretary?.id) {
      // secretary.clinicId is NOT NULL — profile must be removed rather than cleared.
      await this.secretaryRepository.delete({ id: user.secretary.id });
    }
    if (user.patient?.id) {
      const filter = adminClinicId
        ? { patientId: user.patient.id, clinicId: adminClinicId }
        : { patientId: user.patient.id };
      await this.patientClinicRepository.delete(filter);
    }
  }

  // ── Private: role resolution ─────────────────────────────────────

  private async resolveRoleId(input: CreateUserInput): Promise<string> {
    if (input.roleId) return (await this.rolesService.getRoleById(input.roleId)).id;
    const roleName = input.roleName?.trim() || 'patient';
    return (await this.rolesService.getRoleByName(roleName)).id;
  }
}
