import { useEffect, useMemo } from 'react';
import { useQuery } from '@/lib/query/QueryClient';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { fetchCostosList, deriveTrendPoints } from '../api/costosApi';
import { useCostosContext } from '../context/CostosContext';
import {
  buildAllocationBreakdown,
  calculateBalanceSummary,
} from '../utils/transformers';
import type {
    AllocationItem,
    BalanceSummaryData,
    CostosFilters,
    CostosListResponse,
  CostosRecordMap,
  CostosSubModulo,
  TrendPoint,
} from '../types';
import type { QueryStatus } from '@/lib/query/queryClientCore';

interface QueryHookResult<T> {
  status: QueryStatus;
  data: T | undefined;
  error: unknown;
  updatedAt: number;
  refetch: () => Promise<T>;
}

interface UseCostosDataResult<K extends Exclude<CostosSubModulo, 'prorrateo'>> {
  query: QueryHookResult<CostosListResponse<CostosRecordMap[K]>>;
  summary: BalanceSummaryData;
  allocation: AllocationItem[];
  trend: TrendPoint[];
  formattedSummary: {
    total: string;
    previous?: string;
    balance: string;
    difference: string;
    variation?: string;
    warning?: string | null;
  };
}

export function useCostosData<K extends Exclude<CostosSubModulo, 'prorrateo'>>(): UseCostosDataResult<K> {
  const { submodule, filters, setLastSummary } = useCostosContext();
  const effectiveSubmodule = (submodule === 'prorrateo' ? 'gastos' : submodule) as K;
  const effectiveFilters = useMemo(() => {
    if (submodule === 'prorrateo') {
      return {
        ...filters,
        esGastoDelPeriodo: filters.esGastoDelPeriodo ?? true,
      };
    }
    return filters;
  }, [filters, submodule]);

  const queryFilters = useMemo(() => {
    if (effectiveSubmodule !== 'gastos') {
      return effectiveFilters;
    }

    const { concepto: _concepto, ...rest } = effectiveFilters;
    return { ...rest } as CostosFilters;
  }, [effectiveFilters, effectiveSubmodule]);

  const query = useQuery<CostosListResponse<CostosRecordMap[K]>>({
    queryKey: ['costos', effectiveSubmodule, queryFilters],
    queryFn: () => fetchCostosList(effectiveSubmodule, queryFilters),
  });

  const summary = useMemo(() => calculateBalanceSummary(query.data), [query.data]);

  const allocation = useMemo(() => {
    if (!query.data) return [];
    return buildAllocationBreakdown(effectiveSubmodule, query.data.items);
  }, [query.data, effectiveSubmodule]);

  const trend = useMemo(() => {
    if (!query.data) return [];
    return deriveTrendPoints(query.data);
  }, [query.data]);

  const formattedSummary = useMemo(
    () => ({
      total: formatCurrency(summary.totalAmount, { currency: summary.currency }),
      previous:
        summary.previousTotal !== undefined
          ? formatCurrency(summary.previousTotal, { currency: summary.currency })
          : undefined,
      balance: formatCurrency(summary.balance, { currency: summary.currency }),
      difference: formatCurrency(summary.difference, { currency: summary.currency }),
      variation:
        summary.variationPercentage !== undefined
          ? formatPercentage(summary.variationPercentage)
          : undefined,
      warning: summary.warning,
    }),
    [summary],
  );

  useEffect(() => {
    if (query.status === 'success') {
      setLastSummary(summary);
    }
  }, [query.status, summary, setLastSummary]);

  return {
    query: query as QueryHookResult<CostosListResponse<CostosRecordMap[K]>>,
    summary,
    allocation,
    trend,
    formattedSummary,
  };
}
