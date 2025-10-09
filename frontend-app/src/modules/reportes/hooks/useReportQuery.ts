import { useMemo } from 'react';
import { useQuery } from '@/lib/query/QueryClient';
import type { QueryStatus } from '@/lib/query/queryClientCore';
import type { ReportFilters, ReportId } from '../types';
import { useReportesContext } from '../context/ReportesContext';

interface UseReportQueryOptions<TData> {
  reportId: ReportId;
  queryKeySuffix?: unknown;
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
  const queryKey = useMemo(() => ['reportes', reportId, filters, queryKeySuffix], [reportId, filters, queryKeySuffix]);

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
