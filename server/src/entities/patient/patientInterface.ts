import { IUser } from '../user/userInterface';
import { ISlot } from '../slot/slotInterface';
import { IMedicalDocument } from '../medicalDocument/medicalDocumentInterface';
import { IVisit } from '../visit/visitInterface';
import { IPatientClinic } from '../patientClinic/patientClinicInterface';

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