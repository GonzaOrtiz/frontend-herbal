import { useMemo } from 'react';
import apiClient from '@/lib/http/apiClient';
import { useQuery } from '@/lib/query/QueryClient';
import { normalizeCuadrosResponse } from '../../reportes/utils/normalizers';

interface UseCuadrosProductsOptions {
  enabled?: boolean;
}

export function useCuadrosProducts({ enabled = true }: UseCuadrosProductsOptions = {}) {
  const query = useQuery<string[]>({
    queryKey: ['reportes', 'cuadros', 'productos'],
    enabled,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/api/reportes/cuadros');
      const cards = normalizeCuadrosResponse(response);
      const unique = new Map<string, string>();

      for (const card of cards) {
        const candidate = (card.producto ?? '').trim();
        if (!candidate || candidate === '—') {
          continue;
        }
        const key = candidate.toLocaleLowerCase('es');
        if (!unique.has(key)) {
          unique.set(key, candidate);
        }
      }

      return Array.from(unique.values()).sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base' }),
      );
    },
  });

  const products = useMemo(
    () => (query.data ?? []).map((product) => product.trim()).filter((product) => product.length > 0),
    [query.data],
  );

  return {
    products,
    isLoading: query.status === 'loading' && enabled,
    error: query.error,
    refetch: query.refetch,
    status: query.status,
  } as const;
}

export type UseCuadrosProductsReturn = ReturnType<typeof useCuadrosProducts>;
