import { useMemo, useState } from 'react';
import { getPatients, PatientSummary } from '../../../api/patients';
import { useAsyncData } from '../../../hooks/useAsyncData';

export function usePatientSearch() {
  const [query, setQuery] = useState('');
  const { data: patients, status } = useAsyncData<PatientSummary[]>(getPatients, []);

  const filteredPatients = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return patients ?? [];
    return (patients ?? []).filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm) ||
      (patient.idNumber ?? '').toLowerCase().includes(searchTerm),
    );
  }, [query, patients]);

  return { query, setQuery, status, filteredPatients };
}
