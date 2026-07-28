import { setCurrentUser } from '../atoms/useCurrentUser';
import { VIEW_AS_KEY } from '../auth/storageKeys';
import { HTTP_UNAUTHORIZED } from './constants';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';


function clearClientSession() {
  setCurrentUser(null);
  localStorage.removeItem(VIEW_AS_KEY);
}

// Single-flight refresh: concurrent 401s share one refresh request.
let pendingRefreshRequest: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (pendingRefreshRequest) return pendingRefreshRequest;

  pendingRefreshRequest = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      pendingRefreshRequest = null;
    }
  })();

  return pendingRefreshRequest;
}

export interface ApiError extends Error {
  status: number;
  body?: unknown;
}

interface ApiErrorPayload {
  message?: string | string[];
}

async function readError(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === 'object') {
      const message = (data as ApiErrorPayload).message;
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
    return JSON.stringify(data);
  } catch {
    return res.statusText || `Request failed: ${res.status}`;
  }
}

const NO_REFRESH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
];

function shouldSkipRefresh(path: string): boolean {
  return NO_REFRESH_PATHS.some((p) => path.startsWith(p));
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, credentials: 'include' });
  if (!res.ok) {
    if (res.status === HTTP_UNAUTHORIZED) {
      if (allowRefresh && !shouldSkipRefresh(path)) {
        const refreshed = await refreshSession();
        if (refreshed) {
          return apiRequest<T>(path, options, false);
        }
      }
      clearClientSession();
    }
    const detail = await readError(res);
    const err = new Error(detail) as ApiError;
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return undefined as T;
  return (await res.json()) as T;
}

export function apiJson<T = unknown>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiBlob(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<Blob> {
  const res = await fetch(`${BASE_URL}${path}`, { ...options, credentials: 'include' });
  if (!res.ok) {
    if (res.status === HTTP_UNAUTHORIZED) {
      if (allowRefresh && !shouldSkipRefresh(path)) {
        const refreshed = await refreshSession();
        if (refreshed) {
          return apiBlob(path, options, false);
        }
      }
      clearClientSession();
    }
    const detail = await readError(res);
    const err = new Error(detail) as ApiError;
    err.status = res.status;
    throw err;
  }
  return res.blob();
}

export const apiGet = <T = unknown>(path: string) => apiRequest<T>(path);
export const apiPost = <T = unknown>(path: string, body?: unknown) =>
  apiJson<T>(path, 'POST', body);
export const apiPatch = <T = unknown>(path: string, body?: unknown) =>
  apiJson<T>(path, 'PATCH', body);
export const apiPut = <T = unknown>(path: string, body?: unknown) =>
  apiJson<T>(path, 'PUT', body);
export const apiDelete = <T = unknown>(path: string) =>
  apiRequest<T>(path, { method: 'DELETE' });
