import { apiDelete, apiGet, apiPatch, apiPost } from '../client';
import { CreateUserInput, UpdateUserInput } from '../users';

/**
 * Lean user shape returned by `/api/admin/users`. Only the columns the admin
 * users table renders are populated on the server; the rest are omitted.
 */
export interface IAdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  role: { name: string } | null;
}

export const getAdminUsers = (role?: string) => {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  const suffix = params.toString();
  return apiGet<IAdminUserListItem[]>(`/api/admin/users${suffix ? `?${suffix}` : ''}`);
};

export const createAdminUser = (input: CreateUserInput) =>
  apiPost<IAdminUserListItem>('/api/admin/users', input);

export const updateAdminUser = (id: string, input: UpdateUserInput) =>
  apiPatch<IAdminUserListItem>(`/api/admin/users/${id}`, input);

export const deleteAdminUser = (id: string) =>
  apiDelete<void>(`/api/admin/users/${id}`);
