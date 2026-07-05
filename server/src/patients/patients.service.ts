import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ROLE_DOCTOR } from '../common/constants/roles';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Patient as PatientEntity } from '../entities/patient/patientEntity';
import { User } from '../entities/user/userEntity';
import { Visit } from '../entities/visit/visitEntity';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { PatientMedicalSummary } from '../entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { RolesService } from '../roles/roles.service';
import { hashPassword } from '../common/password.util';
import { ClinicalAlertsService } from '../clinical-alerts/clinical-alerts.service';
import {
  CreatePatientInput,
  Encounter,
  Patient,
  PatientDocument,
  PatientSummary,
  UpdatePatientInput,
} from './patient.types';

function splitName(fullName: string | undefined): { first: string; last: string } {
  if (!fullName) return { first: '', last: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function calcAge(birthDate?: Date | null): number {
  if (!birthDate) return 0;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
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
    private readonly roles: RolesService,
    private readonly dataSource: DataSource,
    private readonly clinicalAlertsService: ClinicalAlertsService,
  ) {}

  private toSummary(p: PatientEntity): PatientSummary {
    const { first, last } = splitName(p.user?.fullName);
    return {
      id: p.id,
      idNumber: p.idNumber,
      firstName: first,
      lastName: last,
      age: calcAge(p.user?.birthDate),
      gender: (p.user?.gender as any) || '',
    };
  }

  private async toDetail(p: PatientEntity): Promise<Patient> {
    const { first, last } = splitName(p.user?.fullName);

    const [medicalSummary, visits, docs, clinicalAlerts] = await Promise.all([
      this.medicalSummaries.findOne({
        where: { patientId: p.id },
      }),
      this.visits.find({
        where: { patientId: p.id },
        relations: ['caregiver', 'caregiver.user', 'summary'],
        order: { visitDate: 'DESC' },
        take: 10,
      }),
      this.documents.find({
        where: { patientId: p.id },
        order: { uploadedAt: 'DESC' },
        take: 10,
      }),
      this.clinicalAlertsService.getForPatient(p.id),
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
      id: p.id,
      userId: p.userId,
      firstName: first,
      lastName: last,
      fullName: p.user?.fullName ?? '',
      age: calcAge(p.user?.birthDate),
      gender: (p.user?.gender as any) || '',
      dob: formatDob(p.user?.birthDate),
      email: p.user?.email ?? '',
      phone: p.user?.phone ?? '',
      idNumber: p.idNumber,
      hmo: p.hmo ?? '',
      bloodType: p.bloodType,
      address: p.address ?? '',
      notes: p.notes,
      overview: medicalSummary?.summaryText ?? p.notes ?? '',
      encounters,
      documents,
      clinicalAlerts,
      createdAt: p.createdAt?.toISOString?.() ?? String(p.createdAt ?? ''),
      updatedAt: p.updatedAt?.toISOString?.() ?? String(p.updatedAt ?? ''),
    };
  }

  async findAll(search?: string): Promise<PatientSummary[]> {
    const trimmed = search?.trim();
    const list = await this.patients.find({
      relations: ['user'],
      where: trimmed
        ? [
            { user: { fullName: ILike(`%${trimmed}%`) } as any },
            { user: { email: ILike(`%${trimmed}%`) } as any },
          ]
        : undefined,
      order: { createdAt: 'DESC' },
    });
    return list.map((p) => this.toSummary(p));
  }

  /**
   * Ensures the acting user is allowed to touch this patient record.
   * Doctors may access any patient; a patient may only access their own.
   */
  private assertCanAccess(patientId: string, actingUser?: any): void {
    if (!actingUser) return; // no user context (internal call) — skip
    if (actingUser.role?.name === ROLE_DOCTOR) return;
    if (actingUser.patient?.id === patientId) return;
    throw new ForbiddenException('You are not allowed to access this patient record');
  }

  async findOne(id: string, actingUser?: any): Promise<Patient> {
    this.assertCanAccess(id, actingUser);
    const patient = await this.patients.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return this.toDetail(patient);
  }

  async create(input: CreatePatientInput): Promise<Patient> {
    if (!input?.email || !input?.password || !input?.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    const role = await this.roles.getOrCreate('patient', 'Patient role');

    const newId = await this.dataSource.transaction(async (manager) => {
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

      const patient = manager.getRepository(PatientEntity).create({
        userId: savedUser.id,
        idNumber: input.idNumber,
        hmo: input.hmo,
        bloodType: input.bloodType,
        address: input.address ?? '',
        notes: input.notes,
      });
      const savedPatient = await manager.getRepository(PatientEntity).save(patient);
      return savedPatient.id;
    });

    return this.findOne(newId);
  }

  async update(id: string, input: UpdatePatientInput, actingUser?: any): Promise<Patient> {
    this.assertCanAccess(id, actingUser);
    const patient = await this.patients.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);

    await this.dataSource.transaction(async (manager) => {
      const user = patient.user;
      if (user) {
        if (input.fullName !== undefined) user.fullName = input.fullName;
        if (input.email !== undefined) user.email = input.email.toLowerCase();
        if (input.phone !== undefined) user.phone = input.phone;
        if (input.gender !== undefined) user.gender = input.gender;
        if (input.birthDate !== undefined)
          user.birthDate = input.birthDate ? new Date(input.birthDate) : null;
        await manager.getRepository(User).save(user);
      }
      if (input.hmo !== undefined) patient.hmo = input.hmo;
      if (input.bloodType !== undefined) patient.bloodType = input.bloodType;
      if (input.address !== undefined) patient.address = input.address;
      if (input.notes !== undefined) patient.notes = input.notes;
      await manager.getRepository(PatientEntity).save(patient);
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.patients.findOne({ where: { id } });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    await this.users.delete(patient.userId);
  }
}
