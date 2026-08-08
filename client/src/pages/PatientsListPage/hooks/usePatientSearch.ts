import { useEffect, useState } from 'react';
import { getPatientsPage, PatientSummary } from '../../../api/patients';
import { AsyncStatus } from '../../../hooks/useAsyncData';

const PAGE_SIZE = 20;

export function usePatientSearch() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFirstPage = async (search: string) => {
    setStatus('loading');
    setLoadingMore(false);

    try {
      const response = await getPatientsPage({
        search: search.trim() || undefined,
        page: 1,
        limit: PAGE_SIZE,
      });
      setPatients(response.items);
      setPage(1);
      setHasMore(response.items.length >= PAGE_SIZE);
      setStatus('done');
    } catch {
      setPatients([]);
      setPage(1);
      setHasMore(false);
      setStatus('error');
    }
  };

  const setSearchQuery = (nextQuery: string) => {
    setQuery(nextQuery);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchFirstPage(query);
    }, 500);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadMore = async () => {
    if (!hasMore || status !== 'done' || loadingMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    try {
      const response = await getPatientsPage({
        search: query.trim() || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setPatients((prev) => [...prev, ...response.items]);
      setPage(nextPage);
      setHasMore(response.items.length >= PAGE_SIZE);
    } catch {
      setStatus('error');
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    query,
    setQuery: setSearchQuery,
    status,
    patients,
    hasMore,
    loadingMore,
    loadMore,
  };
}
