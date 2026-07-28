import { Injectable } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { SummaryService } from './summary.service';
import { SummarizeResult, TranscribeResult } from './types/visits.types';

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
