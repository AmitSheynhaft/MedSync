import { IPatient } from '../../patients/entities/patientInterface';
import { IUser } from '../../users/entities/userInterface';
import { IDocumentSummary } from '../../documents/entities/documentSummaryInterface';
import { DocumentType, SummaryStatus } from '../../common/constants/domain-enums';

export interface IMedicalDocument {
  id: string;
  patientId: string;
  patient?: IPatient;
  uploadedByUserId: string;
  uploadedBy?: IUser;
  summaryStatus: SummaryStatus;
  documentType?: DocumentType;
  fileName: string;
  fileUrl: string;
  fileFormat?: string;
  uploadedAt: Date;
  updatedAt: Date;
  processingCount: number;
  summary?: IDocumentSummary;
}
