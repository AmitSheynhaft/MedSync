import { useState, useEffect, useCallback } from 'react';
import {
  adminGetUsers,
  adminDeleteUser,
  adminUpdateUser,
  adminCreateUser,
  User,
  CreateUserInput,
  UpdateUserInput,
} from '../../../api/users';
import { getRoles } from '../../../api/roles';

export interface AdminUsersState {
  users: User[];
  roles: { id: string; name: string }[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  handleCreate: (input: CreateUserInput) => Promise<void>;
  handleUpdate: (id: string, input: UpdateUserInput) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

export function useAdminUsers(): AdminUsersState {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([adminGetUsers(), getRoles()])
      .then(([u, r]) => {
        if (!active) return;
        setUsers(u);
        setRoles(r);
      })
      .catch(() => {
        if (!active) return;
        setError('טעינת המשתמשים נכשלה');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => load(), [load]);

  const handleCreate = async (input: CreateUserInput) => {
    await adminCreateUser(input);
    load();
  };

  const handleUpdate = async (id: string, input: UpdateUserInput) => {
    await adminUpdateUser(id, input);
    load();
  };

  const handleDelete = async (id: string) => {
    await adminDeleteUser(id);
    load();
  };

  return { users, roles, loading, error, refresh: load, handleCreate, handleUpdate, handleDelete };
}
