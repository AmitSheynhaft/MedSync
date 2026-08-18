import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Diagnosis, getDiagnoses } from '../../../api/diagnoses';
import { Medicine, getMedicines } from '../../../api/medicines';

interface UseVisitCatalogOptionsResult {
  diagnosisSearch: string;
  setDiagnosisSearch: Dispatch<SetStateAction<string>>;
  diagnosisOptions: Diagnosis[];
  isDiagnosesLoading: boolean;
  medicineSearch: string;
  setMedicineSearch: Dispatch<SetStateAction<string>>;
  medicineOptions: Medicine[];
  isMedicinesLoading: boolean;
}

export function useVisitCatalogOptions(
  isReadOnly: boolean,
): UseVisitCatalogOptionsResult {
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [diagnosisOptions, setDiagnosisOptions] = useState<Diagnosis[]>([]);
  const [isDiagnosesLoading, setIsDiagnosesLoading] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineOptions, setMedicineOptions] = useState<Medicine[]>([]);
  const [isMedicinesLoading, setIsMedicinesLoading] = useState(false);

  // Debounced diagnosis search and initial load. In dev Strict Mode, the first
  // mount timeout is cleaned up before firing, so this still performs one query.
  useEffect(() => {
    if (isReadOnly) return;
    const trimmedSearch = diagnosisSearch.trim();
    setIsDiagnosesLoading(true);
    const debounceTimer = window.setTimeout(() => {
      getDiagnoses(trimmedSearch || undefined)
        .then((responseDiagnoses) =>
          setDiagnosisOptions(
            responseDiagnoses.slice(0, trimmedSearch ? 10 : 30),
          ),
        )
        .catch(() => {})
        .finally(() => setIsDiagnosesLoading(false));
    }, 250);
    return () => { window.clearTimeout(debounceTimer); setIsDiagnosesLoading(false); };
  }, [diagnosisSearch, isReadOnly]);

  // Debounced medicine search and initial load.
  useEffect(() => {
    if (isReadOnly) return;
    const trimmedSearch = medicineSearch.trim();
    setIsMedicinesLoading(true);
    const debounceTimer = window.setTimeout(() => {
      getMedicines(trimmedSearch || undefined)
        .then((responseMedicines) =>
          setMedicineOptions(
            responseMedicines.slice(0, trimmedSearch ? 10 : 30),
          ),
        )
        .catch(() => {})
        .finally(() => setIsMedicinesLoading(false));
    }, 250);
    return () => { window.clearTimeout(debounceTimer); setIsMedicinesLoading(false); };
  }, [medicineSearch, isReadOnly]);

  return {
    diagnosisSearch,
    setDiagnosisSearch,
    diagnosisOptions,
    isDiagnosesLoading,
    medicineSearch,
    setMedicineSearch,
    medicineOptions,
    isMedicinesLoading,
  };
}
