import { useMemo } from 'react';
import { useQuery } from '@/lib/query/QueryClient';
import type { QueryStatus } from '@/lib/query/queryClientCore';
import type { ReportFilters, ReportId } from '../types';
import { useReportesContext } from '../context/ReportesContext';

type QueryKeyComponent = string | number | boolean | null | undefined | Record<string, unknown>;

interface UseReportQueryOptions<TData> {
  reportId: ReportId;
  queryKeySuffix?: QueryKeyComponent;
  fetcher: (filters: ReportFilters) => Promise<TData>;
}

interface UseReportQueryResult<TData> {
  status: QueryStatus;
  data: TData | undefined;
  error: unknown;
  isFetching: boolean;
  refetch: () => Promise<TData>;
}

export function useReportQuery<TData>({
  reportId,
  queryKeySuffix,
  fetcher,
}: UseReportQueryOptions<TData>): UseReportQueryResult<TData> {
  const { filters } = useReportesContext();
  const queryKey = useMemo(() => {
    const base: QueryKeyComponent[] = ['reportes', reportId, filters];
    if (queryKeySuffix !== undefined) {
      base.push(queryKeySuffix);
    }
    return base;
  }, [reportId, filters, queryKeySuffix]);

  const query = useQuery<TData>({
    queryKey,
    queryFn: () => fetcher(filters),
  });

  return {
    status: query.status,
    data: query.data,
    error: query.error,
    isFetching: query.status === 'loading' || query.status === 'idle',
    refetch: query.refetch,
  };
}
