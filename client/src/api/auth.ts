import { apiGet, apiPost } from './client';

export type RoleName = 'patient' | 'doctor' | string;

export interface AuthResult {
  userId: string;
  email: string;
  fullName: string;
  role: RoleName;
  accessToken?: string;
  refreshToken?: string;
  patientId?: string;
  caregiverId?: string;
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
}

export interface RegisterDoctorInput {
  role?: RoleName;
  fullName: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export function registerPatient(input: RegisterPatientInput): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/register/patient', input);
}

export function registerDoctor(input: RegisterDoctorInput): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/register/doctor', input);
}

export function login(email: string, password: string, expectedRole?: string): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/login', { email, password, expectedRole });
}

const SESSION_KEY = 'medsync.session';
const VIEW_AS_KEY = 'medsync.viewAs';

export function saveSession(result: AuthResult) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(result));
}

export function setViewAs(role: RoleName) {
  localStorage.setItem(VIEW_AS_KEY, role);
}

export function getViewAs(): RoleName | null {
  return localStorage.getItem(VIEW_AS_KEY);
}

export function clearViewAs() {
  localStorage.removeItem(VIEW_AS_KEY);
}

export function getEffectiveRole(): RoleName | null {
  const session = loadSession();
  if (!session) return null;
  const viewAs = getViewAs();
  // A doctor may view the patient interface; a patient can only be a patient.
  if (session.role === 'doctor' && viewAs === 'patient') return 'patient';
  return session.role;
}

export function loadSession(): AuthResult | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResult;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('role');
  localStorage.removeItem(VIEW_AS_KEY);
}

export class RoleMismatchError extends Error {
  constructor() {
    super('Role mismatch detected');
    this.name = 'RoleMismatchError';
  }
}

export async function verifySession(): Promise<AuthResult | null> {
  const session = loadSession();
  if (!session) return null;
  let serverSession: AuthResult;
  try {
    serverSession = await apiGet<AuthResult>('/api/auth/me');
  } catch {
    clearSession();
    return null;
  }
  if (
    serverSession.role !== session.role ||
    serverSession.userId !== session.userId
  ) {
    clearSession();
    throw new RoleMismatchError();
  }
  return serverSession;
}
