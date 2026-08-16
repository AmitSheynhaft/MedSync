import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClinicalAlertsService } from './clinical-alerts.service';
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

// ---------------------------------------------------------------------------
// Test builders
// ---------------------------------------------------------------------------

function makeAlert(
  overrides: Partial<PatientClinicalAlert> = {},
): PatientClinicalAlert {
  return {
    id: 'alert-1',
    patientId: 'patient-1',
    category: ClinicalAlertCategory.ALLERGY,
    severity: ClinicalAlertSeverity.HIGH,
    label: 'אלרגיה לפניצילין',
    normalizedKey: 'אלרגיה לפניצילין',
    source: ClinicalAlertSource.MANUAL,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as PatientClinicalAlert;
}

function makeRepoMock(rows: PatientClinicalAlert[] = []) {
  return {
    find: jest.fn().mockResolvedValue(rows),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((data) => ({ ...data })),
    save: jest.fn().mockImplementation(async (entity) => ({ id: 'new-id', ...entity })),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
}

function makeDataSourceMock(manualRows: PatientClinicalAlert[] = []) {
  const repoMock = {
    find: jest.fn().mockResolvedValue(manualRows),
    delete: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockImplementation((d) => d),
    save: jest.fn().mockResolvedValue([]),
  };
  return {
    transaction: jest.fn().mockImplementation(async (cb) => {
      await cb({ getRepository: () => repoMock });
    }),
  } as unknown as DataSource;
}

async function buildService(
  apiKey: string | undefined,
  alertRows: PatientClinicalAlert[] = [],
  manualRows: PatientClinicalAlert[] = [],
): Promise<{ svc: ClinicalAlertsService; alertsRepo: ReturnType<typeof makeRepoMock> }> {
  const alertsRepo = makeRepoMock(alertRows);
  const patientRepo = {
    find: jest.fn().mockResolvedValue([{ id: 'patient-1' }]),
    findOne: jest.fn().mockResolvedValue({ id: 'patient-1', notes: '' }),
  };
  const summaryRepo = { findOne: jest.fn().mockResolvedValue(null) };
  const visitSummaryRepo = {
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };
  const docSummaryRepo = {
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };
  const configService = {
    get: jest.fn().mockImplementation((key: string) =>
      key === 'GEMINI_API_KEY' ? apiKey : undefined,
    ),
  } as unknown as ConfigService;
  const dataSource = makeDataSourceMock(manualRows);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ClinicalAlertsService,
      { provide: getRepositoryToken(PatientClinicalAlert), useValue: alertsRepo },
      { provide: getRepositoryToken(Patient), useValue: patientRepo },
      { provide: getRepositoryToken(PatientMedicalSummary), useValue: summaryRepo },
      { provide: getRepositoryToken(VisitSummary), useValue: visitSummaryRepo },
      { provide: getRepositoryToken(DocumentSummary), useValue: docSummaryRepo },
      { provide: ConfigService, useValue: configService },
      { provide: DataSource, useValue: dataSource },
    ],
  }).compile();

  const svc = module.get(ClinicalAlertsService);
  await svc.onModuleInit();
  return { svc, alertsRepo };
}

// ---------------------------------------------------------------------------
// onModuleInit
// ---------------------------------------------------------------------------

