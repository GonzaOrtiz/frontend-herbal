type QueryKeyPart = string | number | boolean | null | undefined | Record<string, unknown>;

export type QueryKey = QueryKeyPart[] | QueryKeyPart;

interface QueryObserver<TData> {
  setState: (state: QueryResult<TData>) => void;
}

interface StoredQuery<TData = unknown> {
  key: string;
  data: TData | undefined;
  error: unknown;
  status: QueryStatus;
  updatedAt: number;
  observers: Set<QueryObserver<unknown>>;
  promise?: Promise<TData>;
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface QueryClientConfig {
  staleTime?: number;
}

export interface QueryResult<TData> {
  status: QueryStatus;
  data: TData | undefined;
  error: unknown;
  updatedAt: number;
}

export class QueryClient {
  private queries = new Map<string, StoredQuery>();

  constructor(private readonly config: QueryClientConfig = {}) {}

  getConfig() {
    return this.config;
  }

  private serializeKey(key: QueryKey): string {
    return Array.isArray(key) ? JSON.stringify(key) : JSON.stringify([key]);
  }

  getQuery<TData>(key: QueryKey): StoredQuery<TData> | undefined {
    return this.queries.get(this.serializeKey(key)) as StoredQuery<TData> | undefined;
  }

  private ensureQuery<TData>(key: QueryKey): StoredQuery<TData> {
    const serialized = this.serializeKey(key);
    const existing = this.queries.get(serialized) as StoredQuery<TData> | undefined;
    if (existing) return existing;

    const created: StoredQuery<TData> = {
      key: serialized,
      data: undefined,
      error: undefined,
      status: 'idle',
      updatedAt: 0,
      observers: new Set(),
    };

    this.queries.set(serialized, created);
    return created;
  }

  async fetchQuery<TData>(key: QueryKey, queryFn: () => Promise<TData>): Promise<TData> {
    const record = this.ensureQuery<TData>(key);

    if (record.status === 'loading' && record.promise) {
      return record.promise;
    }

    const now = Date.now();
    const staleTime = this.config.staleTime ?? 0;

    if (record.status === 'success' && now - record.updatedAt < staleTime) {
      return Promise.resolve(record.data as TData);
    }

    const promise = queryFn()
      .then((data) => {
        record.status = 'success';
        record.data = data;
        record.updatedAt = Date.now();
        record.promise = undefined;
        record.error = undefined;
        this.notify(record);
        return data;
      })
      .catch((error: unknown) => {
        record.status = 'error';
        record.error = error;
        record.promise = undefined;
        this.notify(record);
        throw error;
      });

    record.status = 'loading';
    record.promise = promise;
    this.notify(record);

    return promise;
  }

  setQueryData<TData>(key: QueryKey, data: TData) {
    const record = this.ensureQuery<TData>(key);
    record.data = data;
    record.status = 'success';
    record.updatedAt = Date.now();
    record.error = undefined;
    this.notify(record);
  }

  invalidateQueries(partialKey?: QueryKey) {
    if (!partialKey) {
      this.queries.forEach((query) => {
        query.updatedAt = 0;
        this.notify(query);
      });
      return;
    }

    const target = this.serializeKey(partialKey);
    this.queries.forEach((query, key) => {
      if (key.startsWith(target.replace(/]$/, ''))) {
        query.updatedAt = 0;
        this.notify(query);
      }
    });
  }

  subscribe<TData>(key: QueryKey, observer: QueryObserver<TData>) {
    const record = this.ensureQuery<TData>(key);
    record.observers.add(observer as QueryObserver<unknown>);
    return () => {
      record.observers.delete(observer as QueryObserver<unknown>);
    };
  }

  private notify<TData>(record: StoredQuery<TData>) {
    record.observers.forEach((observer) => {
      observer.setState({
        data: record.data as TData | undefined,
        error: record.error,
        status: record.status,
        updatedAt: record.updatedAt,
      });
    });
  }
}

export function createQueryClient(config: QueryClientConfig = {}) {
  return new QueryClient(config);
}

export type { QueryObserver, StoredQuery };
