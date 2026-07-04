import { useEffect, useState } from 'react';
import { useCurrentUser } from '../atoms/useCurrentUser';
import { getCaregiver } from '../api/caregivers';

export interface CurrentDoctor {
  fullName: string;
  specialization: string;
  initials: string;
}

const DEFAULT: CurrentDoctor = {
  fullName: 'Doctor',
  specialization: 'General Practice',
  initials: 'DR',
};

function computeInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s.charAt(0).toUpperCase())
      .join('') || 'DR'
  );
}

const doctorCache = new Map<string, CurrentDoctor>();
const inflight = new Map<string, Promise<CurrentDoctor>>();

export function useCurrentDoctor(): CurrentDoctor {
  const session = useCurrentUser();
  const cached = session?.caregiverId
    ? doctorCache.get(session.caregiverId)
    : undefined;

  const [doctor, setDoctor] = useState<CurrentDoctor>(() => {
    if (cached) return cached;
    if (!session) return DEFAULT;
    return {
      fullName: session.fullName || DEFAULT.fullName,
      specialization: DEFAULT.specialization,
      initials: computeInitials(session.fullName || ''),
    };
  });

  useEffect(() => {
    const caregiverId = session?.caregiverId;
    if (session?.role !== 'doctor' || !caregiverId) return;
    if (doctorCache.has(caregiverId)) {
      setDoctor(doctorCache.get(caregiverId)!);
      return;
    }
    let active = true;
    let request = inflight.get(caregiverId);
    if (!request) {
      request = getCaregiver(caregiverId).then(c => {
        const next: CurrentDoctor = {
          fullName: c.user?.fullName || session?.fullName || DEFAULT.fullName,
          specialization: c.specialization || DEFAULT.specialization,
          initials: computeInitials(c.user?.fullName || session?.fullName || ''),
        };
        doctorCache.set(caregiverId, next);
        inflight.delete(caregiverId);
        return next;
      }).catch(err => {
        inflight.delete(caregiverId);
        throw err;
      });
      inflight.set(caregiverId, request);
    }
    request
      .then(next => {
        if (active) setDoctor(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [session?.role, session?.caregiverId, session?.fullName]);

  return doctor;
}
