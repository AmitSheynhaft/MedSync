import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ROLE_DOCTOR,
  ROLE_PATIENT,
  ROLE_SECRETARY,
} from '../common/constants/roles';
import { calcAge as calcAgeYears } from '../common/age.util';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, ILike, Not, Repository } from 'typeorm';
import { Patient as PatientEntity } from './entities/patientEntity';
import { User } from '../users/entities/userEntity';
import { Visit } from '../visits/entities/visitEntity';
import { MedicalDocument } from '../medical-documents/entities/medicalDocumentEntity';
import { PatientMedicalSummary } from '../patient-medical-summary/entities/patientMedicalSummaryEntity';
import { PatientClinic } from './entities/patientClinicEntity';
import { Secretary } from '../users/entities/secretaryEntity';
import { RolesService } from '../roles/roles.service';
import { hashPassword } from '../common/password.util';
import { ClinicalAlertsService } from '../clinical-alerts/clinical-alerts.service';
import { IUser } from '../common/types/entity-interfaces';
import {
  CreatePatientInput,
  Encounter,
  Patient,
  PatientDocument,
  PatientSummary,
  UpdatePatientInput,
} from './patient.types';
import { PaginatedResult } from '../common/pagination/pagination.types';
import {
  resolvePagination,
  toPaginatedResult,
} from '../common/pagination/pagination.util';

