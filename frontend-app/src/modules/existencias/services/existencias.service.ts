import apiClient from '@/lib/http/apiClient';
import type {
  ConsolidarExistenciasPayload,
  ExistenciaInicialPayload,
  ExistenciaRecord,
  ExistenciasBalance,
  ExistenciasResumen,
} from '../types';

interface RequestOptions {
  signal?: AbortSignal;
  usuario?: string;
}

type RawRecord = Record<string, unknown>;

type RawResponse =
  | RawRecord
  | RawRecord[]
  | {
      existencias?: unknown;
      items?: unknown;
      data?: unknown;
      balance?: unknown;
      asientos?: unknown;
      resumen?: unknown;
      meta?: Record<string, unknown>;
      lastConsolidatedAt?: unknown;
    };

const ID_CANDIDATES = [
  '_id',
  'id',
  'Id',
  'ID',
  'idExistencia',
  'existenciaId',
  'IDExistencia',
];

const PRODUCT_CANDIDATES = ['producto', 'Producto', 'sku', 'SKU', 'nombre'];
const INITIAL_CANDIDATES = ['cantidadInicial', 'cantidad_inicial', 'inicial', 'cantidadIni'];
const PRODUCCION_CANDIDATES = ['produccion', 'production', 'cantProd', 'cantidadProduccion'];
const VENTAS_CANDIDATES = ['ventas', 'sales', 'cantVenta', 'cantidadVentas'];
const PERDIDAS_CANDIDATES = ['perdidas', 'losses', 'cantPerdida', 'cantidadPerdidas'];
const SOBRANTES_CANDIDATES = ['sobrantes', 'surplus', 'cantSobrante', 'cantidadSobrantes'];
const FINAL_CANDIDATES = ['cantidadFinal', 'final', 'cantidad_fin', 'saldo'];
const CALCULATION_DATE_CANDIDATES = ['calculationDate', 'fechaCalculo', 'calculo', 'periodo'];
const UPDATED_AT_CANDIDATES = ['updatedAt', 'lastUpdatedAt', 'fechaActualizacion'];
const ACCESS_ID_CANDIDATES = ['accessId', 'AccessId', 'ACCESSID'];

function ensureId(raw: RawRecord): string {
  for (const key of ID_CANDIDATES) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  const dynamicKey = Object.keys(raw).find((key) => /^id/i.test(key));
  if (dynamicKey) {
    const value = raw[dynamicKey];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  return `tmp-${Math.random().toString(36).slice(2, 11)}`;
}

function pickString(raw: RawRecord, candidates: string[], fallback?: string): string | undefined {
  for (const candidate of candidates) {
    const value = raw[candidate];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());
  const matchingKey = Object.keys(raw).find((key) => normalizedCandidates.includes(key.toLowerCase()));
  if (matchingKey) {
    const value = raw[matchingKey];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  return fallback;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    const normalized = trimmed.replace(/\s+/g, '');
    const commaIndex = normalized.lastIndexOf(',');
    const dotIndex = normalized.lastIndexOf('.');

    let sanitized = normalized;
    if (commaIndex > dotIndex) {
      sanitized = sanitized.replace(/\./g, '').replace(/,/g, '.');
    } else {
      sanitized = sanitized.replace(/,/g, '');
    }

    const parsed = Number.parseFloat(sanitized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  return 0;
}

function pickNumber(raw: RawRecord, candidates: string[]): number {
  for (const candidate of candidates) {
    if (candidate in raw) {
      return parseNumber(raw[candidate]);
    }
  }

  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());
  const matchingKey = Object.keys(raw).find((key) => normalizedCandidates.includes(key.toLowerCase()));
  if (matchingKey) {
    return parseNumber(raw[matchingKey]);
  }

  return 0;
}

function normalizeDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
    return value;
  }
  return undefined;
}

