import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatientMedicalSummaryService } from './patient-medical-summary.service';
import { PatientMedicalSummary } from '../entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { Patient } from '../entities/patient/patientEntity';
import { VisitSummary } from '../entities/visitSummary/visitSummaryEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { PatientClinicalAlert } from '../entities/patientClinicalAlert/patientClinicalAlertEntity';
import { ClinicalAlertsService } from '../clinical-alerts/clinical-alerts.service';
import { ClinicalAlertSource } from '../entities/enums';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQueryBuilder(rows: any[] = []) {
  return {
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    }),
  };
}

function makeModel(text: string) {
  return {
    generateContent: jest.fn().mockResolvedValue({
      response: { text: () => text },
    }),
  };
}

interface BuildOptions {
  apiKey?: string;
  existingSummary?: Partial<PatientMedicalSummary> | null;
  newVisitSummaries?: Partial<VisitSummary>[];
  newDocSummaries?: Partial<DocumentSummary>[];
  patients?: Partial<Patient>[];
  manualAlerts?: Partial<PatientClinicalAlert>[];
}

async function buildService(opts: BuildOptions = {}): Promise<{
  svc: PatientMedicalSummaryService;
  summaryRepo: jest.Mocked<any>;
  visitSummaryRepo: jest.Mocked<any>;
  docSummaryRepo: jest.Mocked<any>;
  clinicalAlertsService: jest.Mocked<any>;
}> {
  const {
    apiKey,
    existingSummary = null,
    newVisitSummaries = [],
    newDocSummaries = [],
    patients = [{ id: 'patient-1' }],
    manualAlerts = [],
  } = opts;

  const summaryRepo = {
    findOne: jest.fn().mockResolvedValue(existingSummary),
    save: jest.fn().mockImplementation(async (e) => e),
    create: jest.fn().mockImplementation((d) => d),
    delete: jest.fn().mockResolvedValue({}),
  };

  const visitSummaryRepo = {
    ...makeQueryBuilder(newVisitSummaries),
    update: jest.fn().mockResolvedValue({}),
  };

  const docSummaryRepo = {
    ...makeQueryBuilder(newDocSummaries),
    update: jest.fn().mockResolvedValue({}),
  };

  const patientRepo = {
    find: jest.fn().mockResolvedValue(patients),
    findOne: jest.fn().mockResolvedValue(patients[0] ?? null),
  };

  const alertRepo = {
    find: jest.fn().mockResolvedValue(manualAlerts),
    findOne: jest.fn().mockResolvedValue(null),
  };

  const clinicalAlertsService = {
    regenerateForPatient: jest.fn().mockResolvedValue([]),
  };

  const configService = {
    get: jest.fn().mockImplementation((k: string) =>
      k === 'GEMINI_API_KEY' ? apiKey : undefined,
    ),
  } as unknown as ConfigService;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      PatientMedicalSummaryService,
      { provide: getRepositoryToken(PatientMedicalSummary), useValue: summaryRepo },
      { provide: getRepositoryToken(Patient), useValue: patientRepo },
      { provide: getRepositoryToken(VisitSummary), useValue: visitSummaryRepo },
      { provide: getRepositoryToken(DocumentSummary), useValue: docSummaryRepo },
      { provide: getRepositoryToken(PatientClinicalAlert), useValue: alertRepo },
      { provide: ConfigService, useValue: configService },
      { provide: ClinicalAlertsService, useValue: clinicalAlertsService },
    ],
  }).compile();

  const svc = module.get(PatientMedicalSummaryService);
  await svc.onModuleInit();
  return { svc, summaryRepo, visitSummaryRepo, docSummaryRepo, clinicalAlertsService };
}

// ---------------------------------------------------------------------------
// onModuleInit
// ---------------------------------------------------------------------------

