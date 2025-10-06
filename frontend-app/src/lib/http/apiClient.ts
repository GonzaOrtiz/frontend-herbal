import { logHttpError } from '../observability/logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

async function request<TResponse, TBody = unknown>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const baseUrl = import.meta.env?.VITE_API_URL ?? '';
  const controller = new AbortController();
  const signal = options.signal ?? controller.signal;

  const requestInit: RequestInit = {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal,
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${baseUrl}${url}`, requestInit);

    if (!response.ok) {
      const errorPayload = await safeParseJson(response);
      const error = new Error('HTTP_ERROR');
      logHttpError({
        url,
        method: requestInit.method ?? 'GET',
        status: response.status,
        payload: errorPayload,
      });
      throw error;
    }

    return (await safeParseJson(response)) as TResponse;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error;
    }

    logHttpError({
      url,
      method: requestInit.method ?? 'GET',
      status: undefined,
      payload: { message: (error as Error).message },
    });
    throw error;
  }
}

async function safeParseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
}

export const apiClient = {
  request,
  get: <TResponse>(url: string, options?: RequestOptions) =>
    request<TResponse>(url, { ...options, method: 'GET' }),
  post: <TResponse, TBody>(url: string, body: TBody, options?: RequestOptions<TBody>) =>
    request<TResponse, TBody>(url, { ...options, method: 'POST', body }),
  put: <TResponse, TBody>(url: string, body: TBody, options?: RequestOptions<TBody>) =>
    request<TResponse, TBody>(url, { ...options, method: 'PUT', body }),
  delete: <TResponse>(url: string, options?: RequestOptions) =>
    request<TResponse>(url, { ...options, method: 'DELETE' }),
};

export default apiClient;
