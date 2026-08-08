import React from 'react';
import {
  cancelSlotAsPatient,
  getCancelledPatientSlotsPage,
  getPastPatientSlotsPage,
  getUpcomingPatientSlotsPage,
  type Paginated,
  type Slot,
} from '../../../api/slots';
import { AsyncStatus } from '../../../hooks/useAsyncData';

const UPCOMING_TAB = 0;
const PAST_TAB = 1;
const CANCELLED_TAB = 2;
const PAGE_SIZE = 20;

type PatientSlotsTab = typeof UPCOMING_TAB | typeof PAST_TAB | typeof CANCELLED_TAB;

const EMPTY_TEXT_BY_TAB: Record<PatientSlotsTab, string> = {
  [UPCOMING_TAB]: 'אין לך תורים קרובים.',
  [PAST_TAB]: 'אין תורים קודמים.',
  [CANCELLED_TAB]: 'אין תורים שבוטלו.',
};

const SLOT_FETCHER_BY_TAB: Record<
  PatientSlotsTab,
  (page: number, limit: number) => Promise<Paginated<Slot>>
> = {
  [UPCOMING_TAB]: getUpcomingPatientSlotsPage,
  [PAST_TAB]: getPastPatientSlotsPage,
  [CANCELLED_TAB]: getCancelledPatientSlotsPage,
};

export function usePatientSlots() {
  const [tab, setTab] = React.useState<PatientSlotsTab>(UPCOMING_TAB);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [pendingCancel, setPendingCancel] = React.useState<Slot | null>(null);
  const [cancelling, setCancelling] = React.useState(false);
  const [currentData, setCurrentData] = React.useState<Slot[] | null>(null);
  const [currentStatus, setCurrentStatus] = React.useState<AsyncStatus>('loading');
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const pageRef = React.useRef(1);
  const hasMoreRef = React.useRef(true);
  const loadingMoreRef = React.useRef(false);

  // Load page 1 whenever tab or reload changes.
  React.useEffect(() => {
    let cancelled = false;
    pageRef.current = 1;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setCurrentData(null);
    setCurrentStatus('loading');

    SLOT_FETCHER_BY_TAB[tab](1, PAGE_SIZE)
      .then((response) => {
        if (cancelled) return;
        setCurrentData(response.items);
        setHasMore(response.hasMore);
        hasMoreRef.current = response.hasMore;
        setCurrentStatus('done');
      })
      .catch(() => {
        if (cancelled) return;
        setCurrentData([]);
        setHasMore(false);
        hasMoreRef.current = false;
        setCurrentStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [tab, reloadKey]);

  const loadMore = React.useCallback(async () => {
    if (!hasMoreRef.current || loadingMoreRef.current) return;

    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const response = await SLOT_FETCHER_BY_TAB[tab](nextPage, PAGE_SIZE);
      pageRef.current = nextPage;
      setCurrentData((prev) => [...(prev ?? []), ...response.items]);
      setHasMore(response.hasMore);
      hasMoreRef.current = response.hasMore;
    } catch {
      setCurrentStatus('error');
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [tab]);

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
    hasMore,
    loadingMore,
    loadMore,
    emptyText: EMPTY_TEXT_BY_TAB[tab],
    pendingCancel,
    setPendingCancel,
    cancelling,
    confirmCancel,
  };
}

export type PatientSlotsState = ReturnType<typeof usePatientSlots>;
