import { useState, useEffect } from 'react';
import {
  getAdminUsers,
  deleteAdminUser,
  updateAdminUser,
  createAdminUser,
  IAdminUserListItem,
} from '../../../api/admin/users';
import { CreateUserInput, UpdateUserInput } from '../../../api/users';
import { ALL_ROLES } from '../../../constants/roles';

const ADMIN_ROLE_OPTIONS = ALL_ROLES.map((roleName) => ({ id: roleName, name: roleName }));

export interface AdminUsersState {
  users: IAdminUserListItem[];
  roles: { id: string; name: string }[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  handleCreate: (input: CreateUserInput) => Promise<void>;
  handleUpdate: (id: string, input: UpdateUserInput) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

export function useAdminUsers(): AdminUsersState {
  const [users, setUsers] = useState<IAdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAdminUsers()
      .then((u) => {
        if (!active) return;
        setUsers(u);
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
      await createAdminUser(input);
      refresh();
    } catch (err) {
      setError('יצירת המשתמש נכשלה');
      throw err;
    }
  };

  const handleUpdate = async (id: string, input: UpdateUserInput) => {
    try {
      await updateAdminUser(id, input);
      refresh();
    } catch (err) {
      setError('עדכון המשתמש נכשל');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminUser(id);
      refresh();
    } catch (err) {
      setError('מחיקת המשתמש נכשלה');
      throw err;
    }
  };

  return {
    users,
    roles: ADMIN_ROLE_OPTIONS,
    loading,
    error,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
