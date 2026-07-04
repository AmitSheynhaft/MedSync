import { getCurrentUser, setCurrentUser } from '../atoms/useCurrentUser';
import { VIEW_AS_KEY, SESSION_KEY } from './storageKeys';
import type { AuthResult } from './types';

export function saveSession(result: AuthResult): void {
  setCurrentUser(result);
}

export function loadUserSession(): AuthResult | null {
  return getCurrentUser();
}

export function clearSession(): void {
  setCurrentUser(null);
  localStorage.removeItem(VIEW_AS_KEY);
  localStorage.removeItem(SESSION_KEY);
}
