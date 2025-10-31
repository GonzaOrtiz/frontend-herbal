import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  QueryClient,
  createQueryClient,
  type QueryClientConfig,
  type QueryKey,
  type QueryStatus,
  type QueryResult,
} from './queryClientCore';

interface QueryOptions<TData> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
}

interface UseQueryResult<TData> {
  status: QueryStatus;
  data: TData | undefined;
  error: unknown;
  updatedAt: number;
  refetch: () => Promise<TData>;
}

const QueryClientContext = createContext<QueryClient | null>(null);

export const QueryClientProvider: React.FC<{ client: QueryClient; children: React.ReactNode }> = ({
  client,
  children,
}) => <QueryClientContext.Provider value={client}>{children}</QueryClientContext.Provider>;

export function useQueryClient(): QueryClient {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error('useQueryClient must be used inside QueryClientProvider');
  }
  return client;
}

export function useQuery<TData>(options: QueryOptions<TData>): UseQueryResult<TData> {
  const client = useQueryClient();
  const enabled = options.enabled ?? true;
  const staleTime = options.staleTime ?? client.getConfig().staleTime ?? 0;
  const serializedKey = useMemo(() => JSON.stringify(options.queryKey), [options.queryKey]);
  const parsedKey = useMemo(() => JSON.parse(serializedKey) as QueryKey, [serializedKey]);
  const queryFnRef = useRef(options.queryFn);

  useEffect(() => {
    queryFnRef.current = options.queryFn;
  }, [options.queryFn]);

  const fetchLatest = useCallback(
    (options?: { force?: boolean }) => client.fetchQuery(parsedKey, () => queryFnRef.current(), options),
    [client, parsedKey],
  );

  const forceFetchLatest = useCallback(() => fetchLatest({ force: true }), [fetchLatest]);

  const [state, setState] = useState<UseQueryResult<TData>>({
    status: 'idle',
    data: undefined,
    error: undefined,
    updatedAt: 0,
    refetch: forceFetchLatest,
  });

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = client.subscribe(parsedKey, {
      setState: (state) => {
        setState((prev) => ({
          ...prev,
          ...state,
          data: state.data as TData | undefined,
          refetch: forceFetchLatest,
        }));
      },
    });

    const record = client.getQuery<TData>(parsedKey);

    if (record && record.status === 'success' && Date.now() - record.updatedAt < staleTime) {
      setState({
        status: 'success',
        data: record.data as TData,
        error: undefined,
        updatedAt: record.updatedAt,
        refetch: forceFetchLatest,
      });
      return unsubscribe;
    }

    let isMounted = true;

    fetchLatest()
      .then((data) => {
        if (!isMounted) return;
        setState({
          status: 'success',
          data,
          error: undefined,
          updatedAt: Date.now(),
          refetch: forceFetchLatest,
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        setState({
          status: 'error',
          data: undefined,
          error,
          updatedAt: Date.now(),
          refetch: forceFetchLatest,
        });
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [client, parsedKey, enabled, staleTime, fetchLatest, forceFetchLatest]);

  const refetchRef = useRef(forceFetchLatest);

  useEffect(() => {
    refetchRef.current = forceFetchLatest;
  }, [forceFetchLatest]);

  useEffect(() => {
    if (!enabled) return;
    if ((state.status === 'success' || state.status === 'error') && state.updatedAt === 0) {
      void fetchLatest();
    }
  }, [enabled, state.status, state.updatedAt, fetchLatest]);

  return { ...state, refetch: () => refetchRef.current() };
}

interface MutationOptions<TData, TVariables, TContext = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => TContext | Promise<TContext>;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
  onError?: (error: unknown, variables: TVariables, context: TContext | undefined) => void;
  onSettled?: (
    result: TData | undefined,
    error: unknown,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
}

interface MutationResult<TData, TVariables> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: TData;
  error?: unknown;
  mutate: (variables: TVariables) => Promise<void>;
  reset: () => void;
}

export function useMutation<TData, TVariables, TContext = unknown>(
  options: MutationOptions<TData, TVariables, TContext>
): MutationResult<TData, TVariables> {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setData] = useState<TData | undefined>();
  const [error, setError] = useState<unknown>();

  const mutate = async (variables: TVariables) => {
    setStatus('loading');
    setError(undefined);

    let context: TContext | undefined;

    try {
      context = options.onMutate ? await options.onMutate(variables) : undefined;
    } catch (err) {
      setStatus('error');
      setError(err);
      options.onError?.(err, variables, context);
      options.onSettled?.(undefined, err, variables, context);
      return;
    }

    try {
      const result = await options.mutationFn(variables);
      setStatus('success');
      setData(result);
      options.onSuccess?.(result, variables, context);
      options.onSettled?.(result, undefined, variables, context);
    } catch (err) {
      setStatus('error');
      setError(err);
      options.onError?.(err, variables, context);
      options.onSettled?.(undefined, err, variables, context);
    }
  };

  const reset = () => {
    setStatus('idle');
    setData(undefined);
    setError(undefined);
  };

  return { status, data, error, mutate, reset };
}

export { QueryClient, createQueryClient };

export type { QueryClientConfig, QueryKey, QueryResult, MutationResult };
