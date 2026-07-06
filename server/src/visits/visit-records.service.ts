import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Visit } from '../entities/visit/visitEntity';
import { VisitRecording } from '../entities/visitRecording/visitRecordingEntity';
import { VisitSummary } from '../entities/visitSummary/visitSummaryEntity';
import { VisitDiagnosis } from '../entities/visitDiagnosis/visitDiagnosisEntity';
import { VisitMedicine } from '../entities/visitMedicine/visitMedicineEntity';
import { Diagnosis } from '../entities/diagnosis/diagnosisEntity';
import { Medicine } from '../entities/medicine/medicineEntity';
import { PatientClinic } from '../entities/patientClinic/patientClinicEntity';
import { RecordingStatus, VisitSummaryType, VisitType } from '../entities/enums';
import { DiagnosesService } from '../diagnoses/diagnoses.service';
import { MedicinesService } from '../medicines/medicines.service';
import { PatientMedicalSummaryService } from '../patient-medical-summary/patient-medical-summary.service';

export interface VisitInput {
  patientId: string;
  caregiverId: string;
  slotId?: string;
  visitDate: string | Date;
  actingClinicId?: string;
  bloodPressure?: string;
  pulse?: string;
  bodyTemp?: string;
  weight?: string;
  height?: string;
  oxygenSat?: string;
  chiefComplaint?: string;
  visitType?: string;
  followUpDate?: string;
  referralNotes?: string;
}

export interface VisitRecordingInput {
  status?: RecordingStatus;
  audioUrl: string;
  transcriptText?: string;
}

export interface VisitSummaryInput {
  summaryText: string;
  visitType: VisitSummaryType;
}

export interface VisitDiagnosisInput {
  diagnosisId?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  note?: string;
}

export interface VisitMedicineInput {
  medicineId?: string;
  medicineName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

@Injectable()
export class VisitRecordsService {
  private readonly logger = new Logger(VisitRecordsService.name);

  constructor(
    @InjectRepository(Visit) private readonly visits: Repository<Visit>,
    @InjectRepository(VisitRecording)
    private readonly recordings: Repository<VisitRecording>,
    @InjectRepository(VisitSummary)
    private readonly summaries: Repository<VisitSummary>,
    @InjectRepository(VisitDiagnosis)
    private readonly visitDiagnoses: Repository<VisitDiagnosis>,
    @InjectRepository(VisitMedicine)
    private readonly visitMedicines: Repository<VisitMedicine>,
    @InjectRepository(Diagnosis)
    private readonly diagnosesRepo: Repository<Diagnosis>,
    @InjectRepository(Medicine)
    private readonly medicinesRepo: Repository<Medicine>,
    @InjectRepository(PatientClinic)
    private readonly patientClinics: Repository<PatientClinic>,
    private readonly diagnosesService: DiagnosesService,
    private readonly medicinesService: MedicinesService,
    private readonly dataSource: DataSource,
    private readonly medicalSummaryService: PatientMedicalSummaryService,
  ) {}

  private isVisitInPast(visitDate: Date): boolean {
    const visitDateOnly = new Date(visitDate);
    visitDateOnly.setHours(0, 0, 0, 0);

    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);

    return visitDateOnly <= todayDateOnly;
  }

  private throwIfPastVisit(visit: Visit, operation: string = 'modify'): void {
    if (this.isVisitInPast(visit.visitDate)) {
      throw new BadRequestException(
        'לא ניתן לערוך ביקור שהתרחש בעבר',
      );
    }
  }

  findAll(patientId?: string, caregiverId?: string, actingClinicId?: string): Promise<Visit[]> {
    const qb = this.visits
      .createQueryBuilder('visit')
      .leftJoinAndSelect('visit.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('visit.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'caregiverUser')
      .leftJoinAndSelect('visit.summary', 'summary')
      .leftJoinAndSelect('visit.recording', 'recording')
      .orderBy('visit.visitDate', 'DESC');

    if (patientId) qb.andWhere('visit.patientId = :patientId', { patientId });
    if (caregiverId) qb.andWhere('visit.caregiverId = :caregiverId', { caregiverId });

    // When called by a doctor, restrict to visits whose patient belongs to that clinic.
    if (actingClinicId) {
      qb.innerJoin(
        'patient_clinics',
        'pc',
        'pc.patient_id = visit.patientId AND pc.clinic_id = :actingClinicId',
        { actingClinicId },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Visit> {
    const visit = await this.visits.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'caregiver',
        'caregiver.user',
        'slot',
        'summary',
        'recording',
        'diagnoses',
        'diagnoses.diagnosis',
        'medicines',
        'medicines.medicine',
      ],
    });
    if (!visit) throw new NotFoundException(`Visit ${id} not found`);
    return visit;
  }