describe('PatientMedicalSummaryService – onModuleInit', () => {
  it('does not throw when GEMINI_API_KEY is absent', async () => {
    await expect(buildService({ apiKey: undefined })).resolves.toBeDefined();
  });

  it('does not throw when GEMINI_API_KEY is present', async () => {
    await expect(buildService({ apiKey: 'key' })).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// generateAndSave – no model (key absent)
// ---------------------------------------------------------------------------

describe('PatientMedicalSummaryService.generateAndSave – no API key', () => {
  it('skips generation gracefully when model is not initialised', async () => {
    const { svc, summaryRepo } = await buildService({
      apiKey: undefined,
      newVisitSummaries: [{ summaryText: 'visit text', createdAt: new Date() } as any],
    });

    await expect(svc.generateAndSave('patient-1')).resolves.toBeUndefined();
    expect(summaryRepo.save).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// generateAndSave – model present
// ---------------------------------------------------------------------------

describe('PatientMedicalSummaryService.generateAndSave – with model', () => {
  it('skips when there are no new visit or document summaries', async () => {
    const { svc, summaryRepo } = await buildService({
      apiKey: 'key',
      newVisitSummaries: [],
      newDocSummaries: [],
    });

    await svc.generateAndSave('patient-1');
    expect(summaryRepo.save).not.toHaveBeenCalled();
  });

  it('creates a new summary when no existing summary exists', async () => {
    const { svc, summaryRepo } = await buildService({
      apiKey: 'key',
      existingSummary: null,
      newVisitSummaries: [{ id: 'vs-1', summaryText: 'visit data', createdAt: new Date() } as any],
    });
    (svc as any).model = makeModel('Generated summary text');

    await svc.generateAndSave('patient-1');

    expect(summaryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ summaryText: 'Generated summary text' }),
    );
    expect(summaryRepo.save).toHaveBeenCalled();
  });

  it('updates an existing summary when one already exists', async () => {
    const existingSummary = {
      patientId: 'patient-1',
      summaryText: 'Old summary',
      generatedAt: new Date(),
    } as PatientMedicalSummary;

    const { svc, summaryRepo } = await buildService({
      apiKey: 'key',
      existingSummary,
      newVisitSummaries: [{ id: 'vs-1', summaryText: 'new visit', createdAt: new Date() } as any],
    });
    (svc as any).model = makeModel('Updated summary');

    await svc.generateAndSave('patient-1');

    expect(summaryRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ summaryText: 'Updated summary' }),
    );
    // create should NOT be called for an update
    expect(summaryRepo.create).not.toHaveBeenCalled();
  });

  it('marks processed visit summaries as included_in_medical_summary', async () => {
    const visitId = 'vs-1';
    const { svc, visitSummaryRepo } = await buildService({
      apiKey: 'key',
      newVisitSummaries: [{ id: visitId, summaryText: 'data', createdAt: new Date() } as any],
    });
    (svc as any).model = makeModel('Summary');

    await svc.generateAndSave('patient-1');

    expect(visitSummaryRepo.update).toHaveBeenCalledWith(
      [visitId],
      { includedInMedicalSummary: true },
    );
  });

  it('marks processed document summaries as included_in_medical_summary', async () => {
    const docId = 'ds-1';
    const { svc, docSummaryRepo } = await buildService({
      apiKey: 'key',
      newDocSummaries: [{ id: docId, summaryText: 'doc data', createdAt: new Date() } as any],
    });
    (svc as any).model = makeModel('Summary');

    await svc.generateAndSave('patient-1');

    expect(docSummaryRepo.update).toHaveBeenCalledWith(
      [docId],
      { includedInMedicalSummary: true },
    );
  });

  it('triggers clinical alert regeneration after saving summary', async () => {
    const { svc, clinicalAlertsService } = await buildService({
      apiKey: 'key',
      newVisitSummaries: [{ id: 'vs-1', summaryText: 'data', createdAt: new Date() } as any],
    });
    (svc as any).model = makeModel('Summary');

    await svc.generateAndSave('patient-1');

    expect(clinicalAlertsService.regenerateForPatient).toHaveBeenCalledWith('patient-1');
  });

  it('deduplicates concurrent generateAndSave calls (in-flight guard)', async () => {
    const { svc } = await buildService({
      apiKey: 'key',
      newVisitSummaries: [{ id: 'vs-1', summaryText: 'data', createdAt: new Date() } as any],
    });
    let resolveGenerate!: () => void;
    const generatePromise = new Promise<void>((r) => { resolveGenerate = r; });
    (svc as any).model = {
      generateContent: jest.fn().mockReturnValue(generatePromise.then(() => ({
        response: { text: () => 'text' },
      }))),
    };

    // Fire two concurrent calls — only one generateContent call should be made.
    const p1 = svc.generateAndSave('patient-1');
    const p2 = svc.generateAndSave('patient-1');

    resolveGenerate();
    await Promise.all([p1, p2]);

    expect((svc as any).model.generateContent).toHaveBeenCalledTimes(1);
  });

  it('includes manual alerts block in the prompt', async () => {
    const { svc } = await buildService({
      apiKey: 'key',
      newVisitSummaries: [{ id: 'vs-1', summaryText: 'visit', createdAt: new Date() } as any],
      manualAlerts: [{
        patientId: 'patient-1',
        category: 'ALLERGY' as any,
        severity: 'HIGH' as any,
        label: 'פניצילין',
        source: ClinicalAlertSource.MANUAL,
      } as PatientClinicalAlert],
    });
    const model = makeModel('summary');
    (svc as any).model = model;

    await svc.generateAndSave('patient-1');

    const [calledPrompt] = (model.generateContent as jest.Mock).mock.calls[0];
    expect(calledPrompt).toContain('פניצילין');
  });

  it('does NOT call clinicalAlertsService when model call fails', async () => {
    const { svc, clinicalAlertsService } = await buildService({
      apiKey: 'key',
      newVisitSummaries: [{ id: 'vs-1', summaryText: 'data', createdAt: new Date() } as any],
    });
    (svc as any).model = {
      generateContent: jest.fn().mockRejectedValue(new Error('Gemini down')),
    };

    // Should not throw (errors are caught internally and logged)
    await expect(svc.generateAndSave('patient-1')).resolves.toBeUndefined();
    expect(clinicalAlertsService.regenerateForPatient).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// forceRegenerateAll
// ---------------------------------------------------------------------------

describe('PatientMedicalSummaryService.forceRegenerateAll', () => {
  it('returns total/succeeded/failed counts', async () => {
    const { svc } = await buildService({
      apiKey: 'key',
      patients: [{ id: 'p1' }, { id: 'p2' }],
    });
    // No model — generateAndSave will skip gracefully (succeeded)
    const result = await svc.forceRegenerateAll();
    expect(result.total).toBe(2);
    expect(result.succeeded + result.failed).toBe(2);
  });
});
