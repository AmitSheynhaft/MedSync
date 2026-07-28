import { IVisit } from './visitInterface';
import { VisitSummaryType } from '../../common/constants/domain-enums';

export interface IVisitSummary {
  id: string;
  visitId: string;
  visit?: IVisit;
  summaryText: string;
  visitType: VisitSummaryType;
  includedInMedicalSummary: boolean;
  createdAt: Date;
}
