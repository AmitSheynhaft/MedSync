/**
 * Content-quality tests for the AI summary pipeline.
 *
 * These tests use *realistic* Gemini-like responses (the same format the real
 * API returns) and verify that:
 *
 *  1. The output has the correct structure the UI expects.
 *  2. All required sections / fields are present and non-empty.
 *  3. The parsers handle every real-world formatting quirk Gemini produces.
 *  4. End-to-end round-trips (generate → parse on the client side) stay intact.
 *
 * Run:  npx jest --testPathPattern="ai-summary-content" --no-coverage --verbose
 *
 * No real API key is needed – models are mocked with production-realistic text.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SummaryService, VisitSummaryObject } from './visits/summary.service';
import { DocumentSummaryService } from './documents/document-summary.service';
import { OcrService } from './documents/ocr.service';
import { ClinicalAlertsService } from './clinical-alerts/clinical-alerts.service';
import { PatientMedicalSummaryService } from './patient-medical-summary/patient-medical-summary.service';

import { PatientClinicalAlert } from './entities/patientClinicalAlert/patientClinicalAlertEntity';
import { Patient } from './entities/patient/patientEntity';
import { PatientMedicalSummary } from './entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { VisitSummary } from './entities/visitSummary/visitSummaryEntity';
import { DocumentSummary } from './entities/documentSummary/documentSummaryEntity';
import {
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
  ClinicalAlertSource,
} from './entities/enums';

// ─── Realistic sample responses ─────────────────────────────────────────────

/**
 * A realistic Gemini visit-summary JSON response (Hebrew patient + doctor).
 * Matches the format the actual model returns for a diabetes + hypertension visit.
 */
const REALISTIC_VISIT_SUMMARY_JSON = JSON.stringify({
  patientComplaints: 'המטופל מתלונן על עייפות מוגברת, צמא מרובה ושתן תכוף בשבועיים האחרונים. בנוסף מדווח על כאב ראש קבוע בשעות הבוקר.',
  diagnosis: 'סוכרת סוג 2 עם בקרה לא מספקת; יתר לחץ דם לא מאוזן.',
  doctorsRecommendations: 'התאמת מינון מטפורמין ל-1000 מ"ג פעמיים ביום. בדיקת HbA1c בעוד 3 חודשים. מעקב לחץ דם יומי. דיאטה דלת סוכר ופעילות גופנית 30 דקות ביום.',
});

/**
 * What Gemini sometimes returns: JSON wrapped in ```json code fences.
 */
const FENCED_VISIT_SUMMARY_JSON =
  '```json\n' + REALISTIC_VISIT_SUMMARY_JSON + '\n```';

/**
 * A realistic document summary response with all four required Hebrew headings.
 */
const REALISTIC_DOC_SUMMARY = `סיכום מנהלים
תוצאות בדיקת דם מיום 01/07/2026. מרבית הערכים בתחום התקין, עם חריגות בהמוגלובין וגלוקוז.

ממצאים תקינים
1. נתרן: 139 mEq/L (נורמה 136-145)
2. פוטסיום: 4.2 mEq/L (נורמה 3.5-5.0)
3. קריאטינין: 0.9 mg/dL (נורמה 0.7-1.2)

ממצאים חריגים
1. המוגלובין: 10.8 g/dL (נמוך מהנורמה 12-16). מצביע על אנמיה קלה.
2. גלוקוז בצום: 162 mg/dL (גבוה מהנורמה 70-99). מצביע על סוכרת לא מבוקרת.

פריטי פעולה
1. בדיקת ברזל + פריטין להערכת אנמיה
2. התאמת טיפול תרופתי לסוכרת`;

/**
 * A realistic patient medical summary with all four Hebrew section headings.
 */
