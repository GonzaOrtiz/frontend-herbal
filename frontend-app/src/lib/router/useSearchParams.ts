import { useCallback, useEffect, useMemo, useState } from 'react';

export type SearchParamsInit =
  | URLSearchParams
  | string
  | [string, string][]
  | Record<string, string | number | boolean | undefined | null | (string | number | boolean)[]>;

function normalizeInit(init?: SearchParamsInit): URLSearchParams {
  if (!init) {
    return new URLSearchParams();
  }

  if (init instanceof URLSearchParams) {
    return new URLSearchParams(init.toString());
  }

  if (typeof init === 'string') {
    return new URLSearchParams(init);
  }

  if (Array.isArray(init)) {
    return new URLSearchParams(init);
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(init)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else {
      params.set(key, String(value));
    }
  }
  return params;
}

interface SetSearchParamsOptions {
  replace?: boolean;
}

export function useSearchParams(
  defaultInit?: SearchParamsInit,
): [URLSearchParams, (nextInit: SearchParamsInit, options?: SetSearchParamsOptions) => void] {
  const initialParams = useMemo(() => {
    if (typeof window === 'undefined') {
      return normalizeInit(defaultInit);
    }
    const current = window.location.search;
    if (current) {
      return new URLSearchParams(current);
    }
    return normalizeInit(defaultInit);
  }, [defaultInit]);

  const [params, setParams] = useState<URLSearchParams>(initialParams);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const update = useCallback(
    (nextInit: SearchParamsInit, options: SetSearchParamsOptions = {}) => {
      const nextParams = normalizeInit(nextInit);
      setParams(nextParams);

      if (typeof window === 'undefined') {
        return;
      }

      const search = nextParams.toString();
      const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
      const historyMethod = options.replace ? 'replaceState' : 'pushState';
      window.history[historyMethod](null, '', nextUrl);
    },
    [],
  );

  return [params, update];
}

export function mergeSearchParams(
  base: URLSearchParams,
  patch: Record<string, string | undefined>,
): URLSearchParams {
  const next = new URLSearchParams(base.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  return next;
}
