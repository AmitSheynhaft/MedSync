import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import { Paginated } from './pagination';

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

export type ClinicalAlertCategory = 'ALLERGY' | 'LIFE_THREATENING' | 'CHRONIC';
export type ClinicalAlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type ClinicalAlertSource = 'AI' | 'MANUAL';

export interface ClinicalAlert {
  id: string;
  category: ClinicalAlertCategory;
  severity: ClinicalAlertSeverity;
  label: string;
  source: ClinicalAlertSource;
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
  hmo: string;
  idNumber?: string;
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

export interface PatientListQuery {
  search?: string;
  page?: number;
  limit?: number;
}

const patientByIdInFlight = new Map<string, Promise<Patient>>();

export function getPatients(search?: string): Promise<PatientSummary[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const suffix = params.toString();
  return apiGet<PatientSummary[]>(`/api/patients${suffix ? `?${suffix}` : ''}`);
}

export function getPatientsPage({
  search,
  page = 1,
  limit = 20,
}: PatientListQuery = {}): Promise<Paginated<PatientSummary>> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return apiGet<Paginated<PatientSummary>>(`/api/patients?${params.toString()}`);
}

export function getPatientById(id: string): Promise<Patient> {
  const normalizedId = id.trim();
  const inFlight = patientByIdInFlight.get(normalizedId);
  if (inFlight) {
    return inFlight;
  }

  const request = apiGet<Patient>(
    `/api/patients/${encodeURIComponent(normalizedId)}`,
  ).finally(() => {
    patientByIdInFlight.delete(normalizedId);
  });

  patientByIdInFlight.set(normalizedId, request);
  return request;
}

export function createPatient(input: CreatePatientInput): Promise<Patient> {
  return apiPost<Patient>('/api/patients', input);
}

export function updatePatient(
  id: string,
  input: UpdatePatientInput,
): Promise<Patient> {
  return apiPatch<Patient>(`/api/patients/${encodeURIComponent(id)}`, input);
}

export function deletePatient(id: string): Promise<void> {
  return apiDelete<void>(`/api/patients/${encodeURIComponent(id)}`);
}

export function refreshMedicalSummary(id: string): Promise<Patient> {
  return apiPost<Patient>(
    `/api/patients/${encodeURIComponent(id)}/medical-summary/refresh`,
    {},
  );
}
