import { Role } from '../constants/roles';
import type { RoleName } from './types';

const ROLE_HIERARCHY: Record<string, RoleName[]> = {
  [Role.Doctor]: [Role.Doctor, Role.Patient],
  [Role.Patient]: [Role.Patient],
  // A secretary may also act as a patient (the server only allows the patient
  // login when she actually has a patient profile in a clinic).
  [Role.Secretary]: [Role.Secretary, Role.Patient],
};

export function getEffectiveRoles(role: string): RoleName[] {
  return ROLE_HIERARCHY[role] ?? [role as RoleName];
}

export function canActAs(realRole: string, targetRole: string): boolean {
  return getEffectiveRoles(realRole).includes(targetRole as RoleName);
}
