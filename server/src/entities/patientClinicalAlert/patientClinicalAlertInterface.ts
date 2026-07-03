import {
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
  ClinicalAlertSource,
} from '../enums';

export interface IPatientClinicalAlert {
  id: string;
  patientId: string;
  category: ClinicalAlertCategory;
  severity: ClinicalAlertSeverity;
  label: string;
  normalizedKey: string;
  source: ClinicalAlertSource;
  createdAt: Date;
  updatedAt: Date;
}
