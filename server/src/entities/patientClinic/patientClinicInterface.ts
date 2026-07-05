import { IPatient } from '../patient/patientInterface';
import { IClinic } from '../clinic/clinicInterface';

export interface IPatientClinic {
  patientId: string;
  clinicId: string;
  patient?: IPatient;
  clinic?: IClinic;
  createdAt: Date;
}
