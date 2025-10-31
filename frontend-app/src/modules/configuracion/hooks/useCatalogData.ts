import { useCallback, useMemo } from 'react';
import apiClient from '../../../lib/http/apiClient';
import { useQuery } from '../../../lib/query/QueryClient';
import type { CatalogId, SyncStatus } from '../types';

interface CatalogCollection<TEntity> {
  items: TEntity[];
  syncStatus?: SyncStatus;
  total?: number;
}

interface UseCatalogDataOptions<TEntity> {
  resource: string;
  mapResponse?: (entity: any) => TEntity;
}

function normalizeCatalogResponse<TEntity>(
  response: unknown,
  mapEntity: (entity: any) => TEntity,
): CatalogCollection<TEntity> {
  if (Array.isArray(response)) {
    return {
      items: response.map(mapEntity),
      total: response.length,
    };
  }

  if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>;
    const possibleItems = [data.items, data.data, data.results].find(
      (value): value is unknown[] => Array.isArray(value),
    );

    const items = possibleItems?.map(mapEntity) ?? [];
    const total = typeof data.total === 'number' ? (data.total as number) : possibleItems?.length;

    return {
      items,
      total,
      syncStatus: data.syncStatus as SyncStatus | undefined,
    };
  }

  return { items: [] };
}

export function useCatalogData<TEntity>({ resource, mapResponse }: UseCatalogDataOptions<TEntity>) {
  const queryKey = useMemo(() => ['configuracion', resource], [resource]);

  const mapEntity = useCallback(
    (entity: unknown) => (mapResponse ? mapResponse(entity) : (entity as TEntity)),
    [mapResponse],
  );

  const query = useQuery<CatalogCollection<TEntity>>({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<unknown>(`/api/${resource}`);
      return normalizeCatalogResponse(response, mapEntity);
    },
  });

  const refetch = useCallback(() => query.refetch(), [query]);

  const createEntity = useCallback(
    async (payload: Record<string, unknown>) => {
      await apiClient.post(`/api/${resource}`, payload);
      await refetch();
    },
    [resource, refetch],
  );

  const updateEntity = useCallback(
    async (id: CatalogId, payload: Record<string, unknown>) => {
      await apiClient.put(`/api/${resource}/${id}`, payload);
      await refetch();
    },
    [resource, refetch],
  );

  const deleteEntity = useCallback(
    async (id: CatalogId) => {
      await apiClient.delete(`/api/${resource}/${id}`);
      await refetch();
    },
    [resource, refetch],
  );

  return {
    items: query.data?.items ?? [],
    syncStatus: query.data?.syncStatus,
    total: query.data?.total,
    isLoading: query.status === 'loading' && !query.data,
    error: query.error,
    refetch,
    create: createEntity,
    update: updateEntity,
    remove: deleteEntity,
  } as const;
}
