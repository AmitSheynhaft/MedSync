import { IVisit } from '../visit/visitInterface';
import { VisitSummaryType } from '../enums';

export interface IVisitSummary {
  id: string;
  visitId: string;
  visit?: IVisit;
  summaryText: string;
  visitType: VisitSummaryType;
  includedInMedicalSummary: boolean;
  createdAt: Date;
}
