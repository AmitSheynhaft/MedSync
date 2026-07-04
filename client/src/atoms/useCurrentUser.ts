import { atom, getDefaultStore, useAtomValue } from 'jotai';
import type { AuthResult } from '../auth/types';

export const currentUserAtom = atom<AuthResult | null>(null);

const store = getDefaultStore();

export function getCurrentUser(): AuthResult | null {
  return store.get(currentUserAtom);
}

export function setCurrentUser(value: AuthResult | null) {
  store.set(currentUserAtom, value);
}

export function useCurrentUser(): AuthResult | null {
  return useAtomValue(currentUserAtom);
}