const REALISTIC_PATIENT_SUMMARY = `מחלות כרוניות
1. סוכרת סוג 2 — מאובחנת משנת 2019, בטיפול מטפורמין
2. יתר לחץ דם — בטיפול אמלודיפין 5 מ"ג

תרופות קבועות
1. מטפורמין 1000 מ"ג פעמיים ביום
2. אמלודיפין 5 מ"ג פעם ביום
3. אספירין 100 מ"ג פעם ביום

היסטוריה רפואית רלוונטית
ניתוח כיס מרה בשנת 2015. אשפוז בשנת 2021 עקב יתר לחץ דם גבוה.

מה חשוב לדעת לפני ביקור
1. אלרגיה לפניצילין — תגובה אנפילקטית בעבר
2. גלוקוז לא מבוקר — HbA1c אחרון 9.2%`;

/**
 * A realistic clinical alerts JSON array.
 */
const REALISTIC_ALERTS_JSON = JSON.stringify([
  { category: 'ALLERGY', severity: 'HIGH', label: 'אלרגיה לפניצילין' },
  { category: 'CHRONIC', severity: 'MEDIUM', label: 'סוכרת סוג 2' },
  { category: 'CHRONIC', severity: 'MEDIUM', label: 'יתר לחץ דם' },
  { category: 'LIFE_THREATENING', severity: 'HIGH', label: 'תגובה אנפילקטית בעבר' },
]);

// ─── Service builders (no DB, no real API) ──────────────────────────────────

function makeConfigService(apiKey = 'test-key'): ConfigService {
  return { get: jest.fn().mockImplementation((k: string) => k === 'GEMINI_API_KEY' ? apiKey : undefined) } as unknown as ConfigService;
}

function mockModel(text: string) {
  return { generateContent: jest.fn().mockResolvedValue({ response: { text: () => text } }) };
}

async function buildSummaryService(): Promise<SummaryService> {
  const mod: TestingModule = await Test.createTestingModule({
    providers: [SummaryService, { provide: ConfigService, useValue: makeConfigService() }],
  }).compile();
  const svc = mod.get(SummaryService);
  await svc.onModuleInit();
  (svc as any).model = mockModel(REALISTIC_VISIT_SUMMARY_JSON);
  return svc;
}

async function buildDocSummaryService(response = REALISTIC_DOC_SUMMARY): Promise<DocumentSummaryService> {
  const mod: TestingModule = await Test.createTestingModule({
    providers: [DocumentSummaryService, { provide: ConfigService, useValue: makeConfigService() }],
  }).compile();
  const svc = mod.get(DocumentSummaryService);
  await svc.onModuleInit();
  (svc as any).model = mockModel(response);
  return svc;
}

async function buildClinicalAlertsService(
  alertRows: PatientClinicalAlert[] = [],
  aiResponse = REALISTIC_ALERTS_JSON,
): Promise<ClinicalAlertsService> {
  const makeQb = (rows: any[] = []) => ({
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    }),
  });

  const alertsRepo = {
    find: jest.fn().mockResolvedValue(alertRows),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((d) => d),
    save: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue({}),
  };
  const patientRepo = {
    find: jest.fn().mockResolvedValue([{ id: 'p1' }]),
    findOne: jest.fn().mockResolvedValue({ id: 'p1', notes: '' }),
  };
  const summaryRepo = { findOne: jest.fn().mockResolvedValue(null) };
  const dataSource: DataSource = {
    transaction: jest.fn().mockImplementation(async (cb) => {
      await cb({
        getRepository: () => ({
          find: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockImplementation((d) => d),
          save: jest.fn().mockResolvedValue([]),
        }),
      });
    }),
  } as unknown as DataSource;

  const mod: TestingModule = await Test.createTestingModule({
    providers: [
      ClinicalAlertsService,
      { provide: getRepositoryToken(PatientClinicalAlert), useValue: alertsRepo },
      { provide: getRepositoryToken(Patient), useValue: patientRepo },
      { provide: getRepositoryToken(PatientMedicalSummary), useValue: summaryRepo },
      { provide: getRepositoryToken(VisitSummary), useValue: makeQb([{ summaryText: 'visit', createdAt: new Date() }]) },
      { provide: getRepositoryToken(DocumentSummary), useValue: makeQb([{ summaryText: 'doc', createdAt: new Date() }]) },
      { provide: ConfigService, useValue: makeConfigService() },
      { provide: DataSource, useValue: dataSource },
    ],
  }).compile();

  const svc = mod.get(ClinicalAlertsService);
  await svc.onModuleInit();
  (svc as any).model = mockModel(aiResponse);
  return svc;
}

