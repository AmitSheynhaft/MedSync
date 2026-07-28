import { IUser } from '../../users/entities/userInterface';
import { ISlot } from '../../slots/entities/slotInterface';
import { IMedicalDocument } from '../../medical-documents/entities/medicalDocumentInterface';
import { IVisit } from '../../visits/entities/visitInterface';
import { IPatientClinic } from './patientClinicInterface';

export interface IPatient {
  id: string;
  userId: string;
  user?: IUser;
  idNumber?: string;
  hmo?: string;
  bloodType?: string;
  address: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  slots?: ISlot[];
  documents?: IMedicalDocument[];
  visits?: IVisit[];
  patientClinics?: IPatientClinic[];
}