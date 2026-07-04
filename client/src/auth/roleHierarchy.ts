import { Role } from '../constants/roles';
import type { RoleName } from './types';

const ROLE_HIERARCHY: Record<string, RoleName[]> = {
  [Role.Doctor]: [Role.Doctor, Role.Patient],
  [Role.Patient]: [Role.Patient],
};

export function getEffectiveRoles(role: string): RoleName[] {
  return ROLE_HIERARCHY[role] ?? [role as RoleName];
}

export function canActAs(realRole: string, targetRole: string): boolean {
  return getEffectiveRoles(realRole).includes(targetRole as RoleName);
}
