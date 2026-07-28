import { IVisitDiagnosis } from '../../visits/entities/visitDiagnosisInterface';

export interface IDiagnosis {
  id: string;
  code: string;
  description: string;
  visitDiagnoses?: IVisitDiagnosis[];
}
