import { ROLE_DOCTOR, ROLE_PATIENT } from '../common/constants/roles';

export interface SessionInfo {
  email: string;
  fullName: string;
  role: string;
  patientId?: string;
  caregiverId?: string;
}

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  patient?: { id: string } | null;
  caregiver?: { id: string } | null;
}

export function buildSessionInfo(user: SessionUser, role: string): SessionInfo {
  return {
    email: user.email,
    fullName: user.fullName,
    role,
    patientId: role === ROLE_PATIENT ? user.patient?.id : undefined,
    caregiverId: role === ROLE_DOCTOR ? user.caregiver?.id : undefined,
  };
}
