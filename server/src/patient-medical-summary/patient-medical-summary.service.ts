import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { PatientMedicalSummary } from '../entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { Patient } from '../entities/patient/patientEntity';
import { VisitSummary } from '../entities/visitSummary/visitSummaryEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { PatientClinicalAlert } from '../entities/patientClinicalAlert/patientClinicalAlertEntity';
import {
  ClinicalAlertCategory,
  ClinicalAlertSource,
} from '../entities/enums';
import { ClinicalAlertsService } from '../clinical-alerts/clinical-alerts.service';

const INITIAL_PROMPT = `אתה מנתח נתונים רפואיים המסייע לרופאים.
צור סיכום רפואי מקיף עבור הרופא על סמך המידע הבא.
הסיכום מיועד לשימוש פנימי רפואי בלבד.

אל תכתוב מחדש פרטים דמוגרפיים של המטופל (שם, תאריך לידה, קופת חולים, סוג דם, כתובת, טלפון) — הם מוצגים במקום אחר במסך. התמקד במידע קליני בלבד.

כתוב את הסיכום בעברית בלבד, בפסקאות ברורות.
השתמש בכותרות הבאות בדיוק, כל כותרת בשורה נפרדת:
מחלות כרוניות
תרופות קבועות
היסטוריה רפואית רלוונטית
מה חשוב לדעת לפני ביקור

תחת כל כותרת תן 1-2 משפטים קצרים או רשימה ממוספרת בפורמט “1. פריט ראשון” בשורה נפרדת לכל פריט.
השאר שורה ריקה בין כותרות להפרדה ברורה.

תחת הכותרת "מה חשוב לדעת לפני ביקור" כתוב אך ורק עובדות ומידע על המטופל שהרופא חייב לדעת (למשל: אלרגיות, רגישויות, מצבים פעילים, ממצאים חריגים, התראות בטיחות). אל תכתוב המלצות, הצעות, פעולות לביצוע, או הנחיות לרופא מה לעשות, לבדוק, לשאול או לעקוב אחריו. רק עובדות.

חשוב: פלט טקסט רגיל בלבד. אין להשתמש ב-Markdown, כוכביות, סולמיות, מקפים לרשימות, או כל סמל עיצוב אחר.

נתוני המטופל:
`;

const UPDATE_PROMPT = `אתה מנתח נתונים רפואיים המסייע לרופאים.
עדכן את הסיכום הרפואי הקיים בהתאם לנתונים החדשים שהתווספו.
שמור על המידע הקיים אם הוא עדיין רלוונטי, ועדכן או הוסף מידע על סמך הנתונים החדשים.

אל תכתוב מחדש פרטים דמוגרפיים של המטופל (שם, תאריך לידה, קופת חולים, סוג דם, כתובת, טלפון) — הם מוצגים במקום אחר במסך. התמקד במידע קליני בלבד.

כתוב את הסיכום בעברית בלבד, בפסקאות ברורות.
השתמש בכותרות הבאות בדיוק, כל כותרת בשורה נפרדת:
מחלות כרוניות
תרופות קבועות
היסטוריה רפואית רלוונטית
מה חשוב לדעת לפני ביקור

תחת כל כותרת תן 1-2 משפטים קצרים או רשימה ממוספרת בפורמט “1. פריט ראשון” בשורה נפרדת לכל פריט.
השאר שורה ריקה בין כותרות להפרדה ברורה.

תחת הכותרת "מה חשוב לדעת לפני ביקור" כתוב אך ורק עובדות ומידע על המטופל שהרופא חייב לדעת (למשל: אלרגיות, רגישויות, מצבים פעילים, ממצאים חריגים, התראות בטיחות). אל תכתוב המלצות, הצעות, פעולות לביצוע, או הנחיות לרופא מה לעשות, לבדוק, לשאול או לעקוב אחריו. רק עובדות.

חשוב: פלט טקסט רגיל בלבד. אין להשתמש ב-Markdown, כוכביות, סולמיות, מקפים לרשימות, או כל סמל עיצוב אחר.

`;

@Injectable()
export class PatientMedicalSummaryService implements OnModuleInit {
  private readonly logger = new Logger(PatientMedicalSummaryService.name);
  private model: GenerativeModel | undefined;
  private readonly inFlight = new Map<string, Promise<void>>();

