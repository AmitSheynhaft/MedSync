import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Diagnosis, getDiagnoses } from '../../../api/diagnoses';
import { Medicine, getMedicines } from '../../../api/medicines';

interface UseVisitCatalogOptionsResult {
  diagnosisSearch: string;
  setDiagnosisSearch: Dispatch<SetStateAction<string>>;
  diagnosisOptions: Diagnosis[];
  medicineSearch: string;
  setMedicineSearch: Dispatch<SetStateAction<string>>;
  medicineOptions: Medicine[];
}

export function useVisitCatalogOptions(
  isReadOnly: boolean,
): UseVisitCatalogOptionsResult {
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [diagnosisOptions, setDiagnosisOptions] = useState<Diagnosis[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineOptions, setMedicineOptions] = useState<Medicine[]>([]);

  // Debounced diagnosis search and initial load. In dev Strict Mode, the first
  // mount timeout is cleaned up before firing, so this still performs one query.
  useEffect(() => {
    if (isReadOnly) return;
    const trimmedSearch = diagnosisSearch.trim();
    const debounceTimer = window.setTimeout(() => {
      getDiagnoses(trimmedSearch || undefined)
        .then((responseDiagnoses) =>
          setDiagnosisOptions(
            responseDiagnoses.slice(0, trimmedSearch ? 10 : 30),
          ),
        )
        .catch(() => {});
    }, 250);
    return () => window.clearTimeout(debounceTimer);
  }, [diagnosisSearch, isReadOnly]);

  // Debounced medicine search and initial load.
  useEffect(() => {
    if (isReadOnly) return;
    const trimmedSearch = medicineSearch.trim();
    const debounceTimer = window.setTimeout(() => {
      getMedicines(trimmedSearch || undefined)
        .then((responseMedicines) =>
          setMedicineOptions(
            responseMedicines.slice(0, trimmedSearch ? 10 : 30),
          ),
        )
        .catch(() => {});
    }, 250);
    return () => window.clearTimeout(debounceTimer);
  }, [medicineSearch, isReadOnly]);

  return {
    diagnosisSearch,
    setDiagnosisSearch,
    diagnosisOptions,
    medicineSearch,
    setMedicineSearch,
    medicineOptions,
  };
}
