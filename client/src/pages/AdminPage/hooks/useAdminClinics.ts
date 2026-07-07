import { useState, useEffect, useCallback } from 'react';
import {
  getAdminClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  Clinic,
  ClinicInput,
} from '../../../api/clinics';

export interface AdminClinicsState {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  handleCreate: (input: ClinicInput) => Promise<void>;
  handleUpdate: (id: string, input: Partial<ClinicInput>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

export function useAdminClinics(): AdminClinicsState {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAdminClinics()
      .then((data) => { if (active) setClinics(data); })
      .catch(() => { if (active) setError('טעינת המרפאות נכשלה'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => load(), [load]);

  const handleCreate = async (input: ClinicInput) => {
    try {
      await createClinic(input);
      load();
    } catch (err) {
      setError('יצירת המרפאה נכשלה');
      throw err;
    }
  };

  const handleUpdate = async (id: string, input: Partial<ClinicInput>) => {
    try {
      await updateClinic(id, input);
      load();
    } catch (err) {
      setError('עדכון המרפאה נכשל');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClinic(id);
      load();
    } catch (err) {
      setError('מחיקת המרפאה נכשלה');
      throw err;
    }
  };

  return { clinics, loading, error, refresh: load, handleCreate, handleUpdate, handleDelete };
}
