import { IPatient } from '../../patients/entities/patientInterface';
import { ICaregiver } from '../../caregivers/entities/caregiverInterface';
import { ISlot } from '../../slots/entities/slotInterface';
import { IVisitRecording } from './visitRecordingInterface';
import { IVisitSummary } from './visitSummaryInterface';
import { IVisitDiagnosis } from './visitDiagnosisInterface';
import { IVisitMedicine } from './visitMedicineInterface';
import { VisitType } from '../../common/constants/domain-enums';

export interface IVisit {
  id: string;
  patientId: string;
  patient?: IPatient;
  caregiverId: string;
  caregiver?: ICaregiver;
  slotId?: string;
  slot?: ISlot;
  visitDate: Date;
  bloodPressure?: string;
  pulse?: string;
  bodyTemp?: string;
  weight?: string;
  height?: string;
  oxygenSat?: string;
  chiefComplaint?: string;
  visitType?: VisitType;
  followUpDate?: string;
  referralNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  recording?: IVisitRecording;
  summary?: IVisitSummary;
  diagnoses?: IVisitDiagnosis[];
  medicines?: IVisitMedicine[];
}
