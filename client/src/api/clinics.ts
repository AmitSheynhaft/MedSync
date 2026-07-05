import { apiGet } from './client';

export interface Clinic {
  id: string;
  name: string;
}

export function getClinics(): Promise<Clinic[]> {
  return apiGet<Clinic[]>('/api/clinics');
}
