import apiClient from '@/lib/http/apiClient';
import type {
  CifRecalculationResult,
  CifTotalRecord,
  CifUnitarioRecord,
  CreateCifTotalPayload,
  CreateCifUnitarioPayload,
  RecalculateCifPayload,
} from '../types';

const BASE_ENDPOINT = '/api/cif';

type CifKind = 'total' | 'unitario';

type UnknownRecord = Record<string, unknown>;

export async function createCifTotal(payload: CreateCifTotalPayload): Promise<CifTotalRecord> {
  const response = await apiClient.post<unknown, CreateCifTotalPayload>(`${BASE_ENDPOINT}/total`, payload);
  return normalizeCifTotalRecord(response);
}

export async function createCifUnitario(payload: CreateCifUnitarioPayload): Promise<CifUnitarioRecord> {
  const response = await apiClient.post<unknown, CreateCifUnitarioPayload>(`${BASE_ENDPOINT}/unitario`, payload);
  return normalizeCifUnitarioRecord(response);
}

export async function fetchCifTotales(
  producto?: string,
  periodo?: string,
): Promise<CifTotalRecord[]> {
  const url = buildResourceUrl('total', producto, periodo);
  const response = await apiClient.get<unknown>(url);
  return normalizeCifTotalCollection(response);
}

export async function fetchCifUnitarios(
  producto?: string,
  periodo?: string,
): Promise<CifUnitarioRecord[]> {
  const url = buildResourceUrl('unitario', producto, periodo);
  const response = await apiClient.get<unknown>(url);
  return normalizeCifUnitarioCollection(response);
}

export async function recalculateCif(payload: RecalculateCifPayload): Promise<CifRecalculationResult[]> {
  const response = await apiClient.post<unknown, RecalculateCifPayload>(`${BASE_ENDPOINT}/recalcular`, payload);
  return normalizeRecalculationCollection(response);
}

function buildResourceUrl(kind: CifKind, producto?: string, periodo?: string): string {
  const normalizedProducto = producto?.trim();
  const resource = normalizedProducto
    ? `${BASE_ENDPOINT}/${kind}/${encodeURIComponent(normalizedProducto)}`
    : `${BASE_ENDPOINT}/${kind}`;
  const params = new URLSearchParams();
  if (periodo && periodo.trim()) {
    params.set('periodo', periodo.trim());
  }
  const query = params.toString();
  return query ? `${resource}?${query}` : resource;
}

function normalizeCifTotalCollection(payload: unknown): CifTotalRecord[] {
  const candidates = extractCollection(payload);
  return candidates.map(normalizeCifTotalRecord);
}

function normalizeCifUnitarioCollection(payload: unknown): CifUnitarioRecord[] {
  const candidates = extractCollection(payload);
  return candidates.map(normalizeCifUnitarioRecord);
}

function normalizeRecalculationCollection(payload: unknown): CifRecalculationResult[] {
  const candidates = extractCollection(payload);
  if (candidates.length === 0 && payload && typeof payload === 'object') {
    return [normalizeRecalculationRecord(payload as UnknownRecord)];
  }
  return candidates.map((candidate) => normalizeRecalculationRecord(candidate));
}

function extractCollection(payload: unknown): UnknownRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is UnknownRecord => !!item && typeof item === 'object');
  }
  if (payload && typeof payload === 'object') {
    const data = payload as UnknownRecord;
    const possibleArrays = [
      data.items,
      data.data,
      data.result,
      data.records,
      data.list,
      data.totales,
      data.unitarios,
      data.historial,
      data.results,
    ];
    for (const candidate of possibleArrays) {
      if (Array.isArray(candidate)) {
        return candidate.filter((item): item is UnknownRecord => !!item && typeof item === 'object');
      }
    }
  }
  return [];
}

function normalizeCifTotalRecord(raw: unknown): CifTotalRecord {
  if (!raw || typeof raw !== 'object') {
    return {
      producto: '',
      periodo: '',
      monto: 0,
      base: 0,
    };
  }

  const record = raw as UnknownRecord;
  const periodo = normalizeDate(record.periodo ?? record.period ?? record.date);

  return {
    ...record,
    id: extractId(record),
    producto: typeof record.producto === 'string' ? record.producto : '',
    periodo,
    monto: normalizeNumber(record.monto ?? record.total ?? record.amount),
    base: normalizeNumber(record.base ?? record.baseProrrateo),
    accessId: normalizeOptionalString(record.accessId ?? record.accessID),
    createdAt: normalizeDate(record.createdAt),
    updatedAt: normalizeDate(record.updatedAt),
  };
}

function normalizeCifUnitarioRecord(raw: unknown): CifUnitarioRecord {
  if (!raw || typeof raw !== 'object') {
    return {
      producto: '',
      periodo: '',
      cantidad: 0,
      costoUnitario: 0,
    };
  }

  const record = raw as UnknownRecord;
  const periodo = normalizeDate(record.periodo ?? record.period ?? record.date);

  return {
    ...record,
    id: extractId(record),
    producto: typeof record.producto === 'string' ? record.producto : '',
    periodo,
    cantidad: normalizeNumber(record.cantidad ?? record.quantity ?? record.base),
    costoUnitario: normalizeNumber(record.costoUnitario ?? record.costo ?? record.amount ?? record.total),
    accessId: normalizeOptionalString(record.accessId ?? record.accessID),
    createdAt: normalizeDate(record.createdAt),
    updatedAt: normalizeDate(record.updatedAt),
  };
}

function normalizeRecalculationRecord(raw: UnknownRecord): CifRecalculationResult {
  const periodo = normalizeDate(raw.periodo ?? raw.period ?? raw.date);
  return {
    ...raw,
    id: extractId(raw),
    producto: typeof raw.producto === 'string' ? raw.producto : '',
    periodo,
    monto: normalizeNumber(raw.monto ?? raw.total ?? raw.totalMonto),
    base: normalizeNumber(raw.base ?? raw.baseProrrateo),
    costoUnitario: normalizeNumber(raw.costoUnitario ?? raw.costo ?? raw.unitario),
    cantidad: normalizeOptionalNumber(raw.cantidad ?? raw.quantity),
    accessId: normalizeOptionalString(raw.accessId ?? raw.accessID),
  };
}

function extractId(record: UnknownRecord): string | undefined {
  if (typeof record._id === 'string' && record._id) return record._id;
  if (typeof record.id === 'string' && record.id) return record.id;
  if (typeof record.uid === 'string' && record.uid) return record.uid;
  return undefined;
}

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function normalizeOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string') return value;
  return String(value);
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    return trimmed;
  }
  if (typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return '';
}