function normalizeExistencia(raw: RawRecord): ExistenciaRecord {
  return {
    id: ensureId(raw),
    producto: pickString(raw, PRODUCT_CANDIDATES) ?? '',
    cantidadInicial: pickNumber(raw, INITIAL_CANDIDATES),
    produccion: pickNumber(raw, PRODUCCION_CANDIDATES),
    ventas: pickNumber(raw, VENTAS_CANDIDATES),
    perdidas: pickNumber(raw, PERDIDAS_CANDIDATES),
    sobrantes: pickNumber(raw, SOBRANTES_CANDIDATES),
    cantidadFinal: pickNumber(raw, FINAL_CANDIDATES),
    accessId: pickString(raw, ACCESS_ID_CANDIDATES),
    calculationDate: normalizeDate(pickString(raw, CALCULATION_DATE_CANDIDATES)),
    lastUpdatedAt: normalizeDate(pickString(raw, UPDATED_AT_CANDIDATES)),
  };
}

function extractExistencias(response: RawResponse): RawRecord[] {
  if (Array.isArray(response)) {
    return response.filter((item): item is RawRecord => item && typeof item === 'object');
  }

  if (response && typeof response === 'object') {
    const candidateArrays = [response.existencias, response.items, response.data, response.results];
    const array = candidateArrays.find((value): value is unknown[] => Array.isArray(value));
    if (array) {
      return array.filter((item): item is RawRecord => item && typeof item === 'object');
    }
  }

  return [];
}

function extractBalance(response: RawResponse): ExistenciasBalance {
  if (response && typeof response === 'object') {
    const sources = [response.balance, response.asientos, response.resumen, response.meta];
    for (const source of sources) {
      if (source && typeof source === 'object') {
        const data = source as RawRecord;
        const debitos = pickNumber(data, ['debitos', 'debito', 'totalDebitos']);
        const creditos = pickNumber(data, ['creditos', 'credito', 'totalCreditos']);
        const diferenciaCandidate = data.diferencia ?? data.difference ?? data.balance;
        const diferencia = parseNumber(diferenciaCandidate);
        return {
          debitos,
          creditos,
          diferencia: diferencia || Number((debitos - creditos).toFixed(2)),
        };
      }
    }
  }

  return {
    debitos: 0,
    creditos: 0,
    diferencia: 0,
  };
}

function extractLastConsolidatedAt(response: RawResponse): string | undefined {
  if (!response || typeof response !== 'object') return undefined;
  if (typeof response.lastConsolidatedAt === 'string') {
    return normalizeDate(response.lastConsolidatedAt) ?? undefined;
  }
  if (response.meta && typeof response.meta === 'object') {
    const meta = response.meta as RawRecord;
    if (typeof meta.lastConsolidatedAt === 'string') {
      return normalizeDate(meta.lastConsolidatedAt) ?? undefined;
    }
    if (typeof meta.updatedAt === 'string') {
      return normalizeDate(meta.updatedAt) ?? undefined;
    }
  }
  return undefined;
}

export async function fetchExistenciasResumen(options: RequestOptions = {}): Promise<ExistenciasResumen> {
  const response = await apiClient.get<RawResponse>('/api/existencias', {
    signal: options.signal,
  });

  const existencias = extractExistencias(response).map(normalizeExistencia);
  const balance = extractBalance(response);
  const lastConsolidatedAt = extractLastConsolidatedAt(response);

  return {
    existencias,
    balance,
    totalProductos: existencias.length,
    lastConsolidatedAt,
  };
}

export async function registrarExistenciasIniciales(
  existencias: ExistenciaInicialPayload[],
  options: RequestOptions = {},
): Promise<{ message?: string } | null> {
  const headers = options.usuario ? { 'x-user': options.usuario } : undefined;
  const response = await apiClient.post<Record<string, unknown> | null, ExistenciaInicialPayload[]>(
    '/api/existencias',
    existencias,
    {
      headers,
      signal: options.signal,
    },
  );

  if (response && typeof response === 'object') {
    const message = 'message' in response ? String(response.message) : undefined;
    return message ? { message } : response;
  }

  return null;
}

export async function consolidarExistencias(
  payload: ConsolidarExistenciasPayload = {},
  options: RequestOptions = {},
): Promise<{ message?: string } | null> {
  const headers = options.usuario ? { 'x-user': options.usuario } : undefined;
  const response = await apiClient.post<Record<string, unknown> | null, ConsolidarExistenciasPayload>(
    '/api/existencias/consolidar',
    payload,
    {
      headers,
      signal: options.signal,
    },
  );

  if (response && typeof response === 'object') {
    const message = 'message' in response ? String(response.message) : undefined;
    return message ? { message } : response;
  }

  return null;
}
