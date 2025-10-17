import apiClient from '@/lib/http/apiClient';
import type {
  ComparisonInsight,
  ComparisonPoint,
  ExportProgress,
  ReportDownloadLog,
  ReportFilters,
  ReportFormat,
  ReportId,
  ReportCuadroCard,
  ReportSummaryCard,
  ReportTableDescriptor,
} from '../types';
import {
  buildComparisonInsight,
  buildCostosSummaryCards,
  normalizeCuadrosResponse,
  normalizeAsignacionesResponse,
  normalizeComparativoResponse,
  normalizeConsumosResponse,
  normalizeCostosResponse,
  normalizeCifResponse,
  normalizeDownloadLog,
  normalizeManoObraResponse,
} from '../utils/normalizers';
import { serializeFiltersToSearch } from '../utils/filters';

const endpointMap: Record<ReportId, string> = {
  costos: '/api/reportes/costos',
  comparativo: '/api/reportes/comparativo',
  cif: '/api/reportes/cif',
  consumos: '/api/reportes/consumos',
  asignaciones: '/api/reportes/asignaciones',
  'mano-obra': '/api/reportes/mano-obra',
  cuadros: '/api/reportes/cuadros',
  descargas: '/api/reportes/descargas',
};

interface FetchCostosResult {
  tables: ReportTableDescriptor[];
  cards: ReportSummaryCard[];
}

export async function fetchCostosReport(filters: ReportFilters): Promise<FetchCostosResult> {
  const query = serializeFiltersToSearch(filters);
  const response = await apiClient.get<unknown>(buildUrl('costos', query));
  const normalized = normalizeCostosResponse(response);
  const cards = buildCostosSummaryCards(normalized);

  const costosTable: ReportTableDescriptor = {
    id: 'costos-centro',
    title: 'Costos por centro',
    description: 'Montos consolidados por centro de costos.',
    columns: [
      { id: 'centro', label: 'Centro' },
      { id: 'monto', label: 'Monto', align: 'right', isNumeric: true },
    ],
    rows: normalized.costos.map((item) => ({
      centro: item.centro,
      monto: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'ARS' }).format(item.monto),
    })),
    emptyMessage: 'Sin registros de costos para el periodo solicitado.',
  };

  const consumosTable: ReportTableDescriptor = {
    id: 'consumos-producto',
    title: 'Consumos por producto',
    description: 'Totales consumidos durante el periodo.',
    columns: [
      { id: 'producto', label: 'Producto' },
      { id: 'cantidad', label: 'Cantidad', align: 'right', isNumeric: true },
    ],
    rows: normalized.consumos.map((item) => ({
      producto: item.producto,
      cantidad: new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        item.cantidad,
      ),
    })),
    emptyMessage: 'No se registraron consumos en el periodo seleccionado.',
  };

  const cifTable = normalizeCifResponse(normalized.cif);

  return {
    tables: [costosTable, consumosTable, cifTable],
    cards,
  };
}

export async function fetchComparativoReport(
  filters: ReportFilters,
): Promise<{ points: ComparisonPoint[]; insight: ComparisonInsight }> {
  const query = serializeFiltersToSearch(filters);
  const response = await apiClient.get<unknown>(buildUrl('comparativo', query));
  return {
    points: normalizeComparativoResponse(response),
    insight: buildComparisonInsight(response),
  };
}

export async function fetchCuadrosReport(filters: ReportFilters): Promise<ReportCuadroCard[]> {
  const query = serializeFiltersToSearch(filters);
  const response = await apiClient.get<unknown>(buildUrl('cuadros', query));
  return normalizeCuadrosResponse(response);
}

export async function fetchConsumosReport(filters: ReportFilters): Promise<ReportTableDescriptor> {
  const query = serializeFiltersToSearch(filters);
  const response = await apiClient.get<unknown>(buildUrl('consumos', query));
  return normalizeConsumosResponse(response);
}

export async function fetchAsignacionesReport(filters: ReportFilters): Promise<ReportTableDescriptor> {
  const query = serializeFiltersToSearch(filters);
  const response = await apiClient.get<unknown>(buildUrl('asignaciones', query));
  return normalizeAsignacionesResponse(response);
}

export async function fetchManoObraReport(filters: ReportFilters): Promise<ReportTableDescriptor> {
  const query = serializeFiltersToSearch(filters);
  const response = await apiClient.get<unknown>(buildUrl('mano-obra', query));
  return normalizeManoObraResponse(response);
}

export async function fetchDownloadLog(filters: ReportFilters): Promise<ReportDownloadLog[]> {
  const query = serializeFiltersToSearch(filters);
  const response = await apiClient.get<unknown>(buildUrl('descargas', query));
  return normalizeDownloadLog(response);
}

const MAX_EXPORT_ROWS = 50000;

interface ExportReportResponse {
  url?: string;
  rowCount?: number;
}

export async function exportReport(
  reportId: ReportId,
  filters: ReportFilters,
  format: Exclude<ReportFormat, 'json'>,
): Promise<ExportProgress> {
  const query = serializeFiltersToSearch({ ...filters, format }).toString();
  const url = `${endpointMap[reportId]}${query ? `?${query}` : ''}`;

  const progress: ExportProgress = {
    status: 'preparing',
    percentage: 10,
    message: 'Preparando exportación…',
  };

  const response = await apiClient.get<ExportReportResponse>(url, {
    headers: {
      Accept:
        format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  const rowCount = Number(response?.rowCount ?? 0);
  if (rowCount > MAX_EXPORT_ROWS) {
    return {
      status: 'error',
      percentage: 100,
      error: `La exportación excede el máximo permitido de ${MAX_EXPORT_ROWS.toLocaleString('es-MX')} filas. Ajusta los filtros y vuelve a intentar.`,
    };
  }

  return {
    status: 'completed',
    percentage: 100,
    message: 'Exportación lista.',
    downloadUrl: response?.url,
    rowCount,
  };
}

export async function logDownload(
  reportId: ReportId,
  filters: ReportFilters,
  format: Exclude<ReportFormat, 'json'>,
  status: 'completed' | 'failed',
  rowCount: number,
): Promise<void> {
  await apiClient.post('/api/reportes/auditoria', {
    reportId,
    filters,
    format,
    status,
    rowCount,
    downloadedAt: new Date().toISOString(),
  });
}

function buildUrl(reportId: ReportId, params: URLSearchParams): string {
  const base = endpointMap[reportId];
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