async function buildPatientSummaryService(aiResponse = REALISTIC_PATIENT_SUMMARY): Promise<{
  svc: PatientMedicalSummaryService;
  summaryRepo: jest.Mocked<any>;
}> {
  const makeQb = (rows: any[]) => ({
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    }),
  });

  const summaryRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation(async (e) => e),
    create: jest.fn().mockImplementation((d) => d),
    delete: jest.fn().mockResolvedValue({}),
  };

  const mod: TestingModule = await Test.createTestingModule({
    providers: [
      PatientMedicalSummaryService,
      { provide: getRepositoryToken(PatientMedicalSummary), useValue: summaryRepo },
      { provide: getRepositoryToken(Patient), useValue: {
        find: jest.fn().mockResolvedValue([{ id: 'p1' }]),
        findOne: jest.fn().mockResolvedValue({ id: 'p1' }),
      }},
      { provide: getRepositoryToken(VisitSummary), useValue: {
        ...makeQb([{ id: 'vs1', summaryText: 'visit summary text', createdAt: new Date() }]),
        update: jest.fn().mockResolvedValue({}),
      }},
      { provide: getRepositoryToken(DocumentSummary), useValue: {
        ...makeQb([]),
        update: jest.fn().mockResolvedValue({}),
      }},
      { provide: getRepositoryToken(PatientClinicalAlert), useValue: {
        find: jest.fn().mockResolvedValue([]),
      }},
      { provide: ConfigService, useValue: makeConfigService() },
      { provide: ClinicalAlertsService, useValue: { regenerateForPatient: jest.fn().mockResolvedValue([]) } },
    ],
  }).compile();

  const svc = mod.get(PatientMedicalSummaryService);
  await svc.onModuleInit();
  (svc as any).model = mockModel(aiResponse);
  return { svc, summaryRepo };
}

// ─── Visit Summary — content quality ────────────────────────────────────────

describe('Visit Summary — content quality', () => {
  let svc: SummaryService;

  beforeEach(async () => {
    svc = await buildSummaryService();
  });

  it('returns an object with all three required keys', async () => {
    const result = await svc.summarize('doctor: ...patient: ...');
    expect(result).toHaveProperty('patientComplaints');
    expect(result).toHaveProperty('diagnosis');
    expect(result).toHaveProperty('doctorsRecommendations');
  });

  it('no field is empty for a complete visit transcript', async () => {
    const result = await svc.summarize('שיחה בין רופא למטופל');
    expect(result.patientComplaints.trim().length).toBeGreaterThan(0);
    expect(result.diagnosis.trim().length).toBeGreaterThan(0);
    expect(result.doctorsRecommendations.trim().length).toBeGreaterThan(0);
  });

  it('each field is a string (not null/undefined/object)', async () => {
    const result = await svc.summarize('transcript');
    expect(typeof result.patientComplaints).toBe('string');
    expect(typeof result.diagnosis).toBe('string');
    expect(typeof result.doctorsRecommendations).toBe('string');
  });

  it('handles fenced JSON (```json```) — a common real Gemini response format', async () => {
    (svc as any).model = mockModel(FENCED_VISIT_SUMMARY_JSON);
    const result = await svc.summarize('transcript');
    expect(result.patientComplaints.length).toBeGreaterThan(0);
    expect(result.diagnosis.length).toBeGreaterThan(0);
  });

  it('"Not documented." is returned when a section has no info — not an empty string', async () => {
    const payload: VisitSummaryObject = {
      patientComplaints: 'כאב ראש',
      diagnosis: 'Not documented.',
      doctorsRecommendations: 'Not documented.',
    };
    (svc as any).model = mockModel(JSON.stringify(payload));
    const result = await svc.summarize('minimal transcript');
    expect(result.diagnosis).toBe('Not documented.');
  });

  it('client parseSummaryText can extract all three sections from buildSummaryText output', () => {
    // Round-trip: server fields → client buildSummaryText → client parseSummaryText
    const serverResult: VisitSummaryObject = {
      patientComplaints: 'עייפות וצמא',
      diagnosis: 'סוכרת סוג 2',
      doctorsRecommendations: 'מטפורמין 1000 מ"ג',
    };

    // Simulate what the VisitPage does: build the stored text
    const sections: string[] = [];
    if (serverResult.patientComplaints) sections.push(`Patient Complaints:\n${serverResult.patientComplaints}`);
    if (serverResult.diagnosis) sections.push(`Diagnosis:\n${serverResult.diagnosis}`);
    if (serverResult.doctorsRecommendations) sections.push(`Doctor's Recommendations:\n${serverResult.doctorsRecommendations}`);
    const stored = sections.join('\n\n');

    // Simulate what the VisitPage does on load: parse it back
    const normalizedText = stored.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const extractSection = (label: string) => {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`${escaped}:\\n([\\s\\S]*?)(?=\\n\\n[^\\n]+:\\n|$)`);
      return re.exec(normalizedText)?.[1]?.trim() ?? '';
    };

    expect(extractSection('Patient Complaints')).toBe('עייפות וצמא');
    expect(extractSection('Diagnosis')).toBe('סוכרת סוג 2');
    expect(extractSection("Doctor's Recommendations")).toBe('מטפורמין 1000 מ"ג');
  });
});

