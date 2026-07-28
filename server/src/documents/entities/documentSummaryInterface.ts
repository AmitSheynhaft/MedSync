import { IMedicalDocument } from '../../medical-documents/entities/medicalDocumentInterface';

export interface IDocumentSummary {
  id: string;
  documentId: string;
  document?: IMedicalDocument;
  summaryText: string;
  extractedText: string;
  includedInMedicalSummary: boolean;
  createdAt: Date;
}
