import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { PatientClinicalAlert } from '../entities/patientClinicalAlert/patientClinicalAlertEntity';
import { Patient } from '../entities/patient/patientEntity';
import { PatientMedicalSummary } from '../entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { VisitSummary } from '../entities/visitSummary/visitSummaryEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import {
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
  ClinicalAlertSource,
} from '../entities/enums';
import {
  BulkRegenerateResult,
  ClinicalAlertDto,
  CreateManualAlertDto,
} from './clinical-alerts.types';

const EXTRACTION_PROMPT = `אתה עוזר רפואי שמזהה אלמנטים קליניים קריטיים בלבד.
על סמך הנתונים הבאים, החזר רשימת התראות שהרופא חייב לדעת לפני טיפול במטופל.

קטגוריות מותרות (אסור להמציא אחרות):
- "ALLERGY" — אלרגיה משמעותית (תרופתית, מזון, חומרים).
- "LIFE_THREATENING" — סכנת חיים אקטיבית או מצב חמור לא מאוזן (אנפילקסיס, אי-ספיקת לב חמורה, מחלה ממארת פעילה, נטילת מדללי דם וכד׳).
- "CHRONIC" — מחלה כרונית קבועה שמשפיעה על טיפול (סוכרת, יתר ל"ד, COPD, אסתמה, מחלת כליה כרונית וכד׳).

רמות חומרה:
- "HIGH" — סכנה מיידית או אנפילקסיס.
- "MEDIUM" — מחלה כרונית משמעותית או מצב לא מאוזן.
- "LOW" — מצב מאוזן/קל.

חוקים חמורים לפלט:
1. החזר JSON תקין בלבד, ללא טקסט נלווה, ללא code fences, ללא \`\`\`.
2. שדה "label" עד 6 מילים בעברית, ללא משפט, ללא פעולות, ללא המלצות, ללא מינונים, ללא תאריכים. רק שם המצב/האלרגיה.
3. אסור לכלול מידע דמוגרפי (שם, גיל, מין, כתובת, קופ"ח).
4. אסור לכלול ממצאים זמניים (חום, כאב גרון, צינון).
5. אם אין מידע משמעותי בקטגוריה — אל תחזיר פריט בקטגוריה הזו.
6. אסור פריטים כפולים.

מבנה התשובה — מערך של אובייקטים בלבד:
[
  { "category": "ALLERGY" | "LIFE_THREATENING" | "CHRONIC", "severity": "HIGH" | "MEDIUM" | "LOW", "label": "..." }
]

אם אין שום התראה — החזר [] בלבד.

נתוני המטופל:
`;

interface ExtractedAlert {
  category: ClinicalAlertCategory;
  severity: ClinicalAlertSeverity;
  label: string;
}

@Injectable()
export class ClinicalAlertsService implements OnModuleInit {
  private readonly logger = new Logger(ClinicalAlertsService.name);
  private model: GenerativeModel | undefined;

