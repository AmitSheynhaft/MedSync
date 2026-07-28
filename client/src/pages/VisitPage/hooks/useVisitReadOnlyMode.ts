import { useEffect, useState } from 'react';
import { getEffectiveRole } from '../../../auth/viewAs';
import { Role } from '../../../constants/roles';

function isDateInPast(dateString: string | null): boolean {
  if (!dateString) return false;

  try {
    const visitDate = new Date(dateString);
    visitDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return visitDate < today;
  } catch {
    return false;
  }
}

export function useVisitReadOnlyMode(visitDateObj: Date | null): boolean {
  const [isReadOnly, setIsReadOnly] = useState(
    () => getEffectiveRole() !== Role.Doctor,
  );

  useEffect(() => {
    const compute = () => {
      const userIsDoctor = getEffectiveRole() === Role.Doctor;
      const visitIsPast =
        visitDateObj && isDateInPast(visitDateObj.toISOString());
      setIsReadOnly(!userIsDoctor || !!visitIsPast);
    };
    compute();
    window.addEventListener('medsync:viewAsChange', compute);
    return () => window.removeEventListener('medsync:viewAsChange', compute);
  }, [visitDateObj]);

  return isReadOnly;
}
