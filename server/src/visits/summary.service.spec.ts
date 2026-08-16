import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { SummaryService } from './summary.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a mock GenerativeModel whose generateContent resolves with `text`. */
function mockModel(text: string) {
  return {
    generateContent: jest.fn().mockResolvedValue({
      response: { text: () => text },
    }),
  };
}

function mockModelThrows(error: Error) {
  return {
    generateContent: jest.fn().mockRejectedValue(error),
  };
}

/** Create a SummaryService with a pre-injected model (bypasses onModuleInit). */
async function buildService(apiKey: string | undefined): Promise<SummaryService> {
  const configService = {
    get: jest.fn().mockImplementation((key: string) =>
      key === 'GEMINI_API_KEY' ? apiKey : undefined,
    ),
  } as unknown as ConfigService;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      SummaryService,
      { provide: ConfigService, useValue: configService },
    ],
  }).compile();

  const svc = module.get(SummaryService);
  // Run lifecycle hook so the model is (or isn't) initialised.
  await svc.onModuleInit();
  return svc;
}

// ---------------------------------------------------------------------------
// onModuleInit
// ---------------------------------------------------------------------------

describe('SummaryService – onModuleInit', () => {
  it('does NOT throw when GEMINI_API_KEY is absent', async () => {
    await expect(buildService(undefined)).resolves.toBeDefined();
  });

  it('does NOT throw when GEMINI_API_KEY is present', async () => {
    await expect(buildService('test-key')).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// summarize() – no model (key absent)
// ---------------------------------------------------------------------------

describe('SummaryService.summarize – no API key', () => {
  let svc: SummaryService;

  beforeEach(async () => {
    svc = await buildService(undefined);
  });

  it('throws ServiceUnavailableException when model is not initialised', async () => {
    await expect(svc.generateStructuredVisitSummary('any transcript')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});

// ---------------------------------------------------------------------------
// summarize() – model present
// ---------------------------------------------------------------------------

describe('SummaryService.summarize – with model', () => {
  let svc: SummaryService;

  beforeEach(async () => {
    svc = await buildService('test-key');
  });

  /** Inject a mock model after init. */
  function injectModel(model: ReturnType<typeof mockModel>) {
    (svc as any).model = model;
  }

  it('returns empty object for empty transcript without calling model', async () => {
    const spy = jest.fn();
    injectModel({ generateContent: spy } as any);

    const result = await svc.generateStructuredVisitSummary('');
    expect(result.patientComplaints).toBe('');
    expect(result.diagnosis).toBe('');
    expect(result.doctorsRecommendations).toBe('');
    expect(spy).not.toHaveBeenCalled();
  });

  it('parses clean JSON response correctly', async () => {
    const payload = {
      patientComplaints: 'כאב ראש',
      diagnosis: 'מיגרנה',
      doctorsRecommendations: 'מנוחה ושתיית נוזלים',
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('doctor: ...patient: ...');
    expect(result).toEqual(payload);
  });

  it('strips ```json code fences before parsing', async () => {
    const payload = {
      patientComplaints: 'חום',
      diagnosis: 'שפעת',
      doctorsRecommendations: 'מנוחה',
    };
    const wrappedJson = '```json\n' + JSON.stringify(payload) + '\n```';
    injectModel(mockModel(wrappedJson));

    const result = await svc.generateStructuredVisitSummary('some transcript');
    expect(result).toEqual(payload);
  });

  it('strips plain ``` code fences before parsing', async () => {
    const payload = {
      patientComplaints: 'כאב גרון',
      diagnosis: 'דלקת שקדים',
      doctorsRecommendations: 'אנטיביוטיקה',
    };
    const wrappedJson = '```\n' + JSON.stringify(payload) + '\n```';
    injectModel(mockModel(wrappedJson));

    const result = await svc.generateStructuredVisitSummary('transcript text');
    expect(result).toEqual(payload);
  });

  it('throws when model returns malformed JSON', async () => {
    injectModel(mockModel('this is not json at all'));

    await expect(svc.generateStructuredVisitSummary('transcript')).rejects.toThrow('Summarization failed');
  });

  it('throws when model call fails', async () => {
    injectModel(mockModelThrows(new Error('Gemini quota exceeded')) as any);

    await expect(svc.generateStructuredVisitSummary('transcript')).rejects.toThrow('Summarization failed');
  });

  it('includes all three required keys in the parsed result', async () => {
    const payload = {
      patientComplaints: 'p',
      diagnosis: 'd',
      doctorsRecommendations: 'r',
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('text');
    expect(Object.keys(result).sort()).toEqual(
      ['diagnosis', 'doctorsRecommendations', 'patientComplaints'],
    );
  });

  it('parses vitals when present in response', async () => {
    const payload = {
      patientComplaints: 'חום',
      diagnosis: 'שפעת',
      doctorsRecommendations: 'מנוחה',
      vitals: {
        bloodPressure: '120/80',
        pulse: '72',
        bodyTemp: '38',
        weight: '70',
        height: '175',
        oxygenSat: '98%',
      },
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.vitals).toBeDefined();
    expect(result.vitals?.bloodPressure).toBe('120/80');
    expect(result.vitals?.pulse).toBe('72');
    expect(result.vitals?.bodyTemp).toBe('38');
    expect(result.vitals?.weight).toBe('70');
    expect(result.vitals?.height).toBe('175');
    expect(result.vitals?.oxygenSat).toBe('98%');
  });

  it('parses medicines array when present', async () => {
    const payload = {
      patientComplaints: 'כאב גרון',
      diagnosis: 'דלקת שקדים',
      doctorsRecommendations: 'תרופות',
      medicines: [
        { name: 'אמוקסיצילין', dosage: '500 מ"ג', frequency: 'שלוש פעמים ביום', duration: 'עשרה ימים' },
        { name: 'אספירין', dosage: '500 מ"ג', frequency: 'פעמיים ביום', duration: 'שבוע' },
      ],
      diagnoses: [
        { description: 'דלקת שקדים', note: '' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.medicines).toBeDefined();
    expect(result.medicines?.length).toBe(2);
    expect(result.medicines?.[0].name).toBe('אמוקסיצילין');
    expect(result.medicines?.[0].dosage).toBe('500 מ"ג');
    expect(result.medicines?.[0].frequency).toBe('שלוש פעמים ביום');
    expect(result.medicines?.[0].duration).toBe('עשרה ימים');
    expect(result.medicines?.[1].name).toBe('אספירין');
  });

  it('parses diagnoses array when present', async () => {
    const payload = {
      patientComplaints: 'עייפות',
      diagnosis: 'סוכרת',
      doctorsRecommendations: 'דיאטה',
      diagnoses: [
        { description: 'סוכרת סוג שני', note: 'צריכה ניטור' },
        { description: 'יתר לחץ דם', note: 'בעיה משנית' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.diagnoses).toBeDefined();
    expect(result.diagnoses?.length).toBe(2);
    expect(result.diagnoses?.[0].description).toBe('סוכרת סוג שני');
    expect(result.diagnoses?.[0].note).toBe('צריכה ניטור');
    expect(result.diagnoses?.[1].description).toBe('יתר לחץ דם');
  });

  it('handles empty medicines array', async () => {
    const payload = {
      patientComplaints: 'כאב קל בגב',
      diagnosis: 'מתח שרירים',
      doctorsRecommendations: 'מנוחה',
      medicines: [],
      diagnoses: [{ description: 'מתח שרירים', note: '' }],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.medicines?.length).toBe(0);
  });

  it('handles empty diagnoses array', async () => {
    const payload = {
      patientComplaints: 'בדיקה שגרתית',
      diagnosis: 'הכל בסדר',
      doctorsRecommendations: 'המשך חיים שגרתיים',
      medicines: [],
      diagnoses: [],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.diagnoses?.length).toBe(0);
  });

  it('handles partial vitals (some empty)', async () => {
    const payload = {
      patientComplaints: 'חום',
      diagnosis: 'שפעת',
      doctorsRecommendations: 'מנוחה',
      vitals: {
        bloodPressure: '120/80',
        pulse: '',
        bodyTemp: '38',
        weight: '',
        height: '175',
        oxygenSat: '',
      },
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.vitals?.bloodPressure).toBe('120/80');
    expect(result.vitals?.pulse).toBe('');
    expect(result.vitals?.bodyTemp).toBe('38');
    expect(result.vitals?.weight).toBe('');
  });

  it('preserves Hebrew text in all fields', async () => {
    const payload = {
      patientComplaints: 'המטופל מדווח על כאב בברך בעת הליכה',
      diagnosis: 'דלקת במפרק הברך',
      doctorsRecommendations: 'תרופות נגד דלקות, מנוחה, קרח על המפרק',
      vitals: {
        bloodPressure: '120/80',
        pulse: '72',
        bodyTemp: '36.8',
        weight: '75',
        height: '180',
        oxygenSat: '98%',
      },
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.patientComplaints).toContain('כאב בברך');
    expect(result.diagnosis).toContain('דלקת');
    expect(result.doctorsRecommendations).toContain('נגד דלקות');
  });

  it('handles medicines with missing dosage', async () => {
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'כאב',
      doctorsRecommendations: 'משחה',
      medicines: [
        { name: 'משחה סטרואידית', dosage: '', frequency: 'פעמיים ביום', duration: 'שבוע' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.medicines?.[0].name).toBe('משחה סטרואידית');
    expect(result.medicines?.[0].dosage).toBe('');
    expect(result.medicines?.[0].frequency).toBe('פעמיים ביום');
  });

  it('handles medicines with missing frequency', async () => {
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'כאב',
      doctorsRecommendations: 'תרופה',
      medicines: [
        { name: 'אנטיביוטיקה', dosage: '500 מ"ג', frequency: '', duration: 'שבוע' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.medicines?.[0].frequency).toBe('');
  });

  it('handles medicines with missing duration', async () => {
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'כאב',
      doctorsRecommendations: 'תרופה',
      medicines: [
        { name: 'תרופה', dosage: '100 מ"ג', frequency: 'ביום', duration: '' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.medicines?.[0].duration).toBe('');
  });

  it('handles diagnoses with missing note', async () => {
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'דלקת',
      doctorsRecommendations: 'טיפול',
      diagnoses: [
        { description: 'דלקת בגב', note: '' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.diagnoses?.[0].description).toBe('דלקת בגב');
    expect(result.diagnoses?.[0].note).toBe('');
  });

  it('handles many medicines (5+)', async () => {
    const payload = {
      patientComplaints: 'כאבים רבים',
      diagnosis: 'מחלות רבות',
      doctorsRecommendations: 'תרופות רבות',
      medicines: [
        { name: 'תרופה 1', dosage: '10', frequency: 'ביום', duration: 'שבוע' },
        { name: 'תרופה 2', dosage: '20', frequency: 'ביום', duration: 'שבוע' },
        { name: 'תרופה 3', dosage: '30', frequency: 'ביום', duration: 'שבוע' },
        { name: 'תרופה 4', dosage: '40', frequency: 'ביום', duration: 'שבוע' },
        { name: 'תרופה 5', dosage: '50', frequency: 'ביום', duration: 'שבוע' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.medicines?.length).toBe(5);
  });

  it('handles many diagnoses (3+)', async () => {
    const payload = {
      patientComplaints: 'תלונות רבות',
      diagnosis: 'אבחנות רבות',
      doctorsRecommendations: 'טיפול מורכב',
      diagnoses: [
        { description: 'אבחנה 1', note: 'הערה 1' },
        { description: 'אבחנה 2', note: 'הערה 2' },
        { description: 'אבחנה 3', note: 'הערה 3' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.diagnoses?.length).toBe(3);
  });

  it('handles very long patient complaints text', async () => {
    const longText = 'המטופל מדווח על: ' + 'כאב '.repeat(50);
    const payload = {
      patientComplaints: longText,
      diagnosis: 'כאבים כלליים',
      doctorsRecommendations: 'בדיקה',
      medicines: [],
      diagnoses: [],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.patientComplaints).toBe(longText);
    expect(result.patientComplaints.length).toBeGreaterThan(100);
  });

  it('handles very long recommendations text', async () => {
    const longText = 'הרופא ממליץ על: ' + 'תרופה '.repeat(50);
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'כאב',
      doctorsRecommendations: longText,
      medicines: [],
      diagnoses: [],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.doctorsRecommendations).toBe(longText);
  });

  it('all vitals fields are accessible and defined', async () => {
    const payload = {
      patientComplaints: 'בדיקה',
      diagnosis: 'בדיקה',
      doctorsRecommendations: 'בדיקה',
      vitals: {
        bloodPressure: '120/80',
        pulse: '72',
        bodyTemp: '36.8',
        weight: '70',
        height: '175',
        oxygenSat: '98%',
      },
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.vitals?.bloodPressure).toBeDefined();
    expect(result.vitals?.pulse).toBeDefined();
    expect(result.vitals?.bodyTemp).toBeDefined();
    expect(result.vitals?.weight).toBeDefined();
    expect(result.vitals?.height).toBeDefined();
    expect(result.vitals?.oxygenSat).toBeDefined();
  });

  it('handles special characters in medicine names', async () => {
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'כאב',
      doctorsRecommendations: 'תרופה',
      medicines: [
        { name: 'D-Glucosamine', dosage: '500 מ"ג', frequency: 'ביום', duration: 'שבוע' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.medicines?.[0].name).toBe('D-Glucosamine');
  });

  it('handles numbers and percentages in vitals', async () => {
    const payload = {
      patientComplaints: 'בדיקה',
      diagnosis: 'בדיקה',
      doctorsRecommendations: 'בדיקה',
      vitals: {
        bloodPressure: '140/90',
        pulse: '95',
        bodyTemp: '39.5',
        weight: '85.5',
        height: '182.5',
        oxygenSat: '95%',
      },
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.vitals?.bloodPressure).toBe('140/90');
    expect(result.vitals?.oxygenSat).toBe('95%');
  });

  it('handles notation "לא תועד" (not documented) properly', async () => {
    const payload = {
      patientComplaints: 'לא תועד.',
      diagnosis: 'לא תועד.',
      doctorsRecommendations: 'לא תועד.',
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.patientComplaints).toContain('לא תועד');
  });

  it('diagnoses array can have optional notes', async () => {
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'דלקת',
      doctorsRecommendations: 'טיפול',
      diagnoses: [
        { description: 'דלקת', note: 'חמור' },
        { description: 'זיהום', note: undefined },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.diagnoses?.[0].note).toBe('חמור');
    expect(result.diagnoses?.[1].note).toBeUndefined();
  });

  it('handles medicines array with all fields filled', async () => {
    const payload = {
      patientComplaints: 'כאב',
      diagnosis: 'דלקת',
      doctorsRecommendations: 'תרופות',
      medicines: [
        {
          name: 'אמוקסיצילין',
          dosage: '500 מ"ג',
          frequency: 'שלוש פעמים ביום',
          duration: 'עשרה ימים',
        },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    const med = result.medicines?.[0];
    expect(med?.name).toBe('אמוקסיצילין');
    expect(med?.dosage).toBe('500 מ"ג');
    expect(med?.frequency).toBe('שלוש פעמים ביום');
    expect(med?.duration).toBe('עשרה ימים');
  });

  it('handles mixed Hebrew and English in text', async () => {
    const payload = {
      patientComplaints: 'המטופל חוגג BOX הוא MRI ויש גם כאב',
      diagnosis: 'COVID-19 או שפעת',
      docticsRecommendations: 'Paracetamol 500mg וגם זה תרופה',
      medicines: [
        { name: 'COVID-19-medicine', dosage: '100mg', frequency: '3x daily', duration: '7 days' },
      ],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.patientComplaints).toContain('MRI');
    expect(result.patientComplaints).toContain('כאב');
  });

  it('handles edge case: single character fields', async () => {
    const payload = {
      patientComplaints: 'א',
      diagnosis: 'ב',
      doctorsRecommendations: 'ג',
      medicines: [{ name: 'א', dosage: 'ב', frequency: 'ג', duration: 'ד' }],
    };
    injectModel(mockModel(JSON.stringify(payload)));

    const result = await svc.generateStructuredVisitSummary('transcript');
    expect(result.patientComplaints).toBe('א');
    expect(result.medicines?.[0].name).toBe('א');
  });
});
