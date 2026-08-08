import { useState, useEffect } from 'react';
import {
  getAdminClinics,
  createClinic,
  updateClinic,
  deleteClinic,
} from '../../../api/admin/clinics';
import { Clinic, ClinicInput } from '../../../api/clinics';

export interface AdminClinicsState {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  handleCreate: (input: ClinicInput) => Promise<void>;
  handleUpdate: (id: string, input: Partial<ClinicInput>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

export function useAdminClinics(enabled = true): AdminClinicsState {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    getAdminClinics()
      .then((data) => { if (active) setClinics(data); })
      .catch(() => { if (active) setError('טעינת המרפאות נכשלה'); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, [enabled, reloadKey]);

  const refresh = () => setReloadKey(key => key + 1);

  const handleCreate = async (input: ClinicInput) => {
    try {
      await createClinic(input);
      refresh();
    } catch (err) {
      setError('יצירת המרפאה נכשלה');
      throw err;
    }
  };

  const handleUpdate = async (id: string, input: Partial<ClinicInput>) => {
    try {
      await updateClinic(id, input);
      refresh();
    } catch (err) {
      setError('עדכון המרפאה נכשל');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClinic(id);
      refresh();
    } catch (err) {
      setError('מחיקת המרפאה נכשלה');
      throw err;
    }
  };

  return { clinics, loading, error, refresh, handleCreate, handleUpdate, handleDelete };
}
