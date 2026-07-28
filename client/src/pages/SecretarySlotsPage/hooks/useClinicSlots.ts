import { useState } from 'react';
import {
  deleteSlotAsSecretary,
  getSecretaryPastSlots,
  getSecretaryUpcomingSlots,
  type Slot,
} from '../../../api/slots';
import { useAsyncData } from '../../../hooks/useAsyncData';

export function useClinicSlots() {
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingCancel, setPendingCancel] = useState<Slot | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upcoming = useAsyncData<Slot[]>(getSecretaryUpcomingSlots, [reloadKey]);
  const history = useAsyncData<Slot[]>(getSecretaryPastSlots, [reloadKey]);

  const requestCancel = (slot: Slot) => setPendingCancel(slot);
  const dismissCancel = () => setPendingCancel(null);

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    setCancelling(true);
    setError(null);
    try {
      await deleteSlotAsSecretary(pendingCancel.id);
      setPendingCancel(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ביטול התור נכשל');
    } finally {
      setCancelling(false);
    }
  };

  return {
    upcoming,
    history,
    pendingCancel,
    requestCancel,
    dismissCancel,
    confirmCancel,
    cancelling,
    error,
  };
}

export type ClinicSlotsState = ReturnType<typeof useClinicSlots>;
