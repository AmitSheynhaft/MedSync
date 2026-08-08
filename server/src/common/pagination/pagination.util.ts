import { PaginatedResult } from './pagination.types';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export interface ResolvedPagination {
  pageNumber: number;
  take: number;
  skip: number;
}

export function resolvePagination(
  page?: number,
  limit?: number,
): ResolvedPagination {
  const pageNumber =
    Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
  const rawLimit =
    Number.isFinite(limit) && (limit as number) > 0
      ? Math.floor(limit as number)
      : DEFAULT_PAGE_SIZE;
  const take = Math.min(rawLimit, MAX_PAGE_SIZE);
  return { pageNumber, take, skip: (pageNumber - 1) * take };
}

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  pagination: ResolvedPagination,
): PaginatedResult<T> {
  const remaining = Math.max(total - pagination.skip, 0);
  const currentPageCount = Math.min(pagination.take, remaining);

  return {
    items,
    total: currentPageCount,
    page: pagination.pageNumber,
    hasMore: pagination.skip + currentPageCount < total,
  };
}