  constructor(
    @InjectRepository(PatientClinicalAlert)
    private readonly alertsRepo: Repository<PatientClinicalAlert>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(PatientMedicalSummary)
    private readonly summaryRepo: Repository<PatientMedicalSummary>,
    @InjectRepository(VisitSummary)
    private readonly visitSummaryRepo: Repository<VisitSummary>,
    @InjectRepository(DocumentSummary)
    private readonly documentSummaryRepo: Repository<DocumentSummary>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.model = undefined;
      this.logger.warn(
        'GEMINI_API_KEY not set — clinical alert AI extraction disabled (existing alerts preserved).',
      );
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  private normalize(text: string): string {
    return text
      .normalize('NFKD')
      .replace(/[\u0591-\u05C7]/g, '') // Hebrew niqqud / cantillation
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }

  private toDto(a: PatientClinicalAlert): ClinicalAlertDto {
    return {
      id: a.id,
      category: a.category,
      severity: a.severity,
      label: a.label,
      source: a.source,
    };
  }

  private severityOrder(s: ClinicalAlertSeverity): number {
    if (s === ClinicalAlertSeverity.HIGH) return 0;
    if (s === ClinicalAlertSeverity.MEDIUM) return 1;
    return 2;
  }

  private categoryOrder(c: ClinicalAlertCategory): number {
    if (c === ClinicalAlertCategory.LIFE_THREATENING) return 0;
    if (c === ClinicalAlertCategory.ALLERGY) return 1;
    return 2;
  }

  private sortAlerts(alerts: PatientClinicalAlert[]): PatientClinicalAlert[] {
    return alerts.sort((a, b) => {
      const sev = this.severityOrder(a.severity) - this.severityOrder(b.severity);
      if (sev !== 0) return sev;
      const cat = this.categoryOrder(a.category) - this.categoryOrder(b.category);
      if (cat !== 0) return cat;
      return a.label.localeCompare(b.label, 'he');
    });
  }

  async getForPatient(patientId: string): Promise<ClinicalAlertDto[]> {
    const rows = await this.alertsRepo.find({ where: { patientId } });
    return this.sortAlerts(rows).map((a) => this.toDto(a));
  }

  private stripCodeFences(text: string): string {
    let t = text.trim();
    if (t.startsWith('```')) {
      t = t.replace(/^```(?:json)?\s*/i, '');
      if (t.endsWith('```')) t = t.slice(0, -3);
    }
    return t.trim();
  }

  private parseAlerts(raw: string): ExtractedAlert[] {
    const cleaned = this.stripCodeFences(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // try to locate the first JSON array in the text
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) return [];
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(parsed)) return [];

    const validCategories = new Set(Object.values(ClinicalAlertCategory));
    const validSeverities = new Set(Object.values(ClinicalAlertSeverity));
    const result: ExtractedAlert[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const obj = item as Record<string, unknown>;
      const category = obj.category;
      const severity = obj.severity;
      const label = obj.label;
      if (
        typeof category !== 'string' ||
        typeof severity !== 'string' ||
        typeof label !== 'string'
      ) {
        continue;
      }
      if (!validCategories.has(category as ClinicalAlertCategory)) continue;
      if (!validSeverities.has(severity as ClinicalAlertSeverity)) continue;
      const trimmed = label.trim().slice(0, 80);
      if (!trimmed) continue;
      result.push({
        category: category as ClinicalAlertCategory,
        severity: severity as ClinicalAlertSeverity,
        label: trimmed,
      });
    }
    return result;
  }

  private async loadPatientContext(patientId: string): Promise<string> {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) return '';

    const [summary, visitSummaries, docSummaries] = await Promise.all([
      this.summaryRepo.findOne({ where: { patientId } }),
      this.visitSummaryRepo
        .createQueryBuilder('vs')
        .innerJoin('vs.visit', 'v')
        .where('v.patient_id = :patientId', { patientId })
        .select(['vs.summaryText', 'vs.createdAt'])
        .orderBy('vs.createdAt', 'ASC')
        .getMany(),
      this.documentSummaryRepo
        .createQueryBuilder('ds')
        .innerJoin('ds.document', 'd')
        .where('d.patient_id = :patientId', { patientId })
        .select(['ds.summaryText', 'ds.createdAt'])
        .orderBy('ds.createdAt', 'ASC')
        .getMany(),
    ]);

    const parts: string[] = [];
    if (patient.notes && patient.notes.trim()) {
      parts.push(`הערות מטופל:\n${patient.notes.trim()}`);
    }
    if (summary?.summaryText) {
      parts.push(`סיכום רפואי קיים:\n${summary.summaryText}`);
    }
    if (visitSummaries.length > 0) {
      const text = visitSummaries
        .map((vs, i) => `ביקור ${i + 1}:\n${vs.summaryText}`)
        .join('\n\n');
      parts.push(`סיכומי ביקורים:\n${text}`);
    }
    if (docSummaries.length > 0) {
      const text = docSummaries
        .map((ds, i) => `מסמך ${i + 1}:\n${ds.summaryText}`)
        .join('\n\n');
      parts.push(`סיכומי מסמכים:\n${text}`);
    }
    return parts.join('\n\n');
  }

