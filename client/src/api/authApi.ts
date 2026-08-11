import { apiGet, apiPost } from "./client";
import { clearUserDataSession } from "../auth/userDataSessionStore";
import type {
  AuthResult,
  RegisterDoctorInput,
  RegisterPatientInput,
  RegisterSecretaryInput,
} from "../auth/types";

export function registerPatient(
  input: RegisterPatientInput,
): Promise<AuthResult> {
  return apiPost<AuthResult>("/api/auth/register/patient", input);
}

export function registerDoctor(
  input: RegisterDoctorInput,
): Promise<AuthResult> {
  return apiPost<AuthResult>("/api/auth/register/doctor", input);
}

export function registerSecretary(
  input: RegisterSecretaryInput,
): Promise<AuthResult> {
  return apiPost<AuthResult>("/api/auth/register/secretary", input);
}

export function login(
  email: string,
  password: string,
  expectedRole?: string,
): Promise<AuthResult> {
  return apiPost<AuthResult>("/api/auth/login", {
    email,
    password,
    expectedRole,
  });
}

export async function logout(): Promise<void> {
  try {
    await apiPost("/api/auth/logout");
  } finally {
    clearUserDataSession();
  }
}

export function fetchCurrentSession(): Promise<AuthResult> {
  return apiGet<AuthResult>("/api/auth/me");
}
