import { User } from '../entities/userEntity';

export interface CreateUserInput {
  roleId?: string;
  roleName?: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string | Date;
  gender?: string;
  clinicId?: string;
}

export interface UpdateUserInput {
  roleId?: string;
  roleName?: string;
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  birthDate?: string | Date;
  gender?: string;
}

export type SafeUser = Omit<User, 'password'>;

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: Date | null;
  gender: string | null;
  role: { name: string } | null;
}
