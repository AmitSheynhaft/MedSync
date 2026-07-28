import { Injectable } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { SummaryService, VisitSummaryObject } from './summary.service';

export interface TranscribeResult {
  transcript: string;
  summary: VisitSummaryObject;
}

export interface SummarizeResult {
  summary: VisitSummaryObject;
}

@Injectable()
export class VisitsService {
  constructor(
    private readonly speechService: SpeechService,
    private readonly summaryService: SummaryService,
  ) {}

  async transcribeVisitAudio(audioBuffer: Buffer): Promise<TranscribeResult> {
    const transcript = await this.speechService.transcribeVisitAudio(audioBuffer);
    const summary =
      await this.summaryService.generateStructuredVisitSummary(transcript);
    return { transcript, summary };
  }

  async summarizeVisitText(text: string): Promise<SummarizeResult> {
    const summary = await this.summaryService.generateStructuredVisitSummary(text);
    return { summary };
  }
}
