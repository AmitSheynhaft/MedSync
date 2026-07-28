import { IVisit } from './visitInterface';
import { IDiagnosis } from '../../diagnoses/entities/diagnosisInterface';

export interface IVisitDiagnosis {
  visitId: string;
  diagnosisId: string;
  visit?: IVisit;
  diagnosis?: IDiagnosis;
  note?: string;
  createdAt: Date;
}
