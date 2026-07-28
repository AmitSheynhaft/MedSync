import { IRole } from '../../roles/entities/roleInterface';
import { IPatient } from '../../patients/entities/patientInterface';
import { ICaregiver } from '../../caregivers/entities/caregiverInterface';
import { ISecretary } from './secretaryInterface';

export interface IUser {
  id: string;
  roleId: string;
  role?: IRole;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: IPatient;
  caregiver?: ICaregiver;
  secretary?: ISecretary;
}
