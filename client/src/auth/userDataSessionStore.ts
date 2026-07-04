import { getCurrentUser, setCurrentUser } from '../atoms/useCurrentUser';
import { VIEW_AS_KEY, USER_DATA_SESSION_KEY } from './storageKeys';
import type { AuthResult } from './types';

export function saveUserDataSession(result: AuthResult): void {
  setCurrentUser(result);
}

export function loadUserDataSession(): AuthResult | null {
  return getCurrentUser();
}

export function clearUserDataSession(): void {
  setCurrentUser(null);
  localStorage.removeItem(VIEW_AS_KEY);
  localStorage.removeItem(USER_DATA_SESSION_KEY);
}
