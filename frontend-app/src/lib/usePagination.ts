import { useEffect, useMemo, useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface UsePaginationResult<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  from: number;
  to: number;
  totalItems: number;
  pageSizeOptions: number[];
  items: T[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

function usePagination<T>(items: readonly T[], options?: UsePaginationOptions): UsePaginationResult<T> {
  const { initialPage = 1, initialPageSize = 10, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS } = options ?? {};

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  const totalItems = items.length;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, page, pageSize]);

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const normalizedPageSizeOptions = useMemo(() => {
    const unique = new Set([...pageSizeOptions, pageSize]);
    return Array.from(unique).sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  const goToNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  return {
    page,
    pageSize,
    totalPages,
    from,
    to,
    totalItems,
    pageSizeOptions: normalizedPageSizeOptions,
    items: paginatedItems,
    setPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
  };
}

export type { UsePaginationOptions, UsePaginationResult };
export default usePagination;
