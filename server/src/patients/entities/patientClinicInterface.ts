import { IPatient } from './patientInterface';
import { IClinic } from '../../clinics/entities/clinicInterface';

export interface IPatientClinic {
  patientId: string;
  clinicId: string;
  patient?: IPatient;
  clinic?: IClinic;
  createdAt: Date;
}