  async regenerateForPatient(patientId: string): Promise<ClinicalAlertDto[]> {
    if (!this.model) {
      this.logger.warn(
        `Skipping clinical alert regeneration for patient ${patientId}: Gemini disabled.`,
      );
      return this.getForPatient(patientId);
    }
    const context = await this.loadPatientContext(patientId);

    let extracted: ExtractedAlert[] = [];
    if (context.trim()) {
      try {
        const result = await this.model.generateContent(
          `${EXTRACTION_PROMPT}${context}`,
        );
        extracted = this.parseAlerts(result.response.text());
      } catch (err) {
        this.logger.error(
          `Gemini extraction failed for patient ${patientId}: ${err instanceof Error ? err.message : String(err)}`,
        );
        // Preserve existing alerts on AI failure rather than wiping them.
        return this.getForPatient(patientId);
      }
    }

    // Dedupe by (category + normalizedKey) within the AI result itself.
    const seen = new Set<string>();
    const aiRows = extracted
      .map((e) => ({
        ...e,
        normalizedKey: this.normalize(e.label),
      }))
      .filter((e) => {
        if (!e.normalizedKey) return false;
        const key = `${e.category}::${e.normalizedKey}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(PatientClinicalAlert);
      await repo.delete({ patientId, source: ClinicalAlertSource.AI });
      if (aiRows.length === 0) return;

      // Drop any AI row that would collide with an existing MANUAL row
      // on the same (patient, category, normalizedKey) — MANUAL wins.
      const manualRows = await repo.find({
        where: { patientId, source: ClinicalAlertSource.MANUAL },
      });
      const manualKeys = new Set(
        manualRows.map((r) => `${r.category}::${r.normalizedKey}`),
      );
      const toInsert = aiRows
        .filter((r) => !manualKeys.has(`${r.category}::${r.normalizedKey}`))
        .map((r) =>
          repo.create({
            patientId,
            category: r.category,
            severity: r.severity,
            label: r.label,
            normalizedKey: r.normalizedKey,
            source: ClinicalAlertSource.AI,
          }),
        );
      if (toInsert.length > 0) {
        await repo.save(toInsert);
      }
    });

    this.logger.log(
      `Clinical alerts regenerated for patient ${patientId} (${aiRows.length} AI rows)`,
    );
    return this.getForPatient(patientId);
  }

  async regenerateAll(): Promise<BulkRegenerateResult> {
    const patients = await this.patientRepo.find({ select: ['id'] });
    let succeeded = 0;
    let failed = 0;
    for (const p of patients) {
      try {
        await this.regenerateForPatient(p.id);
        succeeded++;
      } catch (e) {
        failed++;
        this.logger.error(
          `Bulk clinical alert regen failed for patient ${p.id}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
    return { total: patients.length, succeeded, failed };
  }

  async createManualAlert(
    patientId: string,
    input: CreateManualAlertDto,
  ): Promise<ClinicalAlertDto> {
    const label = (input?.label ?? '').trim();
    if (!label) throw new BadRequestException('label is required');
    if (label.length > 80) {
      throw new BadRequestException('label must be 80 characters or fewer');
    }
    const validSeverities = new Set(Object.values(ClinicalAlertSeverity));
    if (!validSeverities.has(input.severity)) {
      throw new BadRequestException('invalid severity');
    }
    const validCategories = new Set(Object.values(ClinicalAlertCategory));
    const category = input.category ?? ClinicalAlertCategory.ALLERGY;
    if (!validCategories.has(category)) {
      throw new BadRequestException('invalid category');
    }
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException(`Patient ${patientId} not found`);

    const normalizedKey = this.normalize(label);
    if (!normalizedKey) {
      throw new BadRequestException('label cannot be empty after normalization');
    }

    const existing = await this.alertsRepo.findOne({
      where: {
        patientId,
        category,
        normalizedKey,
      },
    });
    if (existing) {
      // Promote to MANUAL if it was AI; otherwise return as-is.
      if (existing.source !== ClinicalAlertSource.MANUAL) {
        existing.source = ClinicalAlertSource.MANUAL;
        existing.severity = input.severity;
        existing.label = label;
        await this.alertsRepo.save(existing);
      }
      return this.toDto(existing);
    }

    const saved = await this.alertsRepo.save(
      this.alertsRepo.create({
        patientId,
        category,
        severity: input.severity,
        label,
        normalizedKey,
        source: ClinicalAlertSource.MANUAL,
      }),
    );
    return this.toDto(saved);
  }

  async deleteManualAlert(patientId: string, alertId: string): Promise<void> {
    const alert = await this.alertsRepo.findOne({
      where: { id: alertId, patientId },
    });
    if (!alert) throw new NotFoundException(`Alert ${alertId} not found`);
    if (alert.source !== ClinicalAlertSource.MANUAL) {
      throw new ForbiddenException('Only manual alerts can be deleted');
    }
    await this.alertsRepo.delete({ id: alertId });
  }
}
