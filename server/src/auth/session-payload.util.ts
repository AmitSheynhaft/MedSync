import { ROLE_DOCTOR, ROLE_SECRETARY } from '../common/constants/roles';

export interface SessionInfo {
  email: string;
  fullName: string;
  role: string;
  patientId?: string;
  caregiverId?: string;
  clinicId?: string;
}

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  patient?: { id: string } | null;
  caregiver?: { id: string; clinicId?: string } | null;
  secretary?: { id: string; clinicId?: string } | null;
}

export function buildSessionInfo(user: SessionUser, role: string): SessionInfo {
  return {
    email: user.email,
    fullName: user.fullName,
    role,
    // Expose the patient id whenever the user has a patient profile so that a
    // doctor/secretary acting as a patient keeps patient context after refresh.
    patientId: user.patient?.id,
    caregiverId: role === ROLE_DOCTOR ? user.caregiver?.id : undefined,
    clinicId:
      role === ROLE_DOCTOR
        ? user.caregiver?.clinicId
        : role === ROLE_SECRETARY
          ? user.secretary?.clinicId
          : undefined,
  };
}