  constructor(
    @InjectRepository(PatientMedicalSummary)
    private readonly summaryRepo: Repository<PatientMedicalSummary>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(VisitSummary)
    private readonly visitSummaryRepo: Repository<VisitSummary>,
    @InjectRepository(DocumentSummary)
    private readonly documentSummaryRepo: Repository<DocumentSummary>,
    @InjectRepository(PatientClinicalAlert)
    private readonly clinicalAlertRepo: Repository<PatientClinicalAlert>,
    private readonly configService: ConfigService,
    private readonly clinicalAlertsService: ClinicalAlertsService,
  ) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.model = undefined;
      this.logger.warn(
        'GEMINI_API_KEY not set — patient medical summary generation disabled.',
      );
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  private async loadManualAlertsBlock(patientId: string): Promise<string> {
    const alerts = await this.clinicalAlertRepo.find({
      where: { patientId, source: ClinicalAlertSource.MANUAL },
      select: ['category', 'severity', 'label'],
      order: { createdAt: 'ASC' },
    });
    if (alerts.length === 0) return '';
    const categoryLabel: Record<ClinicalAlertCategory, string> = {
      [ClinicalAlertCategory.ALLERGY]: 'אלרגיה',
      [ClinicalAlertCategory.LIFE_THREATENING]: 'סכנת חיים',
      [ClinicalAlertCategory.CHRONIC]: 'מחלה כרונית',
    };
    const lines = alerts.map(
      (a) =>
        `- [${categoryLabel[a.category] ?? a.category}] ${a.label} (חומרה: ${a.severity})`,
    );
    return `התראות קליניות שהוגדרו ידנית על ידי הצוות הרפואי (חייב לשקלל בסיכום):\n${lines.join('\n')}`;
  }

  async generateAndSave(patientId: string): Promise<void> {
    const existing = this.inFlight.get(patientId);
    if (existing) return existing;
    const promise = this.doGenerateAndSave(patientId).finally(() => {
      this.inFlight.delete(patientId);
    });
    this.inFlight.set(patientId, promise);
    return promise;
  }

