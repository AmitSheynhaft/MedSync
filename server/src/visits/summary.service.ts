import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

export interface VisitSummaryObject {
  patientComplaints: string;
  diagnosis: string;
  doctorsRecommendations: string;
}

const SUMMARY_PROMPT = `You are a medical scribe transcribing a conversation between a caregiver (doctor) and a patient. The transcript may be in Hebrew or English. Produce the summary content in the same language as the transcript.

Read the transcript carefully and identify:
- What the patient is complaining about (symptoms, concerns, history they describe)
- The doctor's diagnosis or clinical impression
- The doctor's recommendations (treatment, medications, follow-up, lifestyle advice, referrals)

Return ONLY a valid JSON object with exactly these three keys:
{
  "patientComplaints": "...",
  "diagnosis": "...",
  "doctorsRecommendations": "..."
}

Use concise clinical language. Quote or paraphrase the speakers faithfully — do not invent facts. If a section has no information in the transcript, use the value "Not documented." for that key. Do not include any text outside the JSON object.

Transcript:
`;

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

  async summarize(transcript: string): Promise<VisitSummaryObject> {
    if (!this.model) {
      throw new ServiceUnavailableException('שירות הסיכום אינו זמין — GEMINI_API_KEY חסר');
    }
    if (!transcript || transcript.length === 0) {
      return { patientComplaints: '', diagnosis: '', doctorsRecommendations: '' };
    }

    try {
      const result = await this.model.generateContent(
        `${SUMMARY_PROMPT}${transcript}`,
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
