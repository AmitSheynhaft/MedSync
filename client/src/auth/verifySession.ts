import { getCurrentUser, setCurrentUser } from '../atoms/useCurrentUser';
import { fetchCurrentSession } from '../api/authApi';
import { clearUserDataSession } from './userDataSessionStore';
import type { AuthResult } from './types';

export class RoleMismatchError extends Error {
  constructor() {
    super('Role mismatch detected');
    this.name = 'RoleMismatchError';
  }
}

const VERIFY_TTL_MS = 3000;

let verifyInFlight: Promise<AuthResult | null> | null = null;
let lastVerifiedAt = 0;

/**
 * Clears the cached verification so the next `verifySession` re-fetches from
 * the server. Must run on logout/account switch so one user's session (and
 * their `patientId`) is never reused for the next.
 */
export function resetSessionVerification(): void {
  verifyInFlight = null;
  lastVerifiedAt = 0;
}

export async function verifySession(options?: {
  force?: boolean;
}): Promise<AuthResult | null> {
  const isFresh = Date.now() - lastVerifiedAt < VERIFY_TTL_MS;
  const cached = getCurrentUser();
  if (!options?.force && isFresh && cached) {
    return cached;
  }
  if (verifyInFlight) return verifyInFlight;

  verifyInFlight = (async () => {
    let serverSession: AuthResult;
    try {
      serverSession = await fetchCurrentSession();
    } catch {
      clearUserDataSession();
      return null;
    } finally {
      verifyInFlight = null;
    }

    const previous = getCurrentUser();
    if (previous && previous.role !== serverSession.role) {
      clearUserDataSession();
      throw new RoleMismatchError();
    }

    setCurrentUser(serverSession);
    lastVerifiedAt = Date.now();
    return serverSession;
  })();

  return verifyInFlight;
}
