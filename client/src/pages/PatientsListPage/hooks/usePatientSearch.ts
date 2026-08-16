import { useCallback, useEffect, useRef, useState } from 'react';
import { getPatientsPage, deletePatient, PatientSummary } from '../../../api/patients';
import { AsyncStatus } from '../../../hooks/useAsyncData';

const PAGE_SIZE = 20;

export function usePatientSearch() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  // Debounced page-1 fetch on search change.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      let cancelled = false;

      pageRef.current = 1;
      loadingMoreRef.current = false;
      setLoadingMore(false);
      setStatus('loading');

      getPatientsPage({
        search: query.trim() || undefined,
        page: 1,
        limit: PAGE_SIZE,
      })
        .then((response) => {
          if (cancelled) return;
          setPatients(response.items);
          setHasMore(response.hasMore);
          hasMoreRef.current = response.hasMore;
          setStatus('done');
        })
        .catch(() => {
          if (cancelled) return;
          setPatients([]);
          setHasMore(false);
          hasMoreRef.current = false;
          setStatus('error');
        });

      return () => {
        cancelled = true;
      };
    }, 500);

    return () => window.clearTimeout(timer);
  }, [query]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMoreRef.current) return;

    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const response = await getPatientsPage({
        search: query.trim() || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      pageRef.current = nextPage;
      setPatients((prev) => [...prev, ...response.items]);
      setHasMore(response.hasMore);
      hasMoreRef.current = response.hasMore;
    } catch {
      setStatus('error');
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [query]);

  const handleDelete = useCallback(async (id: string) => {
    await deletePatient(id);
    setPatients((prev) => prev.filter((patient) => patient.id !== id));
  }, []);

  return {
    query,
    setQuery,
    status,
    patients,
    hasMore,
    loadingMore,
    loadMore,
    handleDelete,
  };
}
