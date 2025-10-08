import type {
  CreateImportLogPayload,
  ImportLog,
  ImportLogFilters,
  ImportResponse,
  TableResult,
  UpdateImportLogPayload,
} from './types';

export class ImportacionesApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, options?: { status?: number; payload?: unknown }) {
    super(message);
    this.name = 'ImportacionesApiError';
    this.status = options?.status;
    this.payload = options?.payload;
  }
}

const rawBaseUrl = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await parseJsonSafe(response);
    throw new ImportacionesApiError('HTTP_ERROR', { status: response.status, payload });
  }
  const payload = await parseJsonSafe(response);
  return payload as T;
}

async function requestJson<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  return handleResponse<TResponse>(response);
}

export async function uploadImport({
  file,
  fechaImportacion,
}: {
  file: File;
  fechaImportacion: string;
}): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('mdbFile', file);
  formData.append('fechaImportacion', fechaImportacion);

  const response = await fetch(`${baseUrl}/import`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<ImportResponse>(response);
}

export async function listImportLogs(
  filters: ImportLogFilters = {},
  options: { signal?: AbortSignal } = {},
): Promise<ImportLog[]> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }
  if (typeof filters.page === 'number') {
    params.set('page', String(filters.page));
  }
  if (typeof filters.pageSize === 'number') {
    params.set('pageSize', String(filters.pageSize));
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return requestJson<ImportLog[]>(`/api/importaciones${suffix}`, {
    signal: options.signal,
  });
}

export async function getImportLog(id: string, options: { signal?: AbortSignal } = {}): Promise<ImportLog> {
  return requestJson<ImportLog>(`/api/importaciones/${id}`, {
    signal: options.signal,
  });
}

export async function createImportLog(
  payload: CreateImportLogPayload,
  options: { signal?: AbortSignal } = {},
): Promise<ImportLog> {
  return requestJson<ImportLog>('/api/importaciones', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal: options.signal,
  });
}

export async function updateImportLog(
  id: string,
  payload: UpdateImportLogPayload,
  options: { signal?: AbortSignal } = {},
): Promise<ImportLog> {
  return requestJson<ImportLog>(`/api/importaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    signal: options.signal,
  });
}

export async function deleteImportLog(
  id: string,
  options: { signal?: AbortSignal } = {},
): Promise<{ message: string }> {
  return requestJson<{ message: string }>(`/api/importaciones/${id}`, {
    method: 'DELETE',
    signal: options.signal,
  });
}

export function computeTotals(results: TableResult[]): { inserted: number; errors: number } {
  return results.reduce(
    (acc, result) => {
      acc.inserted += Number.isFinite(result.inserted) ? result.inserted : 0;
      if (result.error) {
        acc.errors += 1;
      }
      return acc;
    },
    { inserted: 0, errors: 0 },
  );
}
