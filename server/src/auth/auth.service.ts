import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/entities/userEntity';
import { Patient } from '../patients/entities/patientEntity';
import { Caregiver } from '../caregivers/entities/caregiverEntity';
import { Secretary } from '../users/entities/secretaryEntity';
import { Clinic } from '../clinics/entities/clinicEntity';
import { PatientClinic } from '../patients/entities/patientClinicEntity';
import { hashPassword, verifyPassword } from '../common/password.util';
import { RolesService } from '../roles/roles.service';
import { TokenService, TokenPair } from './token.service';
import { ROLE_DOCTOR, ROLE_PATIENT, ROLE_SECRETARY, ROLE_ADMIN, ALL_ROLES } from '../common/constants/roles';
import { getEffectiveRoles } from '../common/authorization/role-hierarchy';

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
  clinicId?: string;
}

export interface RegisterDoctorInput {
  role?: string;
  fullName: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
  clinicId?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export interface RegisterSecretaryInput {
  role?: string;
  fullName: string;
  email: string;
  password: string;
  idNumber: string;
  clinicId: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export interface RegisterAdminInput {
  role?: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
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
  secretaryId?: string;
  clinicId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Caregiver) private readonly caregivers: Repository<Caregiver>,
    @InjectRepository(Secretary) private readonly secretaries: Repository<Secretary>,
    @InjectRepository(Clinic) private readonly clinics: Repository<Clinic>,
    private readonly roles: RolesService,
    private readonly tokens: TokenService,
    private readonly dataSource: DataSource,
  ) {}

  private async assertClinicExists(clinicId: string): Promise<void> {
    const clinic = await this.clinics.findOne({ where: { id: clinicId } });
    if (!clinic) throw new BadRequestException('Selected clinic does not exist');
  }

  private issueAccessToken(userId: string): string {
    return this.tokens.issueAccessToken(userId);
  }

  private issueRefreshToken(userId: string): string {
    return this.tokens.issueRefreshToken(userId);
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    );
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

    const role = await this.roles.getOrCreateRoleByName(
      input.role === 'patient' ? input.role : 'patient',
      'Patient role',
    );

    const clinicId = input.clinicId?.trim() || undefined;
    if (!clinicId) throw new BadRequestException('יש לבחור מרפאה');
    await this.assertClinicExists(clinicId);

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

