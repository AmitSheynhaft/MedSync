import { useState } from 'react';
import type { Paginated } from '../api/slots';

const SEARCH_DEBOUNCE_MS = 300;

type FetchPage<T> = (search: string, page: number) => Promise<Paginated<T>>;

interface OptionsSnapshot<T> {
  options: T[];
  isLoading: boolean;
  hasMorePages: boolean;
}

export interface LazyOptions<T> extends OptionsSnapshot<T> {
  search: (term: string) => void;
  loadNextPage: () => void;
  ensureLoaded: () => void;
}

const EMPTY_SNAPSHOT: OptionsSnapshot<never> = {
  options: [],
  isLoading: false,
  hasMorePages: false,
};

class LazyOptionsController<T> {
  private fetchPage: FetchPage<T> = () => Promise.resolve(EMPTY_SNAPSHOT_PAGE);
  private publishSnapshot: (snapshot: OptionsSnapshot<T>) => void = () => {};

  private loadedOptions: T[] = [];
  private activeSearch = '';
  private loadedPage = 1;
  private hasMorePages = false;
  private isLoading = false;
  private hasLoadedInitialPage = false;

  private latestRequestId = 0;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  connect(
    fetchPage: FetchPage<T>,
    publishSnapshot: (snapshot: OptionsSnapshot<T>) => void,
  ): void {
    this.fetchPage = fetchPage;
    this.publishSnapshot = publishSnapshot;
  }

  ensureLoaded = (): void => {
    if (this.hasLoadedInitialPage) return;
    this.hasLoadedInitialPage = true;
    void this.loadPage('', 1);
  };

  search = (term: string): void => {
    clearTimeout(this.debounceTimer);
    this.hasLoadedInitialPage = true;
    if (term) {
      this.debounceTimer = setTimeout(() => void this.loadPage(term, 1), SEARCH_DEBOUNCE_MS);
    } else {
      void this.loadPage('', 1);
    }
  };

  loadNextPage = (): void => {
    if (this.isLoading || !this.hasMorePages) return;
    void this.loadPage(this.activeSearch, this.loadedPage + 1);
  };

  private async loadPage(term: string, page: number): Promise<void> {
    const requestId = ++this.latestRequestId;
    this.isLoading = true;
    this.publish();

    try {
      const result = await this.fetchPage(term, page);
      if (this.isStale(requestId)) return;
      this.activeSearch = term;
      this.loadedPage = result.page;
      this.hasMorePages = result.hasMore;
      this.loadedOptions =
        page === 1 ? result.items : [...this.loadedOptions, ...result.items];
    } catch {
      if (this.isStale(requestId)) return;
      this.hasMorePages = false;
      if (page === 1) this.loadedOptions = [];
    } finally {
      if (!this.isStale(requestId)) {
        this.isLoading = false;
        this.publish();
      }
    }
  }

  private isStale(requestId: number): boolean {
    return requestId !== this.latestRequestId;
  }

  private publish(): void {
    this.publishSnapshot({
      options: this.loadedOptions,
      isLoading: this.isLoading,
      hasMorePages: this.hasMorePages,
    });
  }
}

const EMPTY_SNAPSHOT_PAGE: Paginated<never> = {
  items: [],
  total: 0,
  page: 1,
  hasMore: false,
};

export function useLazyOptions<T>(fetchPage: FetchPage<T>): LazyOptions<T> {
  const [controller] = useState(() => new LazyOptionsController<T>());
  const [snapshot, setSnapshot] = useState<OptionsSnapshot<T>>(EMPTY_SNAPSHOT);

  controller.connect(fetchPage, setSnapshot);

  return {
    options: snapshot.options,
    isLoading: snapshot.isLoading,
    hasMorePages: snapshot.hasMorePages,
    search: controller.search,
    loadNextPage: controller.loadNextPage,
    ensureLoaded: controller.ensureLoaded,
  };
}
