import { apiGet, apiPost } from './client';
import { clearSession } from '../auth/userSessionStore';
import type {
  AuthResult,
  RegisterDoctorInput,
  RegisterPatientInput,
} from '../auth/types';

export function registerPatient(input: RegisterPatientInput): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/register/patient', input);
}

export function registerDoctor(input: RegisterDoctorInput): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/register/doctor', input);
}

export function login(
  email: string,
  password: string,
  expectedRole?: string,
): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/login', { email, password, expectedRole });
}

export async function logout(): Promise<void> {
  try {
    await apiPost('/api/auth/logout');
  } finally {
    clearSession();
  }
}

export function fetchCurrentSession(): Promise<AuthResult> {
  return apiGet<AuthResult>('/api/auth/me');
}
