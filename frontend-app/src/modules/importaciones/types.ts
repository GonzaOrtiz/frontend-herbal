export interface TableResult {
  table: string;
  collection: string;
  inserted: number;
  error?: string | null;
}

export interface ImportResponse {
  totalRecords: number;
  results: TableResult[];
  startedAt?: string;
  finishedAt?: string;
}

export interface ImportLog {
  _id: string;
  fileName: string;
  importDate: string;
  recordsProcessed: number;
  durationMs?: number;
  errorMessages?: string[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  notes?: string;
  totalTables?: number;
  totalErrors?: number;
  results?: TableResult[];
}

export interface ImportLogFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateImportLogPayload {
  fileName: string;
  importDate: string;
  recordsProcessed: number;
  durationMs?: number;
  errorMessages?: string[];
  notes?: string;
}

export type UpdateImportLogPayload = Partial<CreateImportLogPayload>;

export interface ManualLogDraft {
  fileName: string;
  importDate: string;
  recordsProcessed: string;
  durationMs: string;
  errorMessages: string;
  notes: string;
}

export type ImportacionesSection = 'importar' | 'historial';
