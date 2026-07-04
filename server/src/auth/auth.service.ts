import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user/userEntity';
import { Patient } from '../entities/patient/patientEntity';
import { Caregiver } from '../entities/caregiver/caregiverEntity';
import { hashPassword, verifyPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';
import { TokenService, TokenPair } from './token.service';
import { ROLE_DOCTOR, ROLE_PATIENT, ALL_ROLES } from '../common/constants/roles';
import {
  getEffectiveRoles,
  normalizeRoleName,
} from '../common/authorization/role-hierarchy';

export interface RegisterPatientInput {
  role?: string;
  fullName: string;
  email: string;
  password: string;
  idNumber?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  hmo?: string;
  address?: string;
  bloodType?: string;
}

export interface RegisterDoctorInput {
  role?: string;
  fullName: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  expectedRole?: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  fullName: string;
  role: 'patient' | 'doctor' | string;
  accessToken?: string;
  refreshToken?: string;
  patientId?: string;
  caregiverId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Caregiver) private readonly caregivers: Repository<Caregiver>,
    private readonly roles: RolesService,
    private readonly tokens: TokenService,
    private readonly dataSource: DataSource,
  ) {}

  private issueAccessToken(userId: string): string {
    return this.tokens.issueAccessToken(userId);
  }

  private issueRefreshToken(userId: string): string {
    return this.tokens.issueRefreshToken(userId);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const payload = this.tokens.verifyRefreshToken(refreshToken);
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.tokens.generateTokenPair(user.id);
  }

  async registerPatient(input: RegisterPatientInput): Promise<AuthResult> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const idNumber = input.idNumber?.trim() || undefined;
    if (idNumber) {
      const existingPatient = await this.patients.findOne({
        where: { idNumber },
      });
      if (existingPatient) throw new BadRequestException('ID number already in use');
    }

    const role = await this.roles.getOrCreate(
      input.role === 'patient' ? input.role : 'patient',
      'Patient role',
    );

    return this.dataSource.transaction(async (manager) => {
      const user = manager.getRepository(User).create({
        roleId: role.id,
        fullName: input.fullName,
        email,
        password: hashPassword(input.password),
        phone: input.phone,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        gender: input.gender,
      });
      const savedUser = await manager.getRepository(User).save(user);

      const patient = manager.getRepository(Patient).create({
        userId: savedUser.id,
        idNumber,
        hmo: input.hmo,
        bloodType: input.bloodType,
        address: input.address || '',
      });
      const savedPatient = await manager.getRepository(Patient).save(patient);

      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: role.name,
        accessToken: this.issueAccessToken(savedUser.id),
        refreshToken: this.issueRefreshToken(savedUser.id),
        patientId: savedPatient.id,
      };
    });
  }

  async registerDoctor(input: RegisterDoctorInput): Promise<AuthResult> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    if (!input?.licenseNumber || !input?.specialization) {
      throw new BadRequestException(
        'licenseNumber and specialization are required',
      );
    }
    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const role = await this.roles.getOrCreate(
      input.role === 'doctor' ? input.role : 'doctor',
      'Doctor role',
    );

    return this.dataSource.transaction(async (manager) => {
      const user = manager.getRepository(User).create({
        roleId: role.id,
        fullName: input.fullName,
        email,
        password: hashPassword(input.password),
        phone: input.phone,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        gender: input.gender,
      });
      const savedUser = await manager.getRepository(User).save(user);

      const caregiver = manager.getRepository(Caregiver).create({
        userId: savedUser.id,
        licenseNumber: input.licenseNumber,
        specialization: input.specialization,
        clinicName: input.clinicName,
      });
      const savedCaregiver = await manager.getRepository(Caregiver).save(caregiver);

      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: role.name,
        accessToken: this.issueAccessToken(savedUser.id),
        refreshToken: this.issueRefreshToken(savedUser.id),
        caregiverId: savedCaregiver.id,
      };
    });
  }

  async login(input: LoginInput): Promise<AuthResult> {
    if (!input?.email || !input?.password) {
      throw new BadRequestException('email and password are required');
    }
    const user = await this.users.findOne({
      where: { email: input.email.toLowerCase() },
      relations: ['role', 'patient', 'caregiver'],
    });
    if (!user || !verifyPassword(input.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roleName = user.role?.name;
    if (!roleName || !ALL_ROLES.includes(roleName)) {
      throw new UnauthorizedException('User does not have an assigned role. Contact an administrator.');
    }

    this.assertRoleMatchesLoginInterface(roleName, input.expectedRole);

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: roleName,
      accessToken: this.issueAccessToken(user.id),
      refreshToken: this.issueRefreshToken(user.id),
      // Expose only the id that matches the user's role, mirroring /api/auth/me.
      patientId: roleName === ROLE_PATIENT ? user.patient?.id : undefined,
      caregiverId: roleName === ROLE_DOCTOR ? user.caregiver?.id : undefined,
    };
  }

  private assertRoleMatchesLoginInterface(
    roleName: string,
    expectedRole?: string,
  ): void {
    if (!expectedRole) return;

    const expected = normalizeRoleName(expectedRole);
    if (!getEffectiveRoles(roleName).includes(expected)) {
      throw new UnauthorizedException(
        expected === ROLE_DOCTOR ? 'אין לך הרשאות מטפל' : 'אין לך הרשאות מטופל',
      );
    }
  }
}
