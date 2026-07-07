import { Role } from '../constants/roles';
import { VIEW_AS_KEY } from './storageKeys';
import { loadUserDataSession } from './userDataSessionStore';
import { canActAs } from './roleHierarchy';
import type { RoleName } from './types';

export function setViewAs(role: RoleName): void {
  localStorage.setItem(VIEW_AS_KEY, role);
  window.dispatchEvent(new Event('medsync:viewAsChange'));
}

export function getViewAs(): RoleName | null {
  return localStorage.getItem(VIEW_AS_KEY);
}

export function clearViewAs(): void {
  localStorage.removeItem(VIEW_AS_KEY);
  window.dispatchEvent(new Event('medsync:viewAsChange'));
}

export function getEffectiveRole(): RoleName | null {
  const userSession = loadUserDataSession();
  if (!userSession) return null;

  const viewAs = getViewAs();
  if (viewAs && canActAs(userSession.role, viewAs)) {
    return viewAs;
  }
  return userSession.role;
}

export function isRoleViewTampered(): boolean {
  const session = loadUserDataSession();
  if (!session) return false;

  const viewAs = getViewAs();
  return viewAs !== null && !canActAs(session.role, viewAs);
}

export function homeForRole(role: RoleName): string {
  if (role === Role.Admin) return '/admin';
  if (role === Role.Doctor) return '/patients';
  if (role === Role.Secretary) return '/schedule';
  return '/dashboard';
}
