import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user/userEntity';
import { Patient } from '../entities/patient/patientEntity';
import { Caregiver } from '../entities/caregiver/caregiverEntity';
import { hashPassword, verifyPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';

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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Caregiver) private readonly caregivers: Repository<Caregiver>,
    private readonly roles: RolesService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private get refreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET') || 'dev-jwt-refresh-secret-change-me';
  }

  private get refreshExpiresIn(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  private issueAccessToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  private issueRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn as any },
    );
  }

  /** Verifies a refresh token and mints a fresh access/refresh token pair. */
  async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    let payload: { sub?: string; type?: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload?.type !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return {
      accessToken: this.issueAccessToken(user.id),
      refreshToken: this.issueRefreshToken(user.id),
    };
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
    if (!roleName || !['doctor', 'patient'].includes(roleName)) {
      throw new UnauthorizedException('User does not have an assigned role. Contact an administrator.');
    }

    // Validate expected role if provided.
    // A doctor inherits patient access, so a doctor may log in via the patient
    // interface too. A patient may only log in as a patient.
    if (input.expectedRole) {
      const expected = input.expectedRole === 'therapist' ? 'doctor' : input.expectedRole;
      const effectiveRoles = roleName === 'doctor' ? ['doctor', 'patient'] : ['patient'];
      if (!effectiveRoles.includes(expected)) {
        throw new UnauthorizedException(
          expected === 'doctor'
            ? 'אין לך הרשאות מטפל'
            : 'אין לך הרשאות מטופל',
        );
      }
    }

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: roleName,
      accessToken: this.issueAccessToken(user.id),
      refreshToken: this.issueRefreshToken(user.id),
      patientId: user.patient?.id,
      caregiverId: user.caregiver?.id,
    };
  }
}
