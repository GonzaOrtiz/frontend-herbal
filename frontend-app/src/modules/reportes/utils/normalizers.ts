import { formatCurrency, formatPercentage } from '@/lib/formatters';
import type {
  ComparisonInsight,
  ComparisonPoint,
  ReportDownloadLog,
  ReportFilters,
  ReportSummaryCard,
  ReportTableDescriptor,
} from '../types';

interface CostosResponse {
  costos?: Array<{ centro?: string | number; monto?: number }>;
  consumos?: Array<{ producto?: string; cantidad?: number }>;
  cif?: Array<{ producto?: string; monto?: number }>;
  control?: {
    totalEgresos?: number;
    totalInsumos?: number;
    consistente?: boolean;
    diferencia?: number;
  };
}

interface ComparativoResponse {
  totalEgresos?: number;
  totalInsumos?: number;
  consistente?: boolean;
  diferencia?: number;
}

interface CifResponseItem {
  producto?: string;
  periodo?: string;
  monto?: number;
}

interface ConsumosResponseItem {
  producto?: string;
  unidad?: string;
  cantidad?: number;
  monto?: number;
}

interface AsignacionesResponseItem {
  centro?: string;
  actividad?: string;
  horas?: number;
  porcentaje?: number;
}

interface ManoObraResponseItem {
  actividad?: string;
  descripcion?: string;
  horas?: number;
  monto?: number;
}

export function normalizeCostosResponse(response: unknown): Required<CostosResponse> {
  const defaultControl = {
    totalEgresos: 0,
    totalInsumos: 0,
    consistente: false,
    diferencia: 0,
  };
  if (!response || typeof response !== 'object') {
    return { costos: [], consumos: [], cif: [], control: defaultControl };
  }
  const data = response as Record<string, unknown>;
  const costos = Array.isArray(data.costos) ? data.costos : [];
  const consumos = Array.isArray(data.consumos) ? data.consumos : [];
  const cif = Array.isArray(data.cif) ? data.cif : [];
  const control = data.control && typeof data.control === 'object' ? data.control : {};
  return {
    costos: costos.map((item) => ({
      centro: String((item as { centro?: string | number }).centro ?? '—'),
      monto: Number((item as { monto?: number }).monto ?? 0),
    })),
    consumos: consumos.map((item) => ({
      producto: String((item as { producto?: string }).producto ?? '—'),
      cantidad: Number((item as { cantidad?: number }).cantidad ?? 0),
    })),
    cif: cif.map((item) => ({
      producto: String((item as { producto?: string }).producto ?? '—'),
      monto: Number((item as { monto?: number }).monto ?? 0),
    })),
    control: {
      totalEgresos: Number((control as { totalEgresos?: number }).totalEgresos ?? 0),
      totalInsumos: Number((control as { totalInsumos?: number }).totalInsumos ?? 0),
      consistente: Boolean((control as { consistente?: boolean }).consistente ?? false),
      diferencia: Number((control as { diferencia?: number }).diferencia ?? 0),
    },
  };
}

export function buildCostosSummaryCards(response: Required<CostosResponse>): ReportSummaryCard[] {
  const { totalEgresos, totalInsumos, consistente, diferencia } = response.control;
  const cards: ReportSummaryCard[] = [
    {
      id: 'total-egresos',
      label: 'Total egresos',
      value: formatCurrency(totalEgresos),
    },
    {
      id: 'total-insumos',
      label: 'Total insumos',
      value: formatCurrency(totalInsumos),
    },
    {
      id: 'diferencia',
      label: 'Diferencia',
      value: formatCurrency(diferencia),
      tone: Math.abs(diferencia) > totalInsumos * 0.05 ? 'warning' : 'default',
      helpText: 'Control de consistencia entre egresos e insumos.',
    },
  ];
  cards.push({
    id: 'consistencia',
    label: 'Consistencia',
    value: consistente ? '✔ Consistente' : '⚠ Revisar',
    tone: consistente ? 'success' : 'danger',
    helpText: consistente
      ? 'Los totales cuadran dentro del margen aceptable.'
      : 'Existe una desviación entre egresos e insumos.',
  });
  return cards;
}

export function normalizeComparativoResponse(response: unknown): ComparisonPoint[] {
  const data = (response && typeof response === 'object' ? response : {}) as ComparativoResponse;
  const egresos = Number(data.totalEgresos ?? 0);
  const insumos = Number(data.totalInsumos ?? 0);
  return [
    { name: 'Consolidado actual', egresos, insumos },
  ];
}

export function buildComparisonInsight(response: unknown): ComparisonInsight {
  const data = (response && typeof response === 'object' ? response : {}) as ComparativoResponse;
  const difference = Number(data.diferencia ?? 0);
  const egresos = Number(data.totalEgresos ?? 0);
  const insumos = Number(data.totalInsumos ?? 0);
  const consistent = Boolean(data.consistente ?? false);
  const label = formatCurrency(difference);
  const statusLabel = consistent
    ? 'Los totales coinciden con el margen permitido.'
    : 'Revisar ajustes de costos indirectos.';
  return {
    differenceLabel: `${label} · Variación ${formatPercentage(
      egresos === 0 ? 0 : difference / egresos,
    )}`,
    consistent,
    statusLabel,
  };
}

