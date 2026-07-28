import { IPatientClinic } from '../../patients/entities/patientClinicInterface';

export interface IClinic {
  id: string;
  name: string;
  address?: string;
  createdAt: Date;
  patientClinics?: IPatientClinic[];
}
