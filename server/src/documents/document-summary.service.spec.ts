import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { DocumentSummaryService } from './document-summary.service';

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

async function buildService(apiKey: string | undefined): Promise<DocumentSummaryService> {
  const configService = {
    get: jest.fn().mockImplementation((key: string) =>
      key === 'GEMINI_API_KEY' ? apiKey : undefined,
    ),
  } as unknown as ConfigService;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      DocumentSummaryService,
      { provide: ConfigService, useValue: configService },
    ],
  }).compile();

  const svc = module.get(DocumentSummaryService);
  await svc.onModuleInit();
  return svc;
}

// ---------------------------------------------------------------------------
// onModuleInit
// ---------------------------------------------------------------------------

describe('DocumentSummaryService – onModuleInit', () => {
  it('does not throw when GEMINI_API_KEY is absent', async () => {
    await expect(buildService(undefined)).resolves.toBeDefined();
  });

  it('does not throw when GEMINI_API_KEY is present', async () => {
    await expect(buildService('some-key')).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// summarize() – no model
// ---------------------------------------------------------------------------

describe('DocumentSummaryService.summarize – no API key', () => {
  let svc: DocumentSummaryService;

  beforeEach(async () => {
    svc = await buildService(undefined);
  });

  it('throws ServiceUnavailableException when model is not initialised', async () => {
    await expect(svc.summarize('some document text')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});

// ---------------------------------------------------------------------------
// summarize() – model present
// ---------------------------------------------------------------------------

describe('DocumentSummaryService.summarize – with model', () => {
  let svc: DocumentSummaryService;

  beforeEach(async () => {
    svc = await buildService('test-key');
  });

  function injectModel(model: ReturnType<typeof mockModel>) {
    (svc as any).model = model;
  }

  it('returns empty string for empty input without calling model', async () => {
    const spy = jest.fn();
    injectModel({ generateContent: spy } as any);

    const result = await svc.summarize('');
    expect(result).toBe('');
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns empty string for whitespace-only input', async () => {
    const spy = jest.fn();
    injectModel({ generateContent: spy } as any);

    const result = await svc.summarize('   \n  ');
    expect(result).toBe('');
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns the text response from the model', async () => {
    const summary =
      'סיכום מנהלים\n1. ערכי גלוקוז תקינים\n\nממצאים חריגים\n1. המוגלובין נמוך';
    injectModel(mockModel(summary));

    const result = await svc.summarize('blood test results: ...');
    expect(result).toBe(summary);
  });

  it('passes the document text to the model prompt', async () => {
    const docText = 'Hemoglobin 10.2 g/dL [low]';
    const model = mockModel('סיכום');
    injectModel(model);

    await svc.summarize(docText);
    const [calledPrompt] = (model.generateContent as jest.Mock).mock.calls[0];
    expect(calledPrompt).toContain(docText);
  });

  it('throws on model error', async () => {
    injectModel(mockModelThrows(new Error('API error')) as any);

    await expect(svc.summarize('document text')).rejects.toThrow(
      'Document summarization failed',
    );
  });
});
