import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export interface User {
  id: string;
  roleId: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
  role?: { id: string; name: string };
}

export interface CreateUserInput {
  roleId?: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {}

export const getUsers = (role?: string) =>
  apiGet<User[]>(`/api/users${role ? `?role=${encodeURIComponent(role)}` : ''}`);
export const getUser = (id: string) => apiGet<User>(`/api/users/${id}`);
/** Fetch the authenticated user's own profile (identity from the token). */
export const getMe = () => apiGet<User>('/api/users/me');
/** Update the authenticated user's own profile. */
export const updateMe = (input: UpdateUserInput) =>
  apiPatch<User>('/api/users/me', input);
export const createUser = (input: CreateUserInput) =>
  apiPost<User>('/api/users', input);
export const updateUser = (id: string, input: UpdateUserInput) =>
  apiPatch<User>(`/api/users/${id}`, input);
export const deleteUser = (id: string) => apiDelete<void>(`/api/users/${id}`);
