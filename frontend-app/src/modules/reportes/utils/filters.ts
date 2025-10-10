import type { ReportFilters, ReportFormat } from '../types';

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function normalizePeriodo(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (DATE_REGEX.test(value)) return value;
  if (PERIOD_REGEX.test(value)) {
    return `${value}-01`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

export function normalizeProducto(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeCentro(value?: string | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  if (trimmed === '') return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? String(parsed) : undefined;
}

export function normalizeFormat(value?: string | null): ReportFormat | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'csv' || normalized === 'xlsx' || normalized === 'json') {
    return normalized;
  }
  return undefined;
}

export function parseFiltersFromSearch(params: URLSearchParams): ReportFilters {
  return {
    periodo: normalizePeriodo(params.get('periodo')),
    producto: normalizeProducto(params.get('producto')),
    centro: normalizeCentro(params.get('centro')),
    format: normalizeFormat(params.get('format')),
  };
}

export function serializeFiltersToSearch(filters: ReportFilters): URLSearchParams {
  const params = new URLSearchParams();
  const periodo = normalizePeriodo(filters.periodo);
  if (periodo) params.set('periodo', periodo);

  const producto = normalizeProducto(filters.producto);
  if (producto) params.set('producto', producto);

  const centro = normalizeCentro(filters.centro);
  if (centro) params.set('centro', centro);

  const format = normalizeFormat(filters.format);
  if (format) params.set('format', format);
  return params;
}

export function isFilterCombinationValid(filters: ReportFilters): boolean {
  if (filters.centro && !filters.periodo) {
    return false;
  }
  return true;
}

export function buildShareableLink(filters: ReportFilters): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const params = serializeFiltersToSearch(filters);
  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
}

export function compareFilters(a: ReportFilters, b: ReportFilters): boolean {
  return a.periodo === b.periodo && a.producto === b.producto && a.centro === b.centro && a.format === b.format;
}

export function normalizeFilters(filters: ReportFilters): ReportFilters {
  return parseFiltersFromSearch(serializeFiltersToSearch(filters));
}
