import { ROLE_DOCTOR, ROLE_PATIENT, TRoleName } from '../constants/roles';

export const ROLE_HIERARCHY: Record<string, TRoleName[]> = {
  [ROLE_DOCTOR]: [ROLE_DOCTOR, ROLE_PATIENT],
  [ROLE_PATIENT]: [ROLE_PATIENT],
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