  private async doGenerateAndSave(patientId: string): Promise<void> {
    if (!this.model) {
      this.logger.warn(
        `Skipping medical summary generation for patient ${patientId}: Gemini disabled.`,
      );
      return;
    }
    try {
      // Load unprocessed visit summaries for this patient
      const newVisitSummaries = await this.visitSummaryRepo
        .createQueryBuilder('vs')
        .innerJoin('vs.visit', 'v')
        .where('v.patient_id = :patientId', { patientId })
        .andWhere('vs.included_in_medical_summary = false')
        .select(['vs.id', 'vs.summaryText', 'vs.createdAt'])
        .getMany();

      // Load unprocessed document summaries for this patient
      const newDocSummaries = await this.documentSummaryRepo
        .createQueryBuilder('ds')
        .innerJoin('ds.document', 'd')
        .where('d.patient_id = :patientId', { patientId })
        .andWhere('ds.included_in_medical_summary = false')
        .select(['ds.id', 'ds.summaryText', 'ds.createdAt'])
        .getMany();

      if (newVisitSummaries.length === 0 && newDocSummaries.length === 0) {
        return; // Nothing new to process
      }

      // Load existing summary (null if first run)
      const existing = await this.summaryRepo.findOne({
        where: { patientId },
      });

      const visitTexts = newVisitSummaries
        .map(
          (vs, i) =>
            `ביקור ${i + 1} (${new Date(vs.createdAt).toLocaleDateString('he-IL')}):\n${vs.summaryText}`,
        )
        .join('\n\n');

      const docTexts = newDocSummaries
        .map(
          (ds, i) =>
            `מסמך ${i + 1} (${new Date(ds.createdAt).toLocaleDateString('he-IL')}):\n${ds.summaryText}`,
        )
        .join('\n\n');

      let prompt: string;

      const manualAlertsBlock = await this.loadManualAlertsBlock(patientId);

      if (!existing) {
        // Initial generation
        const context = [
          newVisitSummaries.length > 0
            ? `סיכומי ביקורים:\n${visitTexts}`
            : '',
          newDocSummaries.length > 0 ? `סיכומי מסמכים:\n${docTexts}` : '',
          manualAlertsBlock,
        ]
          .filter(Boolean)
          .join('\n\n');
        prompt = `${INITIAL_PROMPT}${context}`;
      } else {
        // Incremental update
        const newData = [
          newVisitSummaries.length > 0
            ? `נתונים חדשים מביקורים:\n${visitTexts}`
            : '',
          newDocSummaries.length > 0
            ? `נתונים חדשים ממסמכים:\n${docTexts}`
            : '',
          manualAlertsBlock,
        ]
          .filter(Boolean)
          .join('\n\n');

        prompt = [
          UPDATE_PROMPT,
          `סיכום קיים:\n${existing.summaryText}`,
          `\n${newData}`,
        ].join('\n');
      }

      const result = await this.model.generateContent(prompt);
      const summaryText = result.response.text();

      // Upsert patient_medical_summaries
      if (existing) {
        existing.summaryText = summaryText;
        existing.generatedAt = new Date();
        await this.summaryRepo.save(existing);
      } else {
        await this.summaryRepo.save(
          this.summaryRepo.create({
            patientId,
            summaryText,
            generatedAt: new Date(),
          }),
        );
      }

      // Mark processed rows
      if (newVisitSummaries.length > 0) {
        await this.visitSummaryRepo.update(
          newVisitSummaries.map((vs) => vs.id),
          { includedInMedicalSummary: true },
        );
      }
      if (newDocSummaries.length > 0) {
        await this.documentSummaryRepo.update(
          newDocSummaries.map((ds) => ds.id),
          { includedInMedicalSummary: true },
        );
      }

      this.logger.log(`Medical summary generated for patient ${patientId}`);

      await this.clinicalAlertsService
        .regenerateForPatient(patientId)
        .catch((e) =>
          this.logger.error(
            `Clinical alert regen after summary generate failed for patient ${patientId}: ${e instanceof Error ? e.message : String(e)}`,
          ),
        );
    } catch (err) {
      this.logger.error(
        `Failed to generate medical summary for patient ${patientId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  @Cron('0 2 * * *')
  async generateAllPatientSummaries(): Promise<void> {
    this.logger.log('Running nightly medical summary generation for all patients');
    const patients = await this.patientRepo.find({ select: ['id'] });
    for (const p of patients) {
      await this.generateAndSave(p.id).catch((e) =>
        this.logger.error(`Nightly summary failed for patient ${p.id}: ${e}`),
      );
    }
  }

  async forceRegenerate(patientId: string): Promise<void> {
    if (!this.model) {
      this.logger.warn(
        `Skipping force regenerate for patient ${patientId}: Gemini disabled.`,
      );
      return;
    }
    // Load ALL visit and document summaries (not just unprocessed)
    const visitSummaries = await this.visitSummaryRepo
      .createQueryBuilder('vs')
      .innerJoin('vs.visit', 'v')
      .where('v.patient_id = :patientId', { patientId })
      .select(['vs.id', 'vs.summaryText', 'vs.createdAt'])
      .orderBy('vs.createdAt', 'ASC')
      .getMany();

    const docSummaries = await this.documentSummaryRepo
      .createQueryBuilder('ds')
      .innerJoin('ds.document', 'd')
      .where('d.patient_id = :patientId', { patientId })
      .select(['ds.id', 'ds.summaryText', 'ds.createdAt'])
      .orderBy('ds.createdAt', 'ASC')
      .getMany();

    if (visitSummaries.length === 0 && docSummaries.length === 0) {
      // No source content — clear any existing summary.
      await this.summaryRepo.delete({ patientId });
      return;
    }

    const visitTexts = visitSummaries
      .map(
        (vs, i) =>
          `ביקור ${i + 1} (${new Date(vs.createdAt).toLocaleDateString('he-IL')}):\n${vs.summaryText}`,
      )
      .join('\n\n');

    const docTexts = docSummaries
      .map(
        (ds, i) =>
          `מסמך ${i + 1} (${new Date(ds.createdAt).toLocaleDateString('he-IL')}):\n${ds.summaryText}`,
      )
      .join('\n\n');

    const context = [
      visitSummaries.length > 0 ? `סיכומי ביקורים:\n${visitTexts}` : '',
      docSummaries.length > 0 ? `סיכומי מסמכים:\n${docTexts}` : '',
      await this.loadManualAlertsBlock(patientId),
    ]
      .filter(Boolean)
      .join('\n\n');

    const prompt = `${INITIAL_PROMPT}${context}`;
    const result = await this.model.generateContent(prompt);
    const summaryText = result.response.text();

    const existing = await this.summaryRepo.findOne({ where: { patientId } });
    if (existing) {
      existing.summaryText = summaryText;
      existing.generatedAt = new Date();
      await this.summaryRepo.save(existing);
    } else {
      await this.summaryRepo.save(
        this.summaryRepo.create({
          patientId,
          summaryText,
          generatedAt: new Date(),
        }),
      );
    }

    // Mark every source summary as included so future incremental updates
    // pick up from this point.
    if (visitSummaries.length > 0) {
      await this.visitSummaryRepo.update(
        visitSummaries.map((vs) => vs.id),
        { includedInMedicalSummary: true },
      );
    }
    if (docSummaries.length > 0) {
      await this.documentSummaryRepo.update(
        docSummaries.map((ds) => ds.id),
        { includedInMedicalSummary: true },
      );
    }

    this.logger.log(`Medical summary force-regenerated for patient ${patientId}`);

    await this.clinicalAlertsService
      .regenerateForPatient(patientId)
      .catch((e) =>
        this.logger.error(
          `Clinical alert regen after summary force-regenerate failed for patient ${patientId}: ${e instanceof Error ? e.message : String(e)}`,
        ),
      );
  }

  async forceRegenerateAll(): Promise<{ total: number; succeeded: number; failed: number }> {
    const patients = await this.patientRepo.find({ select: ['id'] });
    let succeeded = 0;
    let failed = 0;
    for (const p of patients) {
      try {
        await this.forceRegenerate(p.id);
        succeeded++;
      } catch (e) {
        failed++;
        this.logger.error(
          `Force regenerate failed for patient ${p.id}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
    return { total: patients.length, succeeded, failed };
  }
}
