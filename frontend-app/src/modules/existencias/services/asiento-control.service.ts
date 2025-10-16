import apiClient from '@/lib/http/apiClient';
import type { AsientoControl, CreateAsientoControlPayload } from '../types';

interface RequestOptions {
  signal?: AbortSignal;
  usuario?: string;
}

type RawRecord = Record<string, unknown>;

const ID_CANDIDATES = ['_id', 'id', 'ID', 'asientoId', 'idAsiento'];
const FECHA_CANDIDATES = ['fecha', 'date', 'fechaAsiento'];
const DEBITO_CANDIDATES = ['debitos', 'debito', 'totalDebitos'];
const CREDITO_CANDIDATES = ['creditos', 'credito', 'totalCreditos'];
const ACCESS_ID_CANDIDATES = ['accessId', 'AccessId', 'ACCESSID'];
const CREATED_BY_CANDIDATES = ['createdBy', 'usuario', 'user'];
const CREATED_AT_CANDIDATES = ['createdAt', 'fechaRegistro'];

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

function ensureId(raw: RawRecord): string {
  for (const key of ID_CANDIDATES) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  const dynamic = Object.keys(raw).find((key) => /^id/i.test(key));
  if (dynamic) {
    const value = raw[dynamic];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return `tmp-${Math.random().toString(36).slice(2, 11)}`;
}

function pickString(raw: RawRecord, candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const value = raw[candidate];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());
  const dynamicKey = Object.keys(raw).find((key) => normalizedCandidates.includes(key.toLowerCase()));
  if (dynamicKey) {
    const value = raw[dynamicKey];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return undefined;
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

function normalizeAsiento(raw: RawRecord): AsientoControl {
  return {
    id: ensureId(raw),
    debitos: parseNumber(pickField(raw, DEBITO_CANDIDATES)),
    creditos: parseNumber(pickField(raw, CREDITO_CANDIDATES)),
    fecha: normalizeDate(pickField(raw, FECHA_CANDIDATES)) ?? new Date().toISOString(),
    accessId: pickString(raw, ACCESS_ID_CANDIDATES),
    createdBy: pickString(raw, CREATED_BY_CANDIDATES),
    createdAt: normalizeDate(pickField(raw, CREATED_AT_CANDIDATES)),
  };
}

function pickField(raw: RawRecord, candidates: string[]): unknown {
  for (const candidate of candidates) {
    if (candidate in raw) {
      return raw[candidate];
    }
  }
  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());
  const dynamicKey = Object.keys(raw).find((key) => normalizedCandidates.includes(key.toLowerCase()));
  if (dynamicKey) {
    return raw[dynamicKey];
  }
  return undefined;
}

export async function listAsientosControl(options: RequestOptions = {}): Promise<AsientoControl[]> {
  const response = await apiClient.get<unknown>('/api/asientos-control', {
    signal: options.signal,
  });

  const asientos: RawRecord[] = [];

  if (Array.isArray(response)) {
    for (const item of response) {
      if (item && typeof item === 'object') {
        asientos.push(item as RawRecord);
      }
    }
  } else if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>;
    const candidateArrays = [data.items, data.data, data.results];
    const array = candidateArrays.find((value): value is unknown[] => Array.isArray(value));

    if (array) {
      for (const item of array) {
        if (item && typeof item === 'object') {
          asientos.push(item as RawRecord);
        }
      }
    } else {
      asientos.push(data as RawRecord);
    }
  }

  return asientos.map(normalizeAsiento).sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
}

export async function crearAsientoControl(
  payload: CreateAsientoControlPayload,
  options: RequestOptions = {},
): Promise<AsientoControl> {
  const headers = options.usuario ? { 'x-user': options.usuario } : undefined;
  const response = await apiClient.post<unknown, CreateAsientoControlPayload>('/api/asientos-control', payload, {
    headers,
    signal: options.signal,
  });

  if (!response || typeof response !== 'object') {
    return {
      id: `tmp-${Math.random().toString(36).slice(2, 11)}`,
      debitos: payload.debitos,
      creditos: payload.creditos,
      fecha: normalizeDate(payload.fecha) ?? new Date().toISOString(),
      accessId: payload.accessId,
    };
  }

  return normalizeAsiento(response as RawRecord);
}
