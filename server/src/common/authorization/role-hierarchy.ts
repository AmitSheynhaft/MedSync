
import {
  ROLE_DOCTOR,
  ROLE_PATIENT,
  ROLE_SECRETARY,
  TRoleName,
  ROLE_ADMIN
} from '../constants/roles';

export const ROLE_HIERARCHY: Record<string, TRoleName[]> = {
  // Admins are scoped to admin-only endpoints. They may also act as a patient
  // (self-scoped patient endpoints) but never as doctor or secretary.
  [ROLE_ADMIN]: [ROLE_ADMIN, ROLE_PATIENT],
  [ROLE_DOCTOR]: [ROLE_DOCTOR, ROLE_PATIENT],
  [ROLE_PATIENT]: [ROLE_PATIENT],
  // A secretary may also act as a patient. Login resolves patient context for
  // patient-interface sign-in based on the acting user's available clinic scope.
  [ROLE_SECRETARY]: [ROLE_SECRETARY, ROLE_PATIENT],
};

export function getEffectiveRoles(role: string): string[] {
  return ROLE_HIERARCHY[role] ?? [role];
}

export function hasRequiredRole(
  userRole: string,
  requiredRoles: string[],
): boolean {
  const effectiveRoles = getEffectiveRoles(userRole);
  return requiredRoles.some((role) => effectiveRoles.includes(role as TRoleName));
}
