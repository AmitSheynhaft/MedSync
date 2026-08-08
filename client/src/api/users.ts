import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import { Paginated } from './pagination';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
  role?: { name: string };
}

export interface CreateUserInput {
  roleId?: string;
  roleName?: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  clinicId?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {}

export interface UserListQuery {
  role?: string;
  page?: number;
  limit?: number;
}

export const getUsers = (role?: string) => {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  const suffix = params.toString();
  return apiGet<User[]>(`/api/users${suffix ? `?${suffix}` : ''}`);
};
export const getUsersPage = ({ role, page = 1, limit = 20 }: UserListQuery = {}) => {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return apiGet<Paginated<User>>(`/api/users?${params.toString()}`);
};
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