export function normalizeCifResponse(response: unknown): ReportTableDescriptor<{ producto: string; periodo: string; monto: string }> {
  const items = Array.isArray(response) ? response : Array.isArray((response as { data?: unknown }).data) ? (response as { data?: unknown[] }).data ?? [] : [];
  const rows = (items as CifResponseItem[]).map((item) => ({
    producto: String(item.producto ?? '—'),
    periodo: item.periodo ? item.periodo.slice(0, 7) : '—',
    monto: formatCurrency(Number(item.monto ?? 0)),
  }));
  return {
    id: 'cif',
    title: 'CIF por producto',
    description: 'Agregación de costos indirectos aplicados por producto y periodo.',
    columns: [
      { id: 'producto', label: 'Producto' },
      { id: 'periodo', label: 'Periodo' },
      { id: 'monto', label: 'Monto', align: 'right', isNumeric: true },
    ],
    rows,
    emptyMessage: 'No hay datos de CIF para los filtros aplicados.',
  };
}

export function normalizeConsumosResponse(response: unknown): ReportTableDescriptor<{
  producto: string;
  unidad: string;
  cantidad: string;
  monto: string;
}> {
  const items = Array.isArray(response)
    ? response
    : Array.isArray((response as { items?: unknown[] }).items)
      ? (response as { items?: unknown[] }).items ?? []
      : [];
  const rows = (items as ConsumosResponseItem[]).map((item) => ({
    producto: String(item.producto ?? '—'),
    unidad: String(item.unidad ?? '—'),
    cantidad: new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number(item.cantidad ?? 0),
    ),
    monto: formatCurrency(Number(item.monto ?? 0)),
  }));
  return {
    id: 'consumos',
    title: 'Consumos consolidados',
    description: 'Totales por producto y unidad consumida.',
    columns: [
      { id: 'producto', label: 'Producto' },
      { id: 'unidad', label: 'Unidad' },
      { id: 'cantidad', label: 'Cantidad', align: 'right', isNumeric: true },
      { id: 'monto', label: 'Monto', align: 'right', isNumeric: true },
    ],
    rows,
    emptyMessage: 'No se encontraron consumos para los filtros seleccionados.',
  };
}

export function normalizeAsignacionesResponse(response: unknown): ReportTableDescriptor<{
  centro: string;
  actividad: string;
  horas: string;
  porcentaje: string;
}> {
  const items = Array.isArray(response)
    ? response
    : Array.isArray((response as { data?: unknown[] }).data)
      ? (response as { data?: unknown[] }).data ?? []
      : [];
  const rows = (items as AsignacionesResponseItem[]).map((item) => ({
    centro: String(item.centro ?? '—'),
    actividad: String(item.actividad ?? '—'),
    horas: new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number(item.horas ?? 0),
    ),
    porcentaje: formatPercentage(Number(item.porcentaje ?? 0)),
  }));
  return {
    id: 'asignaciones',
    title: 'Asignaciones por centro',
    description: 'Horas y porcentaje aplicado por actividad.',
    columns: [
      { id: 'centro', label: 'Centro' },
      { id: 'actividad', label: 'Actividad' },
      { id: 'horas', label: 'Horas', align: 'right', isNumeric: true },
      { id: 'porcentaje', label: '% asignado', align: 'right' },
    ],
    rows,
    emptyMessage: 'No existen asignaciones con los filtros configurados.',
  };
}

export function normalizeManoObraResponse(response: unknown): ReportTableDescriptor<{
  actividad: string;
  descripcion: string;
  horas: string;
  monto: string;
}> {
  const items = Array.isArray(response)
    ? response
    : Array.isArray((response as { items?: unknown[] }).items)
      ? (response as { items?: unknown[] }).items ?? []
      : [];
  const rows = (items as ManoObraResponseItem[]).map((item) => ({
    actividad: String(item.actividad ?? '—'),
    descripcion: String(item.descripcion ?? '—'),
    horas: new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number(item.horas ?? 0),
    ),
    monto: formatCurrency(Number(item.monto ?? 0)),
  }));
  return {
    id: 'mano-obra',
    title: 'Mano de obra por actividad',
    description: 'Horas y monto asignado a cada actividad productiva.',
    columns: [
      { id: 'actividad', label: 'Actividad' },
      { id: 'descripcion', label: 'Descripción' },
      { id: 'horas', label: 'Horas', align: 'right', isNumeric: true },
      { id: 'monto', label: 'Monto', align: 'right', isNumeric: true },
    ],
    rows,
    emptyMessage: 'Sin información de mano de obra para los criterios actuales.',
  };
}

export function normalizeDownloadLog(response: unknown): ReportDownloadLog[] {
  const items = Array.isArray(response)
    ? response
    : Array.isArray((response as { items?: unknown[] }).items)
      ? (response as { items?: unknown[] }).items ?? []
      : [];
  return (items as Record<string, unknown>[]).map((item, index) => ({
    id: String(item.id ?? `log-${index}`),
    reportId: String(item.reportId ?? item.reporte ?? 'costos') as ReportDownloadLog['reportId'],
    filters: (item.filters as ReportFilters) ?? {},
    format: String(item.format ?? 'csv') as ReportDownloadLog['format'],
    status: (item.status as ReportDownloadLog['status']) ?? 'completed',
    rowCount: Number(item.rowCount ?? item.totalRows ?? 0),
    createdBy: String(item.createdBy ?? item.usuario ?? 'sistema'),
    requestedAt: String(item.requestedAt ?? item.createdAt ?? new Date().toISOString()),
    completedAt: item.completedAt ? String(item.completedAt) : undefined,
  }));
}
