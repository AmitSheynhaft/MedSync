import { useState } from 'react';
import { getPatients, PatientSummary } from '../../../api/patients';
import { useAsyncData } from '../../../hooks/useAsyncData';

export function usePatientSearch() {
  const [query, setQuery] = useState('');
  const { data: patients, status } = useAsyncData<PatientSummary[]>(getPatients, []);

  const searchTerm = query.trim().toLowerCase();
  const filteredPatients = !searchTerm
    ? patients ?? []
    : (patients ?? []).filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm) ||
        (patient.idNumber ?? '').toLowerCase().includes(searchTerm),
      );

  return { query, setQuery, status, filteredPatients };
}
