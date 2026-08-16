import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { VISIT_SUMMARY_PROMPT } from './constants/visit-summary.constants';
import { VisitSummaryObject } from './types/visit-summary.types';

@Injectable()
export class SummaryService implements OnModuleInit {
  private model!: GenerativeModel;
  private readonly logger = new Logger(SummaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set — visit summarization will be unavailable');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateStructuredVisitSummary(
    transcript: string,
  ): Promise<VisitSummaryObject> {
    if (!this.model) {
      throw new ServiceUnavailableException('שירות הסיכום אינו זמין — GEMINI_API_KEY חסר');
    }
    if (!transcript || transcript.length === 0) {
      return { patientComplaints: '', diagnosis: '', doctorsRecommendations: '', vitals: {} };
    }

    try {
      const result = await this.model.generateContent(
        `${VISIT_SUMMARY_PROMPT}${transcript}`,
      );
      const raw = result.response.text().trim();
      // Strip markdown code fences if the model wraps the JSON
      const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(jsonText) as VisitSummaryObject;
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Summarization failed: ${detail}`);
    }
  }
}
