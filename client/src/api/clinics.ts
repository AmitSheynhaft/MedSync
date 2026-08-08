import { apiGet } from './client';

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