  async create(input: VisitInput): Promise<Visit> {
    if (!input?.patientId || !input?.caregiverId || !input?.visitDate) {
      throw new BadRequestException(
        'patientId, caregiverId and visitDate are required',
      );
    }
    const visit = this.visits.create({
      patientId: input.patientId,
      caregiverId: input.caregiverId,
      slotId: input.slotId,
      visitDate: new Date(input.visitDate),
      bloodPressure: input.bloodPressure,
      pulse: input.pulse,
      bodyTemp: input.bodyTemp,
      weight: input.weight,
      height: input.height,
      oxygenSat: input.oxygenSat,
      chiefComplaint: input.chiefComplaint,
      visitType: input.visitType as VisitType | undefined,
      followUpDate: input.followUpDate,
      referralNotes: input.referralNotes,
    });
    const saved = await this.visits.save(visit);

    // Ensure the patient is a member of the doctor's clinic. If the caregiver
    // has a clinicId and no membership exists yet, create one automatically.
    if (input.actingClinicId) {
      const exists = await this.patientClinics.findOne({
        where: { patientId: input.patientId, clinicId: input.actingClinicId },
      });
      if (!exists) {
        await this.patientClinics.save(
          this.patientClinics.create({
            patientId: input.patientId,
            clinicId: input.actingClinicId,
          }),
        );
      }
    }

    return this.findOne(saved.id);
  }

  async update(id: string, input: Partial<VisitInput>): Promise<Visit> {
    const visit = await this.visits.findOne({ where: { id } });
    if (!visit) throw new NotFoundException(`Visit ${id} not found`);
    
    // Prevent editing past visits
    this.throwIfPastVisit(visit, 'update');
    
    if (input.visitDate !== undefined)
      visit.visitDate = new Date(input.visitDate);
    if (input.bloodPressure !== undefined) visit.bloodPressure = input.bloodPressure;
    if (input.pulse !== undefined) visit.pulse = input.pulse;
    if (input.bodyTemp !== undefined) visit.bodyTemp = input.bodyTemp;
    if (input.weight !== undefined) visit.weight = input.weight;
    if (input.height !== undefined) visit.height = input.height;
    if (input.oxygenSat !== undefined) visit.oxygenSat = input.oxygenSat;
    if (input.chiefComplaint !== undefined) visit.chiefComplaint = input.chiefComplaint;
    if (input.visitType !== undefined) visit.visitType = input.visitType as VisitType;
    if (input.followUpDate !== undefined) visit.followUpDate = input.followUpDate;
    if (input.referralNotes !== undefined) visit.referralNotes = input.referralNotes;
    if (input.slotId !== undefined) visit.slotId = input.slotId;
    if (input.patientId !== undefined) visit.patientId = input.patientId;
    if (input.caregiverId !== undefined) visit.caregiverId = input.caregiverId;
    await this.visits.save(visit);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const visit = await this.visits.findOne({ where: { id } });
    if (!visit) throw new NotFoundException(`Visit ${id} not found`);
    
    // Prevent deleting past visits
    this.throwIfPastVisit(visit, 'delete');
    
    const result = await this.visits.delete(id);
    if (!result.affected) throw new NotFoundException(`Visit ${id} not found`);
  }

