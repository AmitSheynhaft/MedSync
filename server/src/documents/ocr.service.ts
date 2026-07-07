import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

const OCR_PROMPT = `You are an OCR engine specialized in medical documents. Extract ALL text content from this document exactly as it appears. Preserve the structure, headings, tables, numbers, dates, and medical values. Do not summarize or interpret — just extract the raw text faithfully.

If the document contains tables (e.g. blood test results), reproduce them in a readable format with columns aligned.

If you cannot read part of the document, indicate [illegible] for that section.

Return only the extracted text, nothing else.`;

@Injectable()
export class OcrService implements OnModuleInit {
  private model!: GenerativeModel;
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set — OCR will be unavailable');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (!this.model) {
      throw new ServiceUnavailableException('שירות OCR אינו זמין — GEMINI_API_KEY חסר');
    }
    const base64Data = buffer.toString('base64');

    const result = await this.model.generateContent([
      { text: OCR_PROMPT },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    return result.response.text();
  }
}
