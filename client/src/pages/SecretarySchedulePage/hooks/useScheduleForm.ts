import { useCallback, useState } from 'react';
import {
  bookSlot,
  getAvailability,
  type SlotAvailability,
  type BookablePatient,
  type TherapistOption,
} from '../../../api/slots';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useCurrentUser } from '../../../atoms/useCurrentUser';
import { isPastDateTime, todayISO } from '../../../utils/format';

export function useScheduleForm() {
  const currentUser = useCurrentUser();
  const [therapist, setTherapist] = useState<TherapistOption | null>(null);
  const [patient, setPatient] = useState<BookablePatient | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hasReferral, setHasReferral] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDialog, setSuccessDialog] = useState<{
    patient: BookablePatient;
    therapist: TherapistOption;
    date: string;
    time: string;
  } | null>(null);

  const caregiverId = therapist?.caregiverId ?? '';

  const availability = useAsyncData<SlotAvailability | null>(
    () => (caregiverId && date ? getAvailability(caregiverId, date) : Promise.resolve(null)),
    [caregiverId, date, reloadKey],
  );

  const selectTherapist = useCallback((next: TherapistOption | null) => {
    setTherapist(next);
    setTime('');
  }, []);

  const selectPatient = useCallback((next: BookablePatient | null) => {
    if (next && currentUser?.userId && next.userId === currentUser.userId) {
      setError('לא ניתן לקבוע תור עבור עצמך');
      return;
    }
    setError(null);
    setPatient(next);
  }, [currentUser?.userId]);

  const selectDate = useCallback((next: string) => {
    if (next && next < todayISO()) {
      setError('לא ניתן לקבוע תור לתאריך שכבר עבר');
      return;
    }
    setDate(next);
    setTime('');
  }, []);

  const resetForm = useCallback(() => {
    setTherapist(null);
    setPatient(null);
    setDate('');
    setTime('');
    setHasReferral(false);
    setError(null);
  }, []);

  const canSubmit = Boolean(caregiverId && patient && date && time) && !submitting;

  const submit = useCallback(async () => {
    setError(null);
    if (!caregiverId || !patient || !therapist || !date || !time) {
      setError('יש לבחור מטפל, מטופל, תאריך ושעה');
      return;
    }
    if (isPastDateTime(date, time)) {
      setError('לא ניתן לקבוע תור לתאריך או שעה שכבר עברו');
      return;
    }
    if (currentUser?.userId && patient.userId === currentUser.userId) {
      setError('לא ניתן לקבוע תור עבור עצמך');
      return;
    }
    setSubmitting(true);
    try {
      await bookSlot({
        caregiverId,
        patientUserId: patient.userId,
        date,
        time,
        hasReferral,
      });
      setSuccessDialog({ patient, therapist, date, time });
      setReloadKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'קביעת התור נכשלה');
    } finally {
      setSubmitting(false);
    }
  }, [caregiverId, patient, therapist, date, time, hasReferral, currentUser?.userId]);

  const dismissSuccess = useCallback(() => {
    setSuccessDialog(null);
    resetForm();
  }, [resetForm]);

  return {
    therapist,
    selectTherapist,
    patient,
    selectPatient,
    caregiverId,
    date,
    selectDate,
    availability,
    time,
    setTime,
    hasReferral,
    setHasReferral,
    submitting,
    error,
    successDialog,
    dismissSuccess,
    canSubmit,
    submit,
  };
}

export type ScheduleFormState = ReturnType<typeof useScheduleForm>;
