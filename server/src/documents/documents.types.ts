import { SummaryStatus } from '../entities/enums';

export interface PendingMedicalDocumentResult {
  id: string;
  filename: string;
  status: SummaryStatus;
  patientId: string;
}

export interface DocumentFileDataResult {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  patientId: string | null;
}

export interface DocumentSummaryResult {
  summaryText: string;
  fileName: string;
  patientId: string | null;
}
