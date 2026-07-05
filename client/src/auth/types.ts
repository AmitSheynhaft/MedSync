import { Role } from '../constants/roles';

export type RoleName = `${Role}` | string;

export interface AuthResult {
  userId?: string;
  email: string;
  fullName: string;
  role: RoleName;
  patientId?: string;
  caregiverId?: string;
  clinicId?: string;
}

export interface RegisterPatientInput {
  role?: RoleName;
  fullName: string;
  email: string;
  password: string;
  idNumber?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  hmo?: string;
  address?: string;
  bloodType?: string;
  clinicId?: string;
}

export interface RegisterDoctorInput {
  role?: RoleName;
  fullName: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
  clinicId?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}