      if (clinicId) {
        await manager.getRepository(PatientClinic).save(
          manager.getRepository(PatientClinic).create({
            patientId: savedPatient.id,
            clinicId,
          }),
        );
      }

      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: role.name,
        accessToken: this.issueAccessToken(savedUser.id),
        refreshToken: this.issueRefreshToken(savedUser.id),
        patientId: savedPatient.id,
      };
    }).catch((err) => {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('כתובת האימייל או מספר הזהות כבר קיימים במערכת');
      }
      throw err;
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

    const role = await this.roles.getOrCreateRoleByName(
      input.role === 'doctor' ? input.role : 'doctor',
      'Doctor role',
    );

    const clinicId = input.clinicId?.trim() || undefined;
    if (!clinicId) throw new BadRequestException('יש לבחור מרפאה');
    await this.assertClinicExists(clinicId);

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
        clinicId,
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
        clinicId: savedCaregiver.clinicId,
      };
    }).catch((err) => {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('כתובת האימייל כבר קיימת במערכת');
      }
      throw err;
    });
  }

  async registerSecretary(input: RegisterSecretaryInput): Promise<AuthResult> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }

    const idNumber = input.idNumber?.trim();
    if (!idNumber) throw new BadRequestException('יש להזין תעודת זהות');

    const clinicId = input.clinicId?.trim() || undefined;
    if (!clinicId) throw new BadRequestException('יש לבחור מרפאה');
    await this.assertClinicExists(clinicId);

    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const existingSecretary = await this.secretaries.findOne({
      where: { idNumber },
    });
    if (existingSecretary) throw new BadRequestException('תעודת זהות כבר קיימת במערכת');

    const role = await this.roles.getOrCreateRoleByName(
      ROLE_SECRETARY,
      'Secretary role',
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

      const secretary = manager.getRepository(Secretary).create({
        userId: savedUser.id,
        idNumber,
        clinicId,
      });
      const savedSecretary = await manager
        .getRepository(Secretary)
        .save(secretary);

      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: role.name,
        accessToken: this.issueAccessToken(savedUser.id),
        refreshToken: this.issueRefreshToken(savedUser.id),
        secretaryId: savedSecretary.id,
        clinicId: savedSecretary.clinicId,
      };
    }).catch((err) => {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('כתובת האימייל או תעודת הזהות כבר קיימים במערכת');
      }
      throw err;
    });
  }

  async registerAdmin(input: RegisterAdminInput): Promise<AuthResult> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const role = await this.roles.getOrCreateRoleByName(
      ROLE_ADMIN,
      'Admin role',
    );

    const user = this.users.create({
      roleId: role.id,
      fullName: input.fullName,
      email,
      password: hashPassword(input.password),
      phone: input.phone,
    });
    try {
      const savedUser = await this.users.save(user);
      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: role.name,
        accessToken: this.issueAccessToken(savedUser.id),
        refreshToken: this.issueRefreshToken(savedUser.id),
      };
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ConflictException('כתובת האימייל כבר קיימת במערכת');
      }
      throw err;
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    if (!input?.email || !input?.password) {
      throw new BadRequestException('email and password are required');
    }
    const user = await this.users.findOne({
      where: { email: input.email.toLowerCase() },
      relations: ['role', 'patient', 'caregiver', 'secretary'],
    });
    if (!user || !verifyPassword(input.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roleName = user.role?.name;
    if (!roleName || !ALL_ROLES.includes(roleName)) {
      throw new UnauthorizedException('User does not have an assigned role. Contact an administrator.');
    }

    this.assertRoleMatchesLoginInterface(roleName, input.expectedRole);

    // A secretary may sign in through the patient interface only if she also
    // exists as a patient (has a patient profile in a clinic). Without this the
    // patient screens would have no record to show.
    if (
      roleName === ROLE_SECRETARY &&
      input.expectedRole === ROLE_PATIENT &&
      !user.patient
    ) {
      throw new UnauthorizedException('אינך רשומה כמטופלת במרפאה');
    }

    // The effective role the user is signing in as. Determines which id/clinic
    // context is surfaced so a secretary logging in as a patient gets patient
    // context rather than secretary context.
    const effectiveRole =
      input.expectedRole &&
      getEffectiveRoles(roleName).includes(input.expectedRole)
        ? input.expectedRole
        : roleName;

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: roleName,
      accessToken: this.issueAccessToken(user.id),
      refreshToken: this.issueRefreshToken(user.id),
      // Expose the patient id whenever the user has a patient profile so that
      // doctors/secretaries acting as patients get their own patient context.
      patientId: user.patient?.id,
      caregiverId: roleName === ROLE_DOCTOR ? user.caregiver?.id : undefined,
      secretaryId: roleName === ROLE_SECRETARY ? user.secretary?.id : undefined,
      clinicId:
        effectiveRole === ROLE_PATIENT
          ? undefined
          : roleName === ROLE_DOCTOR
            ? user.caregiver?.clinicId
            : roleName === ROLE_SECRETARY
              ? user.secretary?.clinicId
              : undefined,
    };
  }

  private assertRoleMatchesLoginInterface(
    roleName: string,
    expectedRole?: string,
  ): void {
    if (!expectedRole) return;

    if (!getEffectiveRoles(roleName).includes(expectedRole)) {
      const messages: Record<string, string> = {
        [ROLE_DOCTOR]: 'אין לך הרשאות מטפל',
        [ROLE_PATIENT]: 'אין לך הרשאות מטופל',
        [ROLE_SECRETARY]: 'אין לך הרשאות מזכירה',
      };
      throw new UnauthorizedException(
        messages[expectedRole] ?? 'אין לך הרשאות מתאימות',
      );
    }
  }
}
