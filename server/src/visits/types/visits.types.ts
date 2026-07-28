import { VisitSummaryObject } from './visit-summary.types';

export interface TranscribeResult {
  transcript: string;
  summary: VisitSummaryObject;
}

export interface SummarizeResult {
  summary: VisitSummaryObject;
}