describe('ClinicalAlertsService – onModuleInit', () => {
  it('does not throw when GEMINI_API_KEY is absent', async () => {
    await expect(buildService(undefined)).resolves.toBeDefined();
  });

  it('does not throw when GEMINI_API_KEY is present', async () => {
    await expect(buildService('key')).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// parseAlerts (private – tested via white-box access)
// ---------------------------------------------------------------------------

describe('ClinicalAlertsService – parseAlerts (private)', () => {
  let svc: ClinicalAlertsService;

  beforeEach(async () => {
    ({ svc } = await buildService('key'));
  });

  function parse(raw: string) {
    return (svc as any).parseAlerts(raw);
  }

  it('parses a valid JSON array', () => {
    const raw = JSON.stringify([
      { category: 'ALLERGY', severity: 'HIGH', label: 'אלרגיה לפניצילין' },
    ]);
    const result = parse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('אלרגיה לפניצילין');
  });

  it('strips ```json code fences before parsing', () => {
    const raw = '```json\n[{"category":"ALLERGY","severity":"HIGH","label":"test"}]\n```';
    expect(parse(raw)).toHaveLength(1);
  });

  it('strips plain ``` code fences before parsing', () => {
    const raw = '```\n[{"category":"CHRONIC","severity":"MEDIUM","label":"סוכרת"}]\n```';
    const result = parse(raw);
    expect(result[0].category).toBe('CHRONIC');
  });

  it('extracts first JSON array from a text that has surrounding prose', () => {
    const raw = 'Sure! Here are the alerts: [{"category":"ALLERGY","severity":"LOW","label":"בוטנים"}] done.';
    expect(parse(raw)).toHaveLength(1);
  });

  it('returns [] for completely non-JSON text', () => {
    expect(parse('no json here')).toEqual([]);
  });

  it('returns [] for an empty array response', () => {
    expect(parse('[]')).toEqual([]);
  });

  it('filters out items with invalid category', () => {
    const raw = JSON.stringify([
      { category: 'MADE_UP', severity: 'HIGH', label: 'test' },
      { category: 'ALLERGY', severity: 'HIGH', label: 'valid' },
    ]);
    const result = parse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('valid');
  });

  it('filters out items with invalid severity', () => {
    const raw = JSON.stringify([
      { category: 'ALLERGY', severity: 'EXTREME', label: 'bad' },
      { category: 'ALLERGY', severity: 'LOW', label: 'good' },
    ]);
    const result = parse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('good');
  });

  it('filters out items with empty label', () => {
    const raw = JSON.stringify([
      { category: 'ALLERGY', severity: 'HIGH', label: '   ' },
    ]);
    expect(parse(raw)).toHaveLength(0);
  });

  it('truncates labels longer than 80 chars', () => {
    const longLabel = 'א'.repeat(100);
    const raw = JSON.stringify([
      { category: 'ALLERGY', severity: 'HIGH', label: longLabel },
    ]);
    const result = parse(raw);
    expect(result[0].label.length).toBeLessThanOrEqual(80);
  });

  it('returns [] when the response is a non-array JSON value', () => {
    expect(parse('{"foo":"bar"}')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getForPatient
// ---------------------------------------------------------------------------

describe('ClinicalAlertsService.getForPatient', () => {
  it('returns sorted DTOs for a patient', async () => {
    const rows = [
      makeAlert({ id: '1', category: ClinicalAlertCategory.CHRONIC, severity: ClinicalAlertSeverity.LOW, label: 'יתר לחץ דם', source: ClinicalAlertSource.AI }),
      makeAlert({ id: '2', category: ClinicalAlertCategory.ALLERGY, severity: ClinicalAlertSeverity.HIGH, label: 'פניצילין', source: ClinicalAlertSource.MANUAL }),
    ];
    const { svc } = await buildService('key', rows);

    const result = await svc.getForPatient('patient-1');
    // HIGH severity comes first
    expect(result[0].severity).toBe(ClinicalAlertSeverity.HIGH);
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// createManualAlert
// ---------------------------------------------------------------------------

describe('ClinicalAlertsService.createManualAlert', () => {
  it('throws BadRequestException for empty label', async () => {
    const { svc } = await buildService('key');
    await expect(
      svc.createManualAlert('patient-1', {
        label: '   ',
        severity: ClinicalAlertSeverity.HIGH,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for label longer than 80 chars', async () => {
    const { svc } = await buildService('key');
    await expect(
      svc.createManualAlert('patient-1', {
        label: 'א'.repeat(81),
        severity: ClinicalAlertSeverity.HIGH,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for invalid severity', async () => {
    const { svc } = await buildService('key');
    await expect(
      svc.createManualAlert('patient-1', {
        label: 'valid',
        severity: 'EXTREME' as any,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a new manual alert and returns DTO', async () => {
    const { svc } = await buildService('key');
    const result = await svc.createManualAlert('patient-1', {
      label: 'אלרגיה לפניצילין',
      severity: ClinicalAlertSeverity.HIGH,
      category: ClinicalAlertCategory.ALLERGY,
    });
    expect(result).toHaveProperty('label', 'אלרגיה לפניצילין');
    expect(result).toHaveProperty('source', ClinicalAlertSource.MANUAL);
  });

  it('throws NotFoundException when patient does not exist', async () => {
    const { svc } = await buildService('key');
    // Override patientRepo to return null
    (svc as any).patientRepo.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      svc.createManualAlert('non-existent', {
        label: 'valid label',
        severity: ClinicalAlertSeverity.MEDIUM,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// deleteManualAlert
// ---------------------------------------------------------------------------

describe('ClinicalAlertsService.deleteManualAlert', () => {
  it('throws NotFoundException when alert does not exist', async () => {
    const { svc } = await buildService('key');
    (svc as any).alertsRepo.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      svc.deleteManualAlert('patient-1', 'missing-alert'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when trying to delete an AI alert', async () => {
    const aiAlert = makeAlert({ source: ClinicalAlertSource.AI });
    const { svc } = await buildService('key', [aiAlert]);
    (svc as any).alertsRepo.findOne = jest.fn().mockResolvedValue(aiAlert);

    await expect(
      svc.deleteManualAlert('patient-1', aiAlert.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deletes a manual alert successfully', async () => {
    const manualAlert = makeAlert({ source: ClinicalAlertSource.MANUAL });
    const { svc, alertsRepo } = await buildService('key', [manualAlert]);
    alertsRepo.findOne = jest.fn().mockResolvedValue(manualAlert);

    await expect(
      svc.deleteManualAlert('patient-1', manualAlert.id),
    ).resolves.toBeUndefined();
    expect(alertsRepo.delete).toHaveBeenCalledWith({ id: manualAlert.id });
  });
});

// ---------------------------------------------------------------------------
// regenerateForPatient – no model (key absent)
// ---------------------------------------------------------------------------

describe('ClinicalAlertsService.regenerateForPatient – no API key', () => {
  it('returns existing alerts without calling model', async () => {
    const rows = [makeAlert()];
    const { svc } = await buildService(undefined, rows);

    const result = await svc.regenerateForPatient('patient-1');
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('אלרגיה לפניצילין');
  });
});

// ---------------------------------------------------------------------------
// normalize (private – white-box)
// ---------------------------------------------------------------------------

describe('ClinicalAlertsService – normalize (private)', () => {
  let svc: ClinicalAlertsService;

  beforeEach(async () => {
    ({ svc } = await buildService(undefined));
  });

  function normalize(s: string): string {
    return (svc as any).normalize(s);
  }

  it('lowercases ASCII text', () => {
    expect(normalize('Diabetes Type 2')).toBe('diabetes type 2');
  });

  it('strips Hebrew niqqud', () => {
    // 'שָׁלוֹם' with niqqud vs plain 'שלום'
    expect(normalize('שָׁלוֹם')).toBe('שלום');
  });

  it('collapses multiple spaces', () => {
    expect(normalize('a  b   c')).toBe('a b c');
  });

  it('trims leading/trailing whitespace', () => {
    expect(normalize('  hello  ')).toBe('hello');
  });

  it('truncates to 120 characters', () => {
    const long = 'א'.repeat(200);
    expect(normalize(long).length).toBeLessThanOrEqual(120);
  });
});
