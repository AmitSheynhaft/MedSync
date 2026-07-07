import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export interface Clinic {
  id: string;
  name: string;
  address?: string;
  createdAt?: string;
}

export interface ClinicInput {
  name: string;
  address?: string;
}

export function getClinics(): Promise<Clinic[]> {
  return apiGet<Clinic[]>('/api/clinics');
}

export function getAdminClinics(): Promise<Clinic[]> {
  return apiGet<Clinic[]>('/api/admin/clinics');
}

export function createClinic(input: ClinicInput): Promise<Clinic> {
  return apiPost<Clinic>('/api/admin/clinics', input);
}

export function updateClinic(id: string, input: Partial<ClinicInput>): Promise<Clinic> {
  return apiPatch<Clinic>(`/api/admin/clinics/${id}`, input);
}

export function deleteClinic(id: string): Promise<void> {
  return apiDelete<void>(`/api/admin/clinics/${id}`);
}
