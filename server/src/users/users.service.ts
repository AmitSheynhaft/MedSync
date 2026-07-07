import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from '../entities/user/userEntity';
import { Patient } from '../entities/patient/patientEntity';
import { Caregiver } from '../entities/caregiver/caregiverEntity';
import { Secretary } from '../entities/secretary/secretaryEntity';
import { hashPassword, isHashedPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';
import { ROLE_DOCTOR, ROLE_PATIENT, ROLE_SECRETARY } from '../common/constants/roles';

export interface CreateUserInput {
  roleId?: string;
  roleName?: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string | Date;
  gender?: string;
  clinicId?: string;
}

export interface UpdateUserInput {
  roleId?: string;
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  birthDate?: string | Date;
  gender?: string;
}

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)      private readonly repo:        Repository<User>,
    @InjectRepository(Patient)   private readonly patients:    Repository<Patient>,
    @InjectRepository(Caregiver) private readonly caregivers:  Repository<Caregiver>,
    @InjectRepository(Secretary) private readonly secretaries: Repository<Secretary>,
    private readonly roles: RolesService,
  ) {}

  private strip(user: User): SafeUser {
    if (!user) return user;
    const clone: any = { ...user };
    delete clone.password;
    // Never expose the role's internal uuid — only its name is meaningful to clients.
    delete clone.roleId;
    if (clone.role) {
      clone.role = { name: clone.role.name };
    }
    return clone;
  }

  async findAll(roleName?: string): Promise<SafeUser[]> {
    const users = await this.repo.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
    const filtered = roleName
      ? users.filter((u) => u.role?.name === roleName)
      : users;
    return filtered.map((u) => this.strip(u));
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['role', 'patient', 'caregiver'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.strip(user);
  }

 async findUserByIdWithRole(id: string): Promise<SafeUser | null> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['role', 'patient', 'caregiver'],
    });
    return user ? this.strip(user) : null;
  }

  findRawByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email: email.toLowerCase() },
      relations: ['role', 'patient', 'caregiver'],
    });
  }

  async create(input: CreateUserInput): Promise<User> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    const email = input.email.toLowerCase();
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) throw new ConflictException(`Email '${email}' already in use`);

    const password = isHashedPassword(input.password)
      ? input.password
      : hashPassword(input.password);

    const roleId = await this.resolveRoleId(input);

    const user = this.repo.create({
      roleId,
      fullName: input.fullName,
      email,
      password,
      phone: input.phone,
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      gender: input.gender,
    });
    const saved = await this.repo.save(user);

    // Auto-create the role-specific profile so role-gated features work immediately.
    const roleName = (await this.roles.findOne(roleId)).name;
    if (roleName === ROLE_PATIENT) {
      await this.patients.save(this.patients.create({ userId: saved.id }));
    } else if (roleName === ROLE_SECRETARY) {
      await this.secretaries.save(this.secretaries.create({
        userId: saved.id,
        idNumber: randomUUID(),
        clinicId: input.clinicId ?? null,
      }));
    } else if (roleName === ROLE_DOCTOR) {
      await this.caregivers.save(this.caregivers.create({
        userId: saved.id,
        clinicId: input.clinicId ?? null,
        specialization: null,
      }));
    }

    return saved;
  }

  private async resolveRoleId(input: CreateUserInput): Promise<string> {
    if (input.roleId) {
      const role = await this.roles.findOne(input.roleId);
      return role.id;
    }
    const name = input.roleName?.trim() || 'patient';
    const role = await this.roles.getOrCreate(name);
    return role.id;
  }

  async update(id: string, input: UpdateUserInput): Promise<SafeUser> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (input.email && input.email.toLowerCase() !== user.email) {
      const clash = await this.repo.findOne({
        where: { email: input.email.toLowerCase() },
      });
      if (clash) throw new ConflictException('Email already in use');
      user.email = input.email.toLowerCase();
    }
    if (input.fullName !== undefined) user.fullName = input.fullName;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.gender !== undefined) user.gender = input.gender;
    if (input.birthDate !== undefined)
      user.birthDate = input.birthDate ? new Date(input.birthDate) : null;
    if (input.roleId !== undefined) user.roleId = input.roleId;
    if (input.password) user.password = hashPassword(input.password);

    const saved = await this.repo.save(user);
    return this.strip(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`User ${id} not found`);
  }
}
