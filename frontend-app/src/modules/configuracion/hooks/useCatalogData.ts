import { useCallback, useMemo } from 'react';
import apiClient from '../../../lib/http/apiClient';
import { useMutation, useQuery, useQueryClient } from '../../../lib/query/QueryClient';
import type { CatalogId, CatalogMutationContext, SyncStatus } from '../types';

interface CatalogQueryResponse<TEntity> {
  items: TEntity[];
  syncStatus?: SyncStatus;
  total?: number;
}

interface UseCatalogDataOptions<TEntity> {
  resource: string;
  mapResponse?: (entity: any) => TEntity;
}

interface MutationVariables<TEntity> {
  id?: CatalogId;
  payload: Partial<TEntity>;
}

export function useCatalogData<TEntity>({ resource, mapResponse }: UseCatalogDataOptions<TEntity>) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['configuracion', resource], [resource]);

  const query = useQuery<CatalogQueryResponse<TEntity>>({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<CatalogQueryResponse<TEntity>>(`/api/${resource}`);
      if (mapResponse) {
        return {
          ...response,
          items: response.items.map(mapResponse),
        };
      }
      return response;
    },
  });

  const applyOptimisticUpdate = useCallback(
    (
      context: CatalogMutationContext<CatalogQueryResponse<TEntity>>,
      updater: (items: TEntity[]) => TEntity[]
    ) => {
      const current = queryClient.getQuery<CatalogQueryResponse<TEntity>>(queryKey)?.data;
      const nextItems = updater(current?.items ?? []);
      queryClient.setQueryData(queryKey, {
        ...(current ?? { items: [] }),
        items: nextItems,
      });
      context.previous = current;
    },
    [queryClient, queryKey]
  );

  const createMutation = useMutation<
    CatalogQueryResponse<TEntity>,
    MutationVariables<TEntity>,
    CatalogMutationContext<CatalogQueryResponse<TEntity>>
  >(
    {
      mutationFn: async ({ payload }) =>
        apiClient.post<CatalogQueryResponse<TEntity>, Partial<TEntity>>(`/api/${resource}`, payload),
      onMutate: async ({ payload }) => {
        const context: CatalogMutationContext<CatalogQueryResponse<TEntity>> = {};
        const optimisticId = `optimistic-${Date.now()}`;
        context.optimisticId = optimisticId;
        applyOptimisticUpdate(context, (items) => [...items, { ...payload, id: optimisticId } as TEntity]);
        return context;
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKey, context.previous);
        }
      },
      onSuccess: (response) => {
        queryClient.setQueryData(queryKey, response);
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );

  const updateMutation = useMutation<
    CatalogQueryResponse<TEntity>,
    MutationVariables<TEntity>,
    CatalogMutationContext<CatalogQueryResponse<TEntity>>
  >(
    {
      mutationFn: async ({ id, payload }) =>
        apiClient.put<CatalogQueryResponse<TEntity>, Partial<TEntity>>(`/api/${resource}/${id}`, payload),
      onMutate: async ({ id, payload }) => {
        const context: CatalogMutationContext<CatalogQueryResponse<TEntity>> = {};
        applyOptimisticUpdate(context, (items) =>
          items.map((item) => (item && (item as any).id === id ? { ...item, ...payload } : item))
        );
        return context;
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKey, context.previous);
        }
      },
      onSuccess: (response) => {
        queryClient.setQueryData(queryKey, response);
      },
      onSettled: () => queryClient.invalidateQueries(queryKey),
    }
  );

  const deleteMutation = useMutation<
    CatalogQueryResponse<TEntity>,
    CatalogId,
    CatalogMutationContext<CatalogQueryResponse<TEntity>>
  >(
    {
      mutationFn: async (id) => apiClient.delete<CatalogQueryResponse<TEntity>>(`/api/${resource}/${id}`),
      onMutate: async (id) => {
        const context: CatalogMutationContext<CatalogQueryResponse<TEntity>> = {};
        applyOptimisticUpdate(context, (items) => items.filter((item) => (item as any).id !== id));
        return context;
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(queryKey, context.previous);
        }
      },
      onSuccess: (response) => {
        queryClient.setQueryData(queryKey, response);
      },
      onSettled: () => queryClient.invalidateQueries(queryKey),
    }
  );

  const refetch = useCallback(() => query.refetch(), [query]);

  return {
    items: query.data?.items ?? [],
    syncStatus: query.data?.syncStatus,
    isLoading: query.status === 'loading' && !query.data,
    error: query.error,
    refetch,
    create: (payload: Partial<TEntity>) => createMutation.mutate({ payload }),
    update: (id: CatalogId, payload: Partial<TEntity>) => updateMutation.mutate({ id, payload }),
    remove: (id: CatalogId) => deleteMutation.mutate(id),
    mutations: {
      createStatus: createMutation.status,
      updateStatus: updateMutation.status,
      deleteStatus: deleteMutation.status,
    },
  } as const;
}
