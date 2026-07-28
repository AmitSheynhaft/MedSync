import { RecordingStatus, VisitSummaryType } from '../../common/constants/domain-enums';

export interface VisitInput {
  patientId: string;
  caregiverId: string;
  slotId?: string;
  visitDate: string | Date;
  actingClinicId?: string;
  actingUserId?: string;
  bloodPressure?: string;
  pulse?: string;
  bodyTemp?: string;
  weight?: string;
  height?: string;
  oxygenSat?: string;
  chiefComplaint?: string;
  visitType?: string;
  followUpDate?: string;
  referralNotes?: string;
}

export interface VisitRecordingInput {
  status?: RecordingStatus;
  audioUrl: string;
  transcriptText?: string;
}

export interface VisitSummaryInput {
  summaryText: string;
  visitType: VisitSummaryType;
}

export interface VisitDiagnosisInput {
  diagnosisId?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  note?: string;
}

export interface VisitMedicineInput {
  medicineId?: string;
  medicineName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}
