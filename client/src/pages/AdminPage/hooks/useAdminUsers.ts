import { useState, useEffect } from 'react';
import {
  getUsers,
  deleteUser,
  updateUser,
  createUser,
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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getUsers(), getRoles()])
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
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = () => setReloadKey(key => key + 1);

  const handleCreate = async (input: CreateUserInput) => {
    try {
      await createUser(input);
      refresh();
    } catch (err) {
      setError('יצירת המשתמש נכשלה');
      throw err;
    }
  };

  const handleUpdate = async (id: string, input: UpdateUserInput) => {
    try {
      await updateUser(id, input);
      refresh();
    } catch (err) {
      setError('עדכון המשתמש נכשל');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      refresh();
    } catch (err) {
      setError('מחיקת המשתמש נכשלה');
      throw err;
    }
  };

  return { users, roles, loading, error, refresh, handleCreate, handleUpdate, handleDelete };
}
