import { useEffect, useState } from 'react';
import { getEffectiveRole } from '../../../auth/viewAs';
import { Role } from '../../../constants/roles';

export function useVisitReadOnlyMode(isExistingVisit: boolean): boolean {
  const [isReadOnly, setIsReadOnly] = useState(
    () => getEffectiveRole() !== Role.Doctor || isExistingVisit,
  );

  useEffect(() => {
    const compute = () => {
      const userIsDoctor = getEffectiveRole() === Role.Doctor;
      // A visit can only be edited while it is being created. Once it exists,
      // it is view-only for everyone.
      setIsReadOnly(!userIsDoctor || isExistingVisit);
    };
    compute();
    window.addEventListener('medsync:viewAsChange', compute);
    return () => window.removeEventListener('medsync:viewAsChange', compute);
  }, [isExistingVisit]);

  return isReadOnly;
}
