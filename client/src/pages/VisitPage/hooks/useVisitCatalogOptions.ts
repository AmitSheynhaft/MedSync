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

  // Pre-load catalog options for the editing dropdowns. These are doctor-only
  // endpoints, so skip them in read-only (patient) mode to avoid 403s.
  useEffect(() => {
    if (isReadOnly) return;
    getDiagnoses()
      .then((responseDiagnoses) => setDiagnosisOptions(responseDiagnoses.slice(0, 30)))
      .catch(() => {});
    getMedicines()
      .then((responseMedicines) => setMedicineOptions(responseMedicines.slice(0, 30)))
      .catch(() => {});
  }, [isReadOnly]);

  // Debounced diagnosis search.
  useEffect(() => {
    if (isReadOnly || !diagnosisSearch.trim()) return;
    const debounceTimer = window.setTimeout(() => {
      getDiagnoses(diagnosisSearch)
        .then((responseDiagnoses) =>
          setDiagnosisOptions(responseDiagnoses.slice(0, 10)),
        )
        .catch(() => {});
    }, 250);
    return () => window.clearTimeout(debounceTimer);
  }, [diagnosisSearch, isReadOnly]);

  // Debounced medicine search.
  useEffect(() => {
    if (isReadOnly || !medicineSearch.trim()) return;
    const debounceTimer = window.setTimeout(() => {
      getMedicines(medicineSearch)
        .then((responseMedicines) =>
          setMedicineOptions(responseMedicines.slice(0, 10)),
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
