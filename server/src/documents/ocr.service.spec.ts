import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { OcrService } from './ocr.service';

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

async function buildService(apiKey: string | undefined): Promise<OcrService> {
  const configService = {
    get: jest.fn().mockImplementation((key: string) =>
      key === 'GEMINI_API_KEY' ? apiKey : undefined,
    ),
  } as unknown as ConfigService;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OcrService,
      { provide: ConfigService, useValue: configService },
    ],
  }).compile();

  const svc = module.get(OcrService);
  await svc.onModuleInit();
  return svc;
}

const FAKE_PDF_BUFFER = Buffer.from('%PDF-1.4 fake-content');

// ---------------------------------------------------------------------------
// onModuleInit
// ---------------------------------------------------------------------------

describe('OcrService – onModuleInit', () => {
  it('does not throw when GEMINI_API_KEY is absent', async () => {
    await expect(buildService(undefined)).resolves.toBeDefined();
  });

  it('does not throw when GEMINI_API_KEY is present', async () => {
    await expect(buildService('key')).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// extractText() – no model
// ---------------------------------------------------------------------------

describe('OcrService.extractText – no API key', () => {
  let svc: OcrService;

  beforeEach(async () => {
    svc = await buildService(undefined);
  });

  it('throws ServiceUnavailableException when model is not initialised', async () => {
    await expect(
      svc.extractText(FAKE_PDF_BUFFER, 'application/pdf'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

// ---------------------------------------------------------------------------
// extractText() – model present
// ---------------------------------------------------------------------------

describe('OcrService.extractText – with model', () => {
  let svc: OcrService;

  beforeEach(async () => {
    svc = await buildService('test-key');
  });

  function injectModel(model: ReturnType<typeof mockModel>) {
    (svc as any).model = model;
  }

  it('returns the text returned by the model', async () => {
    const extracted = 'Patient: John Doe\nHemoglobin: 12.5 g/dL';
    injectModel(mockModel(extracted));

    const result = await svc.extractText(FAKE_PDF_BUFFER, 'application/pdf');
    expect(result).toBe(extracted);
  });

  it('sends the buffer as base64 inlineData to the model', async () => {
    const model = mockModel('text');
    injectModel(model);
    const buf = Buffer.from('hello');

    await svc.extractText(buf, 'image/jpeg');

    const [calledArgs] = (model.generateContent as jest.Mock).mock.calls[0];
    // calledArgs is an array: [{ text: OCR_PROMPT }, { inlineData: { mimeType, data } }]
    const inlineData = calledArgs[1].inlineData;
    expect(inlineData.mimeType).toBe('image/jpeg');
    expect(inlineData.data).toBe(buf.toString('base64'));
  });

  it('passes the OCR prompt as the first content part', async () => {
    const model = mockModel('extracted text');
    injectModel(model);

    await svc.extractText(FAKE_PDF_BUFFER, 'application/pdf');

    const [calledArgs] = (model.generateContent as jest.Mock).mock.calls[0];
    expect(typeof calledArgs[0].text).toBe('string');
    expect(calledArgs[0].text.length).toBeGreaterThan(0);
  });

  it('propagates errors thrown by the model', async () => {
    injectModel(mockModelThrows(new Error('Vision API error')) as any);

    await expect(
      svc.extractText(FAKE_PDF_BUFFER, 'application/pdf'),
    ).rejects.toThrow('Vision API error');
  });
});
