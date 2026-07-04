import { Role } from '../constants/roles';
import { VIEW_AS_KEY } from './storageKeys';
import { loadUserDataSession } from './userDataSessionStore';
import type { RoleName } from './types';

export function setViewAs(role: RoleName): void {
  localStorage.setItem(VIEW_AS_KEY, role);
}

export function getViewAs(): RoleName | null {
  return localStorage.getItem(VIEW_AS_KEY);
}

export function clearViewAs(): void {
  localStorage.removeItem(VIEW_AS_KEY);
}

export function getEffectiveRole(): RoleName | null {
  return loadUserDataSession()?.role ?? null;
}

export function isRoleViewTampered(): boolean {
  const session = loadUserDataSession();
  if (!session) return false;
  const viewAs = getViewAs();
  return viewAs !== null && viewAs !== session.role;
}

export function homeForRole(role: RoleName): string {
  return role === Role.Doctor ? '/patients' : '/dashboard';
}
