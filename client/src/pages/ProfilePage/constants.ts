import { Role } from '../../constants/roles';
import type { RoleName } from '../../auth/types';

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: 'מנהל מערכת',
  [Role.Doctor]: 'רופא',
  [Role.Patient]: 'מטופל',
  [Role.Secretary]: 'מזכירה',
};

export function getRoleLabel(role: RoleName | null | undefined): string {
  if (!role) return ROLE_LABELS[Role.Patient];
  if (role === Role.Admin) return ROLE_LABELS[Role.Admin];
  if (role === Role.Doctor) return ROLE_LABELS[Role.Doctor];
  if (role === Role.Secretary) return ROLE_LABELS[Role.Secretary];
  return ROLE_LABELS[Role.Patient];
}