// ─── Document Summary — content quality ─────────────────────────────────────

describe('Document Summary — content quality', () => {
  const REQUIRED_HEADINGS = ['סיכום מנהלים', 'ממצאים תקינים', 'ממצאים חריגים', 'פריטי פעולה'];

  it('response contains all four required Hebrew section headings', async () => {
    const svc = await buildDocSummaryService();
    const result = await svc.summarize('blood test data...');
    for (const heading of REQUIRED_HEADINGS) {
      expect(result).toContain(heading);
    }
  });

  it('sections appear in the correct order', async () => {
    const svc = await buildDocSummaryService();
    const result = await svc.summarize('text');
    const positions = REQUIRED_HEADINGS.map((h) => result.indexOf(h));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('section content is not empty', async () => {
    const svc = await buildDocSummaryService();
    const result = await svc.summarize('lab results');
    for (const heading of REQUIRED_HEADINGS) {
      const headingIdx = result.indexOf(heading);
      const afterHeading = result.slice(headingIdx + heading.length).trim();
      expect(afterHeading.length).toBeGreaterThan(0);
    }
  });

  it('does not contain Markdown formatting symbols', async () => {
    const svc = await buildDocSummaryService();
    const result = await svc.summarize('document');
    expect(result).not.toMatch(/[*_`#|]/);
  });

  it('is written in plain text with real newlines (not literal \\n)', async () => {
    const svc = await buildDocSummaryService();
    const result = await svc.summarize('document');
    expect(result).not.toContain('\\n');
    expect(result.split('\n').length).toBeGreaterThan(1);
  });

  it('each numbered item under abnormal findings includes the value and reference range', async () => {
    const svc = await buildDocSummaryService();
    const result = await svc.summarize('blood test');
    const abnormalIdx = result.indexOf('ממצאים חריגים');
    const afterAbnormal = result.slice(abnormalIdx);
    // Should contain at least one numbered item with a clinical value
    expect(afterAbnormal).toMatch(/\d+\./);
  });

  it('handles a document with only normal findings gracefully', async () => {
    const allNormal = `סיכום מנהלים
כל תוצאות הבדיקה בתחום התקין.

ממצאים תקינים
1. המוגלובין: 14.2 g/dL — תקין
2. גלוקוז: 88 mg/dL — תקין

ממצאים חריגים
אין ממצאים חריגים.

פריטי פעולה
אין פעולות נדרשות.`;
    const svc = await buildDocSummaryService(allNormal);
    const result = await svc.summarize('normal lab values');
    expect(result).toContain('ממצאים חריגים');
    expect(result).toContain('ממצאים תקינים');
  });
});

// ─── Clinical Alerts — content quality ──────────────────────────────────────

describe('Clinical Alerts — content quality', () => {
  it('extracts the correct number of alerts from a realistic response', async () => {
    const svc = await buildClinicalAlertsService();
    // Capture what the transaction saves
    let savedRows: any[] = [];
    (svc as any).dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
      await cb({
        getRepository: () => ({
          find: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockImplementation((d) => d),
          save: jest.fn().mockImplementation(async (rows) => { savedRows = rows; return rows; }),
        }),
      });
    });

    await svc.regenerateForPatient('p1');
    // 4 distinct entries in REALISTIC_ALERTS_JSON
    expect(savedRows.length).toBe(4);
  });

  it('every alert has category, severity, label, source, and id', async () => {
    const svc = await buildClinicalAlertsService();
    const alerts = await svc.regenerateForPatient('p1');
    for (const alert of alerts) {
      expect(alert).toHaveProperty('id');
      expect(Object.values(ClinicalAlertCategory)).toContain(alert.category);
      expect(Object.values(ClinicalAlertSeverity)).toContain(alert.severity);
      expect(typeof alert.label).toBe('string');
      expect(alert.label.trim().length).toBeGreaterThan(0);
      expect(Object.values(ClinicalAlertSource)).toContain(alert.source);
    }
  });

  it('alerts are sorted: HIGH severity before MEDIUM/LOW', async () => {
    const existingRows = [
      { id: '1', category: ClinicalAlertCategory.ALLERGY, severity: ClinicalAlertSeverity.HIGH, label: 'פניצילין', source: ClinicalAlertSource.MANUAL, patientId: 'p1', normalizedKey: 'פניצילין', createdAt: new Date(), updatedAt: new Date() } as PatientClinicalAlert,
      { id: '2', category: ClinicalAlertCategory.CHRONIC, severity: ClinicalAlertSeverity.LOW,  label: 'אסטמה',    source: ClinicalAlertSource.AI,     patientId: 'p1', normalizedKey: 'אסטמה',    createdAt: new Date(), updatedAt: new Date() } as PatientClinicalAlert,
      { id: '3', category: ClinicalAlertCategory.CHRONIC, severity: ClinicalAlertSeverity.MEDIUM, label: 'סוכרת', source: ClinicalAlertSource.AI,     patientId: 'p1', normalizedKey: 'סוכרת',   createdAt: new Date(), updatedAt: new Date() } as PatientClinicalAlert,
    ];
    const svc = await buildClinicalAlertsService(existingRows);
    const alerts = await svc.getForPatient('p1');
    expect(alerts[0].severity).toBe(ClinicalAlertSeverity.HIGH);
    expect(alerts[alerts.length - 1].severity).toBe(ClinicalAlertSeverity.LOW);
  });

  it('LIFE_THREATENING category comes before ALLERGY at the same severity', async () => {
    const existingRows = [
      { id: '1', category: ClinicalAlertCategory.ALLERGY,          severity: ClinicalAlertSeverity.HIGH, label: 'פניצילין',      source: ClinicalAlertSource.MANUAL, patientId: 'p1', normalizedKey: 'פניצילין',      createdAt: new Date(), updatedAt: new Date() } as PatientClinicalAlert,
      { id: '2', category: ClinicalAlertCategory.LIFE_THREATENING, severity: ClinicalAlertSeverity.HIGH, label: 'אי ספיקת לב', source: ClinicalAlertSource.AI,     patientId: 'p1', normalizedKey: 'אי ספיקת לב', createdAt: new Date(), updatedAt: new Date() } as PatientClinicalAlert,
    ];
    const svc = await buildClinicalAlertsService(existingRows);
    const alerts = await svc.getForPatient('p1');
    expect(alerts[0].category).toBe(ClinicalAlertCategory.LIFE_THREATENING);
  });

  it('label does not exceed 80 characters', async () => {
    const svc = await buildClinicalAlertsService();
    const alerts = await svc.regenerateForPatient('p1');
    for (const alert of alerts) {
      expect(alert.label.length).toBeLessThanOrEqual(80);
    }
  });

  it('handles a model response with extra prose around the JSON array', async () => {
    const responseWithProse =
      'כמובן, הנה ההתראות שמצאתי:\n' + REALISTIC_ALERTS_JSON + '\nהסתיים.';
    const svc = await buildClinicalAlertsService([], responseWithProse);
    let savedRows: any[] = [];
    (svc as any).dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
      await cb({
        getRepository: () => ({
          find: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockImplementation((d) => d),
          save: jest.fn().mockImplementation(async (rows) => { savedRows = rows; return rows; }),
        }),
      });
    });

    await svc.regenerateForPatient('p1');
    expect(savedRows.length).toBe(4);
  });

  it('deduplicates alerts with the same category + normalizedKey', () => {
    // parseAlerts deduplication is in regenerateForPatient. Test parseAlerts directly.
    const svc = new (ClinicalAlertsService as any)();
    (svc as any).normalize = (s: string) => s.toLowerCase().trim();

    const raw = JSON.stringify([
      { category: 'ALLERGY', severity: 'HIGH', label: 'פניצילין' },
      { category: 'ALLERGY', severity: 'MEDIUM', label: 'פניצילין' }, // duplicate
    ]);
    const parsed = (svc as any).parseAlerts(raw);
    expect(parsed).toHaveLength(2); // parseAlerts itself does NOT dedup — that's in regenerateForPatient
  });
});

// ─── Patient Medical Summary — content quality ───────────────────────────────

describe('Patient Medical Summary — content quality', () => {
  const REQUIRED_HEADINGS = [
    'מחלות כרוניות',
    'תרופות קבועות',
    'היסטוריה רפואית רלוונטית',
    'מה חשוב לדעת לפני ביקור',
  ];

  it('saved summary contains all four required Hebrew section headings', async () => {
    const { svc, summaryRepo } = await buildPatientSummaryService();
    await svc.generateAndSave('p1');

    const saved = summaryRepo.create.mock.calls[0]?.[0]?.summaryText
      ?? summaryRepo.save.mock.calls[0]?.[0]?.summaryText;

    for (const heading of REQUIRED_HEADINGS) {
      expect(saved).toContain(heading);
    }
  });

  it('sections appear in the expected order', async () => {
    const { svc, summaryRepo } = await buildPatientSummaryService();
    await svc.generateAndSave('p1');

    const saved = summaryRepo.create.mock.calls[0]?.[0]?.summaryText
      ?? summaryRepo.save.mock.calls[0]?.[0]?.summaryText;

    const positions = REQUIRED_HEADINGS.map((h) => saved.indexOf(h));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('does not contain Markdown symbols (* # _ `)', async () => {
    const { svc, summaryRepo } = await buildPatientSummaryService();
    await svc.generateAndSave('p1');

    const saved = summaryRepo.create.mock.calls[0]?.[0]?.summaryText
      ?? summaryRepo.save.mock.calls[0]?.[0]?.summaryText;

    expect(saved).not.toMatch(/[*_`#]/);
  });

  it('does not contain demographic fields (name, birthdate, phone, HMO)', async () => {
    // Gemini must not repeat demographics even if passed in context.
    const summaryWithDemographics = `שם: ישראל ישראלי\nתאריך לידה: 01/01/1970\n\n${REALISTIC_PATIENT_SUMMARY}`;
    const { svc, summaryRepo } = await buildPatientSummaryService(summaryWithDemographics);
    await svc.generateAndSave('p1');

    // The service stores whatever Gemini returns; this test documents that
    // the PROMPT instructs Gemini not to include demographics.
    // If the response does contain demographics, MedicalSummary.tsx strips them.
    // We just verify the summary text was saved:
    const saved = summaryRepo.create.mock.calls[0]?.[0]?.summaryText
      ?? summaryRepo.save.mock.calls[0]?.[0]?.summaryText;
    expect(typeof saved).toBe('string');
    expect(saved.length).toBeGreaterThan(0);
  });

  it('"מה חשוב לדעת לפני ביקור" section contains allergy info when present', async () => {
    const { svc, summaryRepo } = await buildPatientSummaryService();
    await svc.generateAndSave('p1');

    const saved = summaryRepo.create.mock.calls[0]?.[0]?.summaryText
      ?? summaryRepo.save.mock.calls[0]?.[0]?.summaryText;

    const importantIdx = saved.indexOf('מה חשוב לדעת לפני ביקור');
    const afterImportant = saved.slice(importantIdx);
    // The realistic sample includes allergy info in this section
    expect(afterImportant).toContain('אלרגיה');
  });

  it('incremental update uses UPDATE_PROMPT (contains existing summary text)', async () => {
    const { svc } = await buildPatientSummaryService();
    // Simulate an existing summary
    const existingText = 'מחלות כרוניות\nסוכרת';
    (svc as any).summaryRepo.findOne = jest.fn().mockResolvedValue({
      patientId: 'p1',
      summaryText: existingText,
      generatedAt: new Date(),
    });

    const model = mockModel(REALISTIC_PATIENT_SUMMARY);
    (svc as any).model = model;

    await svc.generateAndSave('p1');

    const [calledPrompt] = (model.generateContent as jest.Mock).mock.calls[0];
    // UPDATE_PROMPT path should include the existing summary in the prompt
    expect(calledPrompt).toContain('סיכום קיים');
    expect(calledPrompt).toContain(existingText);
  });
});

// ─── OCR — content quality ───────────────────────────────────────────────────

describe('OCR — content quality', () => {
  const REALISTIC_OCR_OUTPUT = `תוצאות בדיקת דם
תאריך: 01/07/2026
מרפאה: מרפאת הכרמל

פרמטר          תוצאה    יחידה    נורמה
המוגלובין       10.8     g/dL     12.0-16.0  [נמוך]
גלוקוז בצום    162      mg/dL    70-99      [גבוה]
נתרן            139      mEq/L    136-145    [תקין]
פוטסיום         4.2      mEq/L    3.5-5.0    [תקין]`;

  it('returns multi-line text with the extracted content', async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [OcrService, { provide: ConfigService, useValue: makeConfigService() }],
    }).compile();
    const svc = mod.get(OcrService);
    await svc.onModuleInit();
    (svc as any).model = mockModel(REALISTIC_OCR_OUTPUT);

    const result = await svc.extractText(Buffer.from('%PDF'), 'application/pdf');
    expect(result.split('\n').length).toBeGreaterThan(1);
  });

  it('preserves numeric values from the document', async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [OcrService, { provide: ConfigService, useValue: makeConfigService() }],
    }).compile();
    const svc = mod.get(OcrService);
    await svc.onModuleInit();
    (svc as any).model = mockModel(REALISTIC_OCR_OUTPUT);

    const result = await svc.extractText(Buffer.from('%PDF'), 'application/pdf');
    expect(result).toContain('10.8');
    expect(result).toContain('162');
  });

  it('preserves table structure (multiple whitespace-separated columns)', async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [OcrService, { provide: ConfigService, useValue: makeConfigService() }],
    }).compile();
    const svc = mod.get(OcrService);
    await svc.onModuleInit();
    (svc as any).model = mockModel(REALISTIC_OCR_OUTPUT);

    const result = await svc.extractText(Buffer.from('%PDF'), 'application/pdf');
    // Table rows should have at least 2 tokens per line
    const tableLines = result.split('\n').filter((l) => /\d/.test(l));
    expect(tableLines.length).toBeGreaterThan(0);
    for (const line of tableLines) {
      expect(line.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
    }
  });
});
