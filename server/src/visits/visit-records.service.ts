import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import pdfmake = require('pdfmake');
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

  private resolvePdfFontPath(): string | undefined {
    // 1. Prefer the full TTF committed under assets/fonts (copied to dist/ by nest build).
    const bundledCandidates = [
      path.join(__dirname, 'assets', 'fonts', 'NotoSansHebrew.ttf'),
      path.join(__dirname, '..', 'assets', 'fonts', 'NotoSansHebrew.ttf'),
      path.join(process.cwd(), 'dist', 'assets', 'fonts', 'NotoSansHebrew.ttf'),
      path.join(process.cwd(), 'src', 'assets', 'fonts', 'NotoSansHebrew.ttf'),
    ];
    for (const candidate of bundledCandidates) {
      if (existsSync(candidate)) return candidate;
    }

    // 2. Fallback to @fontsource subsets (latin subset for partial coverage).
    const fontFiles = [
      'noto-sans-hebrew-latin-400-normal.woff',
      'noto-sans-hebrew-hebrew-400-normal.woff2',
      'noto-sans-hebrew-hebrew-400-normal.woff',
    ];
    const packageRoots: string[] = [];
    try {
      packageRoots.push(
        path.dirname(require.resolve('@fontsource/noto-sans-hebrew/package.json')),
      );
    } catch {
      // Not resolvable from this module; fall back to the cwd lookup below.
    }
    packageRoots.push(
      path.join(process.cwd(), 'node_modules', '@fontsource', 'noto-sans-hebrew'),
    );
    for (const root of packageRoots) {
      for (const fontFile of fontFiles) {
        const fontPath = path.join(root, 'files', fontFile);
        if (existsSync(fontPath)) return fontPath;
      }
    }

    return undefined;
  }

  private buildSummaryPdfData(visit: Visit) {
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

    return {
      patientName,
      patientIdNumber,
      doctorName,
      doctorSpecialty,
      visitDate,
      followUpDate,
      complaints: summarySections.complaints || visit.chiefComplaint || '',
      findings: findingsText,
      diagnosis: diagnosisText,
      recommendations: recommendationsText,
    };
  }

  async generateVisitSummaryPdf(visit: Visit): Promise<Buffer> {
    const data = this.buildSummaryPdfData(visit);
    const fontPath = this.resolvePdfFontPath();
    if (!fontPath) {
      throw new ServiceUnavailableException(
        'PDF generation is unavailable because no Unicode font was found on the server',
      );
    }

    try {
      // Allow reading only the bundled Hebrew font file. Every other local path
      // and all remote URLs stay blocked, so a malicious document definition
      // cannot pull arbitrary files off the server.
      const allowedFontPath = path.resolve(fontPath);
      pdfmake.setLocalAccessPolicy(
        (requestedPath: string) => path.resolve(requestedPath) === allowedFontPath,
      );
      pdfmake.setUrlAccessPolicy(() => false);
      pdfmake.setFonts({
        NotoSansHebrew: {
          normal: fontPath,
          bold: fontPath,
          italics: fontPath,
          bolditalics: fontPath,
        },
      });

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [36, 36, 36, 36],
        defaultStyle: {
          font: 'NotoSansHebrew',
          fontSize: 11,
          alignment: 'right' as const,
          lineHeight: 1.3,
        },
        content: [
          { text: 'MedSync', style: 'brand' },
          { text: 'מערכת תיעוד וסיכומי ביקור רפואיים', style: 'subtitle' },
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 523,
                y2: 0,
                lineWidth: 1,
                lineColor: '#d9e2ec',
              },
            ],
            margin: [0, 4, 0, 10],
          },
          { text: 'סיכום ביקור רפואי', style: 'docTitle' },
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    fillColor: '#f8fbff',
                    stack: [
                      { text: 'פרטי מטופל', style: 'metaTitle' },
                      {
                        text: [`שם מלא: ${data.patientName}`, `תעודת זהות: ${data.patientIdNumber}`].join('\n'),
                        style: 'metaText',
                      },
                    ],
                  },
                  {
                    fillColor: '#f8fbff',
                    stack: [
                      { text: 'פרטי ביקור ורופא', style: 'metaTitle' },
                      {
                        text: [
                          `שם רופא: ${data.doctorName}`,
                          `התמחות: ${data.doctorSpecialty}`,
                          `תאריך ביקור: ${data.visitDate}`,
                        ].join('\n'),
                        style: 'metaText',
                      },
                    ],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingLeft: () => 12,
              paddingRight: () => 12,
              paddingTop: () => 10,
              paddingBottom: () => 10,
            },
            margin: [0, 0, 0, 14],
          },
          { text: 'תלונת המטופל', style: 'sectionTitle' },
          { text: data.complaints || 'לא תועד מידע בסעיף זה.', style: 'sectionText' },
          { text: 'ממצאים', style: 'sectionTitle' },
          { text: data.findings || 'לא תועד מידע בסעיף זה.', style: 'sectionText' },
          { text: 'אבחנה', style: 'sectionTitle' },
          { text: data.diagnosis || 'לא תועד מידע בסעיף זה.', style: 'sectionText' },
          { text: 'המלצות וטיפול', style: 'sectionTitle' },
          { text: data.recommendations || 'לא תועד מידע בסעיף זה.', style: 'sectionText' },
          { text: 'מסמך זה הופק אוטומטית על ידי MedSync • לשימוש רפואי פנימי', style: 'footer' },
        ],
        styles: {
          brand: { fontSize: 26, color: '#1b4965', bold: true, margin: [0, 0, 0, 2] },
          subtitle: { fontSize: 11, color: '#486581', margin: [0, 0, 0, 8] },
          docTitle: { fontSize: 18, color: '#1b4965', bold: true, margin: [0, 0, 0, 12] },
          metaTitle: { fontSize: 13, color: '#1b4965', bold: true, margin: [0, 0, 0, 6] },
          metaTable: { fontSize: 11, color: '#102a43', margin: [0, 0, 0, 0], lineHeight: 1.4 },
          metaText: { fontSize: 11, color: '#102a43', lineHeight: 1.4 },
          sectionTitle: { fontSize: 13, color: '#1b4965', bold: true, margin: [0, 0, 0, 4] },
          sectionText: { fontSize: 11, color: '#102a43', lineHeight: 1.4, margin: [0, 0, 0, 10] },
          footer: { fontSize: 10, color: '#486581', alignment: 'center', margin: [0, 12, 0, 0] },
        },
      };

      const output = pdfmake.createPdf(docDefinition);
      return await output.getBuffer();
    } catch (error) {
      this.logger.error(
        `Visit summary PDF generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ServiceUnavailableException(
        'PDF generation failed for this visit summary',
      );
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
