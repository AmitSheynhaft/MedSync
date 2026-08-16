import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as os from 'os';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visitEntity';
import { VisitRecording } from './entities/visitRecordingEntity';
import { VisitSummary } from './entities/visitSummaryEntity';
import { VisitDiagnosis } from './entities/visitDiagnosisEntity';
import { VisitMedicine } from './entities/visitMedicineEntity';
import { PatientClinic } from '../patients/entities/patientClinicEntity';
import { Patient } from '../patients/entities/patientEntity';
import { Slot } from '../slots/entities/slotEntity';
import { SlotStatus } from '../slots/entities/slotStatus';
import { RecordingStatus, VisitSummaryType, VisitType } from '../common/constants/domain-enums';
import { DiagnosesService } from '../diagnoses/diagnoses.service';
import { MedicinesService } from '../medicines/medicines.service';
import { PatientMedicalSummaryService } from '../patient-medical-summary/patient-medical-summary.service';
import { PaginatedResult } from '../common/pagination/pagination.types';
import {
  resolvePagination,
  toPaginatedResult,
} from '../common/pagination/pagination.util';
import {
  VisitDiagnosisInput,
  VisitInput,
  VisitMedicineInput,
  VisitRecordingInput,
  VisitSummaryInput,
} from './types/visit-records.types';

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
    @InjectRepository(PatientClinic)
    private readonly patientClinics: Repository<PatientClinic>,
    @InjectRepository(Patient)
    private readonly patientsRepo: Repository<Patient>,
    @InjectRepository(Slot)
    private readonly slots: Repository<Slot>,
    private readonly diagnosesService: DiagnosesService,
    private readonly medicinesService: MedicinesService,
    private readonly medicalSummaryService: PatientMedicalSummaryService,
  ) {}

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private isVisitInPast(visitDate: Date): boolean {
    const visitDateOnly = new Date(visitDate);
    visitDateOnly.setHours(0, 0, 0, 0);

    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);

    return visitDateOnly < todayDateOnly;
  }

  private throwIfPastVisit(visit: Visit): void {
    if (this.isVisitInPast(visit.visitDate)) {
      throw new BadRequestException(
        'לא ניתן לערוך ביקור שהתרחש בעבר',
      );
    }
  }

  private async getEditableVisitById(visitId: string): Promise<Visit> {
    const visit = await this.visits.findOne({ where: { id: visitId } });
    if (!visit) throw new NotFoundException(`Visit ${visitId} not found`);
    this.throwIfPastVisit(visit);
    return visit;
  }

  private sanitizeHtml(value?: string | null): string {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private extractSummarySections(summaryText?: string) {
    const normalized = (summaryText ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    if (!normalized) {
      return {
        complaints: '',
        findings: '',
        diagnosis: '',
        recommendations: '',
      };
    }

    const extractSection = (labels: string[]): string => {
      for (const label of labels) {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(
          `${escapedLabel}:\\n([\\s\\S]*?)(?=\\n\\n[^\\n]+:\\n|$)`,
          'i',
        );
        const match = pattern.exec(normalized);
        if (match?.[1]?.trim()) {
          return match[1].trim();
        }
      }
      return '';
    };

    const complaints = extractSection([
      'Patient Complaints',
      'תלונת המטופל',
      'תלונות המטופל',
    ]);
    const diagnosis = extractSection(['Diagnosis', 'אבחנה']);
    const recommendations = extractSection([
      "Doctor's Recommendations",
      'המלצות הרופא',
      'המלצות',
    ]);

    return {
      complaints,
      findings: '',
      diagnosis,
      recommendations,
    };
  }

  private toHebrewDate(value?: Date | string | null): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private getPreferredFontStack(): string {
    const platform = os.platform();
    if (platform === 'win32') {
      return '"Segoe UI", Arial, sans-serif';
    }
    if (platform === 'darwin') {
      return '"Arial Hebrew", "Arial", sans-serif';
    }
    return '"Noto Sans Hebrew", "DejaVu Sans", Arial, sans-serif';
  }

  private buildSummaryPdfHtml(visit: Visit): string {
    const summarySections = this.extractSummarySections(visit.summary?.summaryText);
    const patientName = visit.patient?.user?.fullName ?? 'לא צוין';
    const patientIdNumber = visit.patient?.idNumber ?? '-';
    const doctorName = visit.caregiver?.user?.fullName ?? 'לא צוין';
    const doctorSpecialty = visit.caregiver?.specialization ?? 'כללי';
    const visitDate = this.toHebrewDate(visit.visitDate);
    const followUpDate = this.toHebrewDate(visit.followUpDate ?? null);

    const vitalsParts = [
      visit.bloodPressure ? `לחץ דם: ${visit.bloodPressure}` : null,
      visit.pulse ? `דופק: ${visit.pulse}` : null,
      visit.bodyTemp ? `חום: ${visit.bodyTemp}` : null,
      visit.oxygenSat ? `סטורציה: ${visit.oxygenSat}` : null,
      visit.weight ? `משקל: ${visit.weight}` : null,
      visit.height ? `גובה: ${visit.height}` : null,
    ].filter(Boolean) as string[];

    const diagnoses = (visit.diagnoses ?? [])
      .map((d) => d.diagnosis?.description || d.diagnosis?.code)
      .filter(Boolean)
      .join(' | ');

    const medicines = (visit.medicines ?? [])
      .map((m) => {
        const medicineName = m.medicine?.name ?? 'תרופה';
        const details = [m.dosage, m.frequency, m.duration]
          .filter(Boolean)
          .join(' · ');
        return details ? `${medicineName} (${details})` : medicineName;
      })
      .filter(Boolean)
      .join(' | ');

    const findingsText = [
      summarySections.findings,
      visit.chiefComplaint ? `תלונה ראשית: ${visit.chiefComplaint}` : '',
      vitalsParts.length ? `מדדים: ${vitalsParts.join(' | ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const diagnosisText = [summarySections.diagnosis, diagnoses]
      .filter(Boolean)
      .join('\n');

    const recommendationsText = [
      summarySections.recommendations,
      medicines ? `טיפול תרופתי: ${medicines}` : '',
      visit.referralNotes ? `הפניות/הערות: ${visit.referralNotes}` : '',
      followUpDate !== '-' ? `תאריך מעקב: ${followUpDate}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const sectionHtml = (title: string, content: string) => `
      <section class="section">
        <h3>${this.sanitizeHtml(title)}</h3>
        <p>${this.sanitizeHtml(content || 'לא תועד מידע בסעיף זה.').replace(/\n/g, '<br/>')}</p>
      </section>
    `;

    return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>סיכום ביקור - MedSync</title>
    <style>
      :root {
        --brand: #1b4965;
        --accent: #5fa8d3;
        --border: #d9e2ec;
        --text: #102a43;
        --muted: #486581;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        font-family: ${this.getPreferredFontStack()};
        color: var(--text);
        background: #ffffff;
        direction: rtl;
      }
      .sheet {
        padding: 28px 34px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid var(--brand);
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .logo {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: 0.4px;
        color: var(--brand);
      }
      .subtitle {
        font-size: 13px;
        color: var(--muted);
        margin-top: 2px;
      }
      .doc-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--brand);
      }
      .top-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 18px;
      }
      .meta {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px 14px;
        background: #f8fbff;
      }
      .meta h4 {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: var(--brand);
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
        line-height: 1.55;
      }
      .meta-row .label {
        color: var(--muted);
      }
      .section {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 10px;
      }
      .section h3 {
        margin: 0 0 8px 0;
        font-size: 15px;
        color: var(--brand);
      }
      .section p {
        margin: 0;
        font-size: 13px;
        white-space: normal;
        line-height: 1.7;
      }
      .footer {
        margin-top: 20px;
        border-top: 1px dashed var(--border);
        padding-top: 8px;
        font-size: 11px;
        color: var(--muted);
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <header class="header">
        <div>
          <div class="logo">MedSync</div>
          <div class="subtitle">מערכת תיעוד וסיכומי ביקור רפואיים</div>
        </div>
        <div class="doc-title">סיכום ביקור רפואי</div>
      </header>

      <section class="top-grid">
        <article class="meta">
          <h4>פרטי מטופל</h4>
          <div class="meta-row"><span class="label">שם מלא</span><strong>${this.sanitizeHtml(patientName)}</strong></div>
          <div class="meta-row"><span class="label">תעודת זהות</span><strong>${this.sanitizeHtml(patientIdNumber)}</strong></div>
        </article>

        <article class="meta">
          <h4>פרטי ביקור ורופא</h4>
          <div class="meta-row"><span class="label">שם רופא</span><strong>${this.sanitizeHtml(doctorName)}</strong></div>
          <div class="meta-row"><span class="label">התמחות</span><strong>${this.sanitizeHtml(doctorSpecialty)}</strong></div>
          <div class="meta-row"><span class="label">תאריך ביקור</span><strong>${this.sanitizeHtml(visitDate)}</strong></div>
        </article>
      </section>

      ${sectionHtml('תלונת המטופל', summarySections.complaints || visit.chiefComplaint || '')}
      ${sectionHtml('ממצאים', findingsText)}
      ${sectionHtml('אבחנה', diagnosisText)}
      ${sectionHtml('המלצות וטיפול', recommendationsText)}

      <footer class="footer">
        מסמך זה הופק אוטומטית על ידי MedSync • לשימוש רפואי פנימי
      </footer>
    </div>
  </body>
</html>`;
  }

  async generateVisitSummaryPdf(visit: Visit): Promise<Buffer> {
    const html = this.buildSummaryPdfHtml(visit);

    // Dynamic import required: puppeteer is ESM-only and cannot be statically required
    const { default: puppeteer } = await import('puppeteer');

    let browser: Awaited<ReturnType<typeof puppeteer.launch>>;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (error) {
      this.logger.error(
        `Puppeteer failed to launch: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ServiceUnavailableException(
        'PDF generation is unavailable — Chrome/Chromium is not installed on the server',
      );
    }
    let page: Awaited<ReturnType<typeof browser.newPage>> | null = null;

    try {
      page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          bottom: '10mm',
          left: '8mm',
          right: '8mm',
        },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      try {
        if (page) {
          await page.close().catch(() => undefined);
        }
      } finally {
        await browser.close().catch(() => undefined);
      }
    }
  }

  async getVisitRecords(
    patientId?: string,
    caregiverId?: string,
    actingClinicId?: string,
    page?: number,
    limit?: number,
  ): Promise<Visit[] | PaginatedResult<Visit>> {
    const qb = this.visits
      .createQueryBuilder('visit')
      .leftJoinAndSelect('visit.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('visit.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'caregiverUser')
      .leftJoinAndSelect('visit.summary', 'summary')
      .leftJoinAndSelect('visit.recording', 'recording')
      .orderBy('visit.visitDate', 'DESC')
      .addOrderBy('visit.id', 'DESC');

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

    if (page === undefined && limit === undefined) {
      return qb.getMany();
    }

    const pagination = resolvePagination(page, limit);
    qb.skip(pagination.skip).take(pagination.take);
    const [items, total] = await qb.getManyAndCount();
    return toPaginatedResult(items, total, pagination);
  }

  async getVisitRecordById(visitId: string): Promise<Visit> {
    const visit = await this.visits.findOne({
      where: { id: visitId },
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
    if (!visit) throw new NotFoundException(`Visit ${visitId} not found`);
    return visit;
  }

  async createVisitRecord(input: VisitInput): Promise<Visit> {
    if (!input?.patientId || !input?.caregiverId || !input?.visitDate) {
      throw new BadRequestException(
        'patientId, caregiverId and visitDate are required',
      );
    }

    // visitType and followUpDate are scheduling metadata — not clinical content.
    const hasContent =
      input.bloodPressure?.trim() ||
      input.pulse?.trim() ||
      input.bodyTemp?.trim() ||
      input.weight?.trim() ||
      input.height?.trim() ||
      input.oxygenSat?.trim() ||
      input.chiefComplaint?.trim() ||
      input.referralNotes?.trim();
    if (!hasContent) {
      throw new BadRequestException('לא ניתן לשמור ביקור ריק — יש להזין לפחות שדה אחד');
    }
    if (input.actingUserId) {
      const patient = await this.patientsRepo.findOne({
        where: { id: input.patientId },
        select: ['id', 'userId'],
      });
      if (patient && patient.userId === input.actingUserId) {
        throw new BadRequestException(
          'לא ניתן ליצור ביקור עבור עצמך',
        );
      }
    }
    if (input.slotId) {
      const slot = await this.slots.findOne({
        where: { id: input.slotId },
        relations: ['visit'],
      });
      if (!slot) {
        throw new NotFoundException('התור לא נמצא');
      }
      if (slot.status !== SlotStatus.SCHEDULED) {
        throw new BadRequestException('לא ניתן ליצור ביקור עבור תור שבוטל');
      }
      if (slot.caregiverId !== input.caregiverId) {
        throw new ForbiddenException('התור אינו שייך למטפל זה');
      }
      if (slot.patientId !== input.patientId) {
        throw new BadRequestException('התור אינו שייך למטופל זה');
      }
      if (slot.visit) {
        throw new ConflictException('כבר קיים ביקור עבור תור זה');
      }
      if (!this.isSameDay(slot.slotTime, new Date())) {
        throw new BadRequestException('ניתן לפתוח ביקור לתור רק ביום התור');
      }
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

    return this.getVisitRecordById(saved.id);
  }

  async updateVisitRecordById(
    visitId: string,
    input: Partial<VisitInput>,
  ): Promise<Visit> {
    const visit = await this.getEditableVisitById(visitId);
    
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
    // patientId and caregiverId are intentionally not updatable after creation.
    await this.visits.save(visit);
    return this.getVisitRecordById(visitId);
  }

  async deleteVisitRecordById(visitId: string): Promise<void> {
    await this.getEditableVisitById(visitId);
    
    const result = await this.visits.delete(visitId);
    if (!result.affected)
      throw new NotFoundException(`Visit ${visitId} not found`);
  }

  // -------- recording --------
  async upsertVisitRecordingByVisitId(
    visitId: string,
    input: VisitRecordingInput,
  ): Promise<VisitRecording> {
    await this.getEditableVisitById(visitId);
    
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
  async upsertVisitSummaryByVisitId(
    visitId: string,
    input: VisitSummaryInput,
  ): Promise<VisitSummary> {
    const visit = await this.getEditableVisitById(visitId);
    
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
        .generateAndSavePatientMedicalSummary(visit.patientId)
        .catch((e) =>
          this.logger.error(`Medical summary trigger failed: ${e instanceof Error ? e.message : String(e)}`),
        );
    }

    return saved;
  }

  // -------- diagnoses --------
  async addDiagnosisToVisit(
    visitId: string,
    input: VisitDiagnosisInput,
  ): Promise<VisitDiagnosis> {
    await this.getEditableVisitById(visitId);
    
    let diagnosisId = input.diagnosisId;
    if (!diagnosisId) {
      if (!input.diagnosisCode) {
        throw new BadRequestException('diagnosisId or diagnosisCode is required');
      }
      const diag = await this.diagnosesService.getOrCreateDiagnosisByCode(
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

  async removeDiagnosisFromVisit(
    visitId: string,
    diagnosisId: string,
  ): Promise<void> {
    const result = await this.visitDiagnoses.delete({ visitId, diagnosisId });
    if (!result.affected)
      throw new NotFoundException('Visit diagnosis link not found');
  }

  // -------- medicines --------
  async addMedicineToVisit(
    visitId: string,
    input: VisitMedicineInput,
  ): Promise<VisitMedicine> {
    await this.getEditableVisitById(visitId);
    
    let medicineId = input.medicineId;
    if (!medicineId) {
      if (!input.medicineName) {
        throw new BadRequestException('medicineId or medicineName is required');
      }
      const med = await this.medicinesService.getOrCreateMedicineByName(
        input.medicineName,
      );
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

  async removeMedicineFromVisit(
    visitId: string,
    medicineId: string,
  ): Promise<void> {
    const result = await this.visitMedicines.delete({ visitId, medicineId });
    if (!result.affected)
      throw new NotFoundException('Visit medicine link not found');
  }
}