function splitName(fullName: string | undefined): {
  first: string;
  last: string;
} {
  if (!fullName) return { first: '', last: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function formatDob(birthDate?: Date | null): string {
  if (!birthDate) return '';
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB');
}

function formatDate(date?: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientEntity)
    private readonly patients: Repository<PatientEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Visit)
    private readonly visits: Repository<Visit>,
    @InjectRepository(MedicalDocument)
    private readonly documents: Repository<MedicalDocument>,
    @InjectRepository(PatientMedicalSummary)
    private readonly medicalSummaries: Repository<PatientMedicalSummary>,
    @InjectRepository(PatientClinic)
    private readonly patientClinics: Repository<PatientClinic>,
    @InjectRepository(Secretary)
    private readonly secretaries: Repository<Secretary>,
    private readonly roles: RolesService,
    private readonly dataSource: DataSource,
    private readonly clinicalAlertsService: ClinicalAlertsService,
  ) {}

  private mapPatientEntityToSummary(patientEntity: PatientEntity): PatientSummary {
    const { first, last } = splitName(patientEntity.user?.fullName);
    return {
      id: patientEntity.id,
      idNumber: patientEntity.idNumber,
      firstName: first,
      lastName: last,
      age: calcAgeYears(patientEntity.user?.birthDate) ?? 0,
      gender: patientEntity.user?.gender ?? '',
    };
  }

  private async mapPatientEntityToDetail(
    patientEntity: PatientEntity,
  ): Promise<Patient> {
    const { first, last } = splitName(patientEntity.user?.fullName);

    const [medicalSummary, visits, docs, clinicalAlerts] = await Promise.all([
      this.medicalSummaries.findOne({
        where: { patientId: patientEntity.id },
      }),
      this.visits.find({
        where: { patientId: patientEntity.id },
        relations: ['caregiver', 'caregiver.user', 'summary'],
        order: { visitDate: 'DESC' },
        take: 10,
      }),
      this.documents.find({
        where: { patientId: patientEntity.id },
        order: { uploadedAt: 'DESC' },
        take: 10,
      }),
      this.clinicalAlertsService.getForPatient(patientEntity.id),
    ]);

    const encounters: Encounter[] = visits.map((v) => ({
      id: v.id,
      date: formatDate(v.visitDate),
      doctor: v.caregiver?.user?.fullName
        ? `Dr. ${v.caregiver.user.fullName}`
        : 'Caregiver',
      specialty: v.caregiver?.specialization ?? 'General',
      type: v.summary ? 'Documented' : 'Visit',
    }));

    const documents: PatientDocument[] = docs.map((d) => ({
      id: d.id,
      name: d.fileName,
      date: formatDate(d.uploadedAt),
      kind: d.documentType ?? 'OTHER',
    }));

    return {
      id: patientEntity.id,
      userId: patientEntity.userId,
      firstName: first,
      lastName: last,
      fullName: patientEntity.user?.fullName ?? '',
      age: calcAgeYears(patientEntity.user?.birthDate) ?? 0,
      gender: patientEntity.user?.gender ?? '',
      dob: formatDob(patientEntity.user?.birthDate),
      email: patientEntity.user?.email ?? '',
      phone: patientEntity.user?.phone ?? '',
      idNumber: patientEntity.idNumber,
      hmo: patientEntity.hmo ?? '',
      bloodType: patientEntity.bloodType,
      address: patientEntity.address ?? '',
      notes: patientEntity.notes,
      overview: medicalSummary?.summaryText ?? patientEntity.notes ?? '',
      encounters,
      documents,
      clinicalAlerts,
      createdAt:
        patientEntity.createdAt?.toISOString?.() ??
        String(patientEntity.createdAt ?? ''),
      updatedAt:
        patientEntity.updatedAt?.toISOString?.() ??
        String(patientEntity.updatedAt ?? ''),
    };
  }

  async getAllPatients(
    searchQuery?: string,
    actingUser?: IUser,
    page?: number,
    limit?: number,
  ): Promise<PatientSummary[] | PaginatedResult<PatientSummary>> {
    const trimmedSearchQuery = searchQuery?.trim();
    const clinicId = this.getActingClinicId(actingUser);
    const userWhere: Record<string, unknown> = { role: { name: ROLE_PATIENT } };
    if (actingUser?.id) {
      userWhere.id = Not(actingUser.id);
    }

    const baseWhere: Record<string, unknown> = { user: userWhere };
    if (clinicId) {
      baseWhere.patientClinics = { clinicId };
    }

    const where = trimmedSearchQuery
      ? [
          {
            ...baseWhere,
            user: { ...userWhere, fullName: ILike(`%${trimmedSearchQuery}%`) },
          },
          {
            ...baseWhere,
            user: { ...userWhere, email: ILike(`%${trimmedSearchQuery}%`) },
          },
        ]
      : baseWhere;

    const listOptions = {
      where,
      relations: ['user', 'user.role'],
      order: { createdAt: 'DESC' as const, id: 'DESC' as const },
    };

    if (page === undefined && limit === undefined) {
      const patientEntities = await this.patients.find(listOptions);
      return patientEntities.map((patientEntity) =>
        this.mapPatientEntityToSummary(patientEntity),
      );
    }

    const pagination = resolvePagination(page, limit);
    const [patientEntities, total] = await this.patients.findAndCount({
      ...listOptions,
      skip: pagination.skip,
      take: pagination.take,
    });
    const items = patientEntities.map((patientEntity) =>
      this.mapPatientEntityToSummary(patientEntity),
    );
    return toPaginatedResult(items, total, pagination);
  }

  private getActingClinicId(actingUser?: IUser): string | undefined {
    if (!actingUser) return undefined;
    if (actingUser.role?.name !== ROLE_DOCTOR) return undefined;
    return actingUser.caregiver?.clinicId ?? undefined;
  }

  private async isPatientInClinic(
    patientId: string,
    clinicId: string,
  ): Promise<boolean> {
    const membership = await this.patientClinics.findOne({
      where: { patientId, clinicId },
    });
    return !!membership;
  }

  private async assertActingUserCanAccessPatient(
    patientId: string,
    actingUser?: IUser,
  ): Promise<void> {
    if (!actingUser) return;
    if (actingUser.role?.name === ROLE_DOCTOR) {
      const clinicId = this.getActingClinicId(actingUser);
      if (clinicId && (await this.isPatientInClinic(patientId, clinicId)))
        return;
      throw new ForbiddenException(
        'You are not allowed to access this patient record',
      );
    }
    if (actingUser.role?.name === ROLE_SECRETARY) {
      const clinicId = await this.getSecretaryClinicId(actingUser.id);
      if (clinicId && (await this.isPatientInClinic(patientId, clinicId)))
        return;
      throw new ForbiddenException(
        'You are not allowed to access this patient record',
      );
    }
    if (actingUser.patient?.id === patientId) return;
    throw new ForbiddenException(
      'You are not allowed to access this patient record',
    );
  }

  async assertUserCanAccessPatient(
    patientId: string,
    actingUser?: IUser,
  ): Promise<void> {
    await this.assertActingUserCanAccessPatient(patientId, actingUser);
  }

  private async getSecretaryClinicId(userId: string): Promise<string> {
    const secretary = await this.secretaries.findOne({ where: { userId } });
    if (!secretary?.clinicId) {
      throw new ForbiddenException('Secretary is not assigned to a clinic');
    }
    return secretary.clinicId;
  }

  async getPatientById(
    patientId: string,
    actingUser?: IUser,
  ): Promise<Patient> {
    await this.assertActingUserCanAccessPatient(patientId, actingUser);
    const patient = await this.patients.findOne({
      where: { id: patientId },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException(`Patient ${patientId} not found`);
    return this.mapPatientEntityToDetail(patient);
  }

  async createPatient(
    createPatientInput: CreatePatientInput,
    actingUser?: IUser,
  ): Promise<Patient> {
    if (
      !createPatientInput?.email ||
      !createPatientInput?.password ||
      !createPatientInput?.fullName
    ) {
      throw new BadRequestException(
        'fullName, email and password are required',
      );
    }
    const normalizedEmail = createPatientInput.email.toLowerCase();
    const existingUserWithEmail = await this.users.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUserWithEmail) throw new ConflictException('Email already in use');

    const role = await this.roles.getRoleByName(
      'patient',
    );

    const newId = await this.dataSource.transaction(async (manager) => {
      const user = manager.getRepository(User).create({
        roleId: role.id,
        fullName: createPatientInput.fullName,
        email: normalizedEmail,
        password: hashPassword(createPatientInput.password),
        phone: createPatientInput.phone,
        birthDate: createPatientInput.birthDate
          ? new Date(createPatientInput.birthDate)
          : null,
        gender: createPatientInput.gender,
      });
      const savedUser = await manager.getRepository(User).save(user);

      const patient = manager.getRepository(PatientEntity).create({
        userId: savedUser.id,
        idNumber: createPatientInput.idNumber,
        hmo: createPatientInput.hmo,
        bloodType: createPatientInput.bloodType,
        address: createPatientInput.address ?? '',
        notes: createPatientInput.notes,
      });
      const savedPatient = await manager
        .getRepository(PatientEntity)
        .save(patient);

      const clinicId = this.getActingClinicId(actingUser);
      if (clinicId) {
        await manager.getRepository(PatientClinic).save(
          manager.getRepository(PatientClinic).create({
            patientId: savedPatient.id,
            clinicId,
          }),
        );
      }

      return savedPatient.id;
    });

    return this.getPatientById(newId, actingUser);
  }

  async ensurePatientProfileForUser(
    userId: string,
    manager?: EntityManager,
  ): Promise<PatientEntity> {
    const patientRepo = manager
      ? manager.getRepository(PatientEntity)
      : this.patients;
    const userRepo = manager ? manager.getRepository(User) : this.users;

    const existing = await patientRepo.findOne({ where: { userId } });
    if (existing) return existing;

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    return patientRepo.save(patientRepo.create({ userId, address: '' }));
  }

  async updatePatientById(
    patientId: string,
    updatePatientInput: UpdatePatientInput,
    actingUser?: IUser,
  ): Promise<Patient> {
    await this.assertActingUserCanAccessPatient(patientId, actingUser);
    const patient = await this.patients.findOne({
      where: { id: patientId },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException(`Patient ${patientId} not found`);

    await this.dataSource.transaction(async (manager) => {
      const user = patient.user;
      if (user) {
        if (updatePatientInput.fullName !== undefined)
          user.fullName = updatePatientInput.fullName;
        if (updatePatientInput.email !== undefined)
          user.email = updatePatientInput.email.toLowerCase();
        if (updatePatientInput.phone !== undefined)
          user.phone = updatePatientInput.phone;
        if (updatePatientInput.gender !== undefined)
          user.gender = updatePatientInput.gender;
        if (updatePatientInput.birthDate !== undefined)
          user.birthDate = updatePatientInput.birthDate
            ? new Date(updatePatientInput.birthDate)
            : null;
        await manager.getRepository(User).save(user);
      }
      if (updatePatientInput.hmo !== undefined)
        patient.hmo = updatePatientInput.hmo;
      if (updatePatientInput.bloodType !== undefined)
        patient.bloodType = updatePatientInput.bloodType;
      if (updatePatientInput.address !== undefined)
        patient.address = updatePatientInput.address;
      if (updatePatientInput.notes !== undefined)
        patient.notes = updatePatientInput.notes;
      await manager.getRepository(PatientEntity).save(patient);
    });

    return this.getPatientById(patientId, actingUser);
  }

  async deletePatientById(patientId: string): Promise<void> {
    const patient = await this.patients.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException(`Patient ${patientId} not found`);
    await this.users.delete(patient.userId);
  }
}
