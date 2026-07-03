export interface Encounter {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  type: string;
  note?: string;
}

export interface PatientDocument {
  id: string;
  name: string;
  date: string;
  kind: string;
}

export interface ClinicalAlert {
  id: string;
  category: 'ALLERGY' | 'LIFE_THREATENING' | 'CHRONIC';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  label: string;
  source: 'AI' | 'MANUAL';
}

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | string;
  dob: string;
  email: string;
  phone: string;
  idNumber?: string;
  hmo: string;
  bloodType?: string;
  address: string;
  notes?: string;
  overview: string;
  encounters: Encounter[];
  documents: PatientDocument[];
  clinicalAlerts: ClinicalAlert[];
  createdAt: string;
  updatedAt: string;
}

export type PatientSummary = Pick<
  Patient,
  'id' | 'idNumber' | 'firstName' | 'lastName' | 'age' | 'gender'
>;

export interface CreatePatientInput {
  fullName: string;
  email: string;
  password: string;
  idNumber?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  hmo?: string;
  bloodType?: string;
  address?: string;
  notes?: string;
}

export interface UpdatePatientInput {
  fullName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  hmo?: string;
  bloodType?: string;
  address?: string;
  notes?: string;
}