  // -------- recording --------
  async upsertRecording(
    visitId: string,
    input: VisitRecordingInput,
  ): Promise<VisitRecording> {
    const visit = await this.findOne(visitId);
    
    // Prevent editing past visits
    this.throwIfPastVisit(visit);
    
    let rec = await this.recordings.findOne({ where: { visitId } });
    if (!rec) {
      rec = this.recordings.create({
        visitId,
        audioUrl: input.audioUrl,
        transcriptText: input.transcriptText,
        status: input.status ?? RecordingStatus.PENDING,
      });
    } else {
      if (input.audioUrl !== undefined) rec.audioUrl = input.audioUrl;
      if (input.transcriptText !== undefined)
        rec.transcriptText = input.transcriptText;
      if (input.status !== undefined) rec.status = input.status;
    }
    return this.recordings.save(rec);
  }

  // -------- summary --------
  async upsertSummary(
    visitId: string,
    input: VisitSummaryInput,
  ): Promise<VisitSummary> {
    const visit = await this.findOne(visitId);
    
    // Prevent editing past visits
    this.throwIfPastVisit(visit);
    
    let summary = await this.summaries.findOne({ where: { visitId } });
    if (!summary) {
      summary = this.summaries.create({
        visitId,
        summaryText: input.summaryText,
        visitType: input.visitType,
      });
    } else {
      summary.summaryText = input.summaryText;
      summary.visitType = input.visitType;
    }
    const saved = await this.summaries.save(summary);

    // Fire-and-forget: regenerate patient medical summary
    if (visit?.patientId) {
      this.medicalSummaryService
        .generateAndSave(visit.patientId)
        .catch((e) =>
          this.logger.error(`Medical summary trigger failed: ${e instanceof Error ? e.message : String(e)}`),
        );
    }

    return saved;
  }

  // -------- diagnoses --------
  async addDiagnosis(
    visitId: string,
    input: VisitDiagnosisInput,
  ): Promise<VisitDiagnosis> {
    const visit = await this.findOne(visitId);
    
    // Prevent editing past visits
    this.throwIfPastVisit(visit);
    
    let diagnosisId = input.diagnosisId;
    if (!diagnosisId) {
      if (!input.diagnosisCode) {
        throw new BadRequestException('diagnosisId or diagnosisCode is required');
      }
      const diag = await this.diagnosesService.getOrCreateByCode(
        input.diagnosisCode,
        input.diagnosisDescription ?? input.diagnosisCode,
      );
      diagnosisId = diag.id;
    }
    const existing = await this.visitDiagnoses.findOne({
      where: { visitId, diagnosisId },
    });
    if (existing) {
      existing.note = input.note ?? existing.note;
      return this.visitDiagnoses.save(existing);
    }
    const created = this.visitDiagnoses.create({
      visitId,
      diagnosisId,
      note: input.note,
    });
    return this.visitDiagnoses.save(created);
  }

  async removeDiagnosis(visitId: string, diagnosisId: string): Promise<void> {
    const result = await this.visitDiagnoses.delete({ visitId, diagnosisId });
    if (!result.affected)
      throw new NotFoundException('Visit diagnosis link not found');
  }

  // -------- medicines --------
  async addMedicine(
    visitId: string,
    input: VisitMedicineInput,
  ): Promise<VisitMedicine> {
    const visit = await this.findOne(visitId);
    
    // Prevent editing past visits
    this.throwIfPastVisit(visit);
    
    let medicineId = input.medicineId;
    if (!medicineId) {
      if (!input.medicineName) {
        throw new BadRequestException('medicineId or medicineName is required');
      }
      const med = await this.medicinesService.getOrCreateByName(input.medicineName);
      medicineId = med.id;
    }
    const existing = await this.visitMedicines.findOne({
      where: { visitId, medicineId },
    });
    if (existing) {
      existing.dosage = input.dosage;
      existing.frequency = input.frequency;
      existing.duration = input.duration;
      existing.instructions = input.instructions;
      return this.visitMedicines.save(existing);
    }
    const created = this.visitMedicines.create({
      visitId,
      medicineId,
      dosage: input.dosage,
      frequency: input.frequency,
      duration: input.duration,
      instructions: input.instructions,
    });
    return this.visitMedicines.save(created);
  }

  async removeMedicine(visitId: string, medicineId: string): Promise<void> {
    const result = await this.visitMedicines.delete({ visitId, medicineId });
    if (!result.affected)
      throw new NotFoundException('Visit medicine link not found');
  }
}
