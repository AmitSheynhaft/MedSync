import React from 'react';
import {
  cancelSlotAsPatient,
  getCancelledPatientSlots,
  getPastPatientSlots,
  getUpcomingPatientSlots,
  type Slot,
} from '../../../api/slots';
import { AsyncStatus } from '../../../hooks/useAsyncData';

const UPCOMING_TAB = 0;
const PAST_TAB = 1;
const CANCELLED_TAB = 2;

type PatientSlotsTab = typeof UPCOMING_TAB | typeof PAST_TAB | typeof CANCELLED_TAB;

const EMPTY_TEXT_BY_TAB: Record<PatientSlotsTab, string> = {
  [UPCOMING_TAB]: 'אין לך תורים קרובים.',
  [PAST_TAB]: 'אין תורים קודמים.',
  [CANCELLED_TAB]: 'אין תורים שבוטלו.',
};

const SLOT_FETCHER_BY_TAB: Record<PatientSlotsTab, () => Promise<Slot[]>> = {
  [UPCOMING_TAB]: getUpcomingPatientSlots,
  [PAST_TAB]: getPastPatientSlots,
  [CANCELLED_TAB]: getCancelledPatientSlots,
};

type InFlightRequest = {
  key: string;
  promise: Promise<Slot[]>;
};

function getFetchKey(tab: PatientSlotsTab, reloadKey: number): string {
  return `${tab}-${reloadKey}`;
}

function getOrCreateRequest(
  activeRequestRef: React.MutableRefObject<InFlightRequest | null>,
  fetchKey: string,
  tab: PatientSlotsTab,
): Promise<Slot[]> {
  if (activeRequestRef.current?.key === fetchKey) {
    return activeRequestRef.current.promise;
  }

  const promise = SLOT_FETCHER_BY_TAB[tab]();
  activeRequestRef.current = { key: fetchKey, promise };

  promise.finally(() => {
    if (activeRequestRef.current?.key === fetchKey) {
      activeRequestRef.current = null;
    }
  });

  return promise;
}

export function usePatientSlots() {
  const [tab, setTab] = React.useState<PatientSlotsTab>(UPCOMING_TAB);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [pendingCancel, setPendingCancel] = React.useState<Slot | null>(null);
  const [cancelling, setCancelling] = React.useState(false);
  const [currentData, setCurrentData] = React.useState<Slot[] | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState<AsyncStatus>('loading');

  const activeRequestRef = React.useRef<InFlightRequest | null>(null);
  const latestRequestIdRef = React.useRef(0);

  React.useEffect(() => {
    const fetchKey = getFetchKey(tab, reloadKey);
    const requestId = ++latestRequestIdRef.current;

    setCurrentStatus('loading');

    const requestPromise = getOrCreateRequest(activeRequestRef, fetchKey, tab);

    requestPromise
      .then((slots) => {
        if (requestId !== latestRequestIdRef.current) return;
        setCurrentData(slots);
        setCurrentStatus('done');
      })
      .catch(() => {
        if (requestId !== latestRequestIdRef.current) return;
        setCurrentStatus('error');
      });

    return undefined;
  }, [tab, reloadKey]);

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      await cancelSlotAsPatient(pendingCancel.id);
      setPendingCancel(null);
      setReloadKey((key) => key + 1);
    } catch {
      setPendingCancel(null);
      window.alert('ביטול התור נכשל. אנא נסה שנית.');
    } finally {
      setCancelling(false);
    }
  };

  return {
    tab,
    setTab,
    currentData,
    currentStatus,
    emptyText: EMPTY_TEXT_BY_TAB[tab],
    pendingCancel,
    setPendingCancel,
    cancelling,
    confirmCancel,
  };
}

export type PatientSlotsState = ReturnType<typeof usePatientSlots>;
