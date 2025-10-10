import { calculateVariation } from '../../../lib/formatters.js';
import type {
  AllocationItem,
  BalanceSummaryData,
  CostosHistoryPoint,
  CostosListResponse,
  CostosRecordMap,
  CostosSubModulo,
  DepreciacionRecord,
  GastoRecord,
  SueldoRecord,
  TrendPoint,
} from '../types';

interface RawRecord {
  [key: string]: unknown;
}

function ensureString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return String(value);
}

function ensureNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return 0;
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

function ensureBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return undefined;
}

function ensureIsoDate(value: unknown): string {
  if (!value) {
    return new Date().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
    return value;
  }
  return new Date().toISOString();
}

function ensureId(raw: RawRecord): string {
  const candidateKeys = ['id', '_id', 'Id', 'ID', 'idRegistro', 'accessId'];
  for (const key of candidateKeys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return `tmp-${Math.random().toString(36).slice(2, 10)}`;
}

export function mapGastoRecord(raw: RawRecord): GastoRecord {
  const monto = ensureNumber(raw.monto ?? raw.Monto ?? raw.importe ?? raw.Importe);
  const centro = ensureString(raw.centro ?? raw.Centro) ?? '0';
  const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.fechaCalculo ?? raw.FechaCalculo);
  return {
    id: ensureId(raw),
    centro,
    calculationDate,
    fecha: ensureIsoDate(raw.fecha ?? raw.Fecha ?? raw.fechaGasto),
    concepto: ensureString(raw.concepto ?? raw.Concepto ?? raw.descripcion),
    monto,
    tipo: ensureString(raw.tipo ?? raw.Tipo ?? raw.clasificacion) ?? undefined,
    tablaOrigen: ensureString(raw.tablaOrigen ?? raw.origen),
    detalle: (raw.detalle && typeof raw.detalle === 'object') ? (raw.detalle as Record<string, unknown>) : null,
    createdAt: raw.createdAt ? ensureIsoDate(raw.createdAt) : undefined,
    createdBy: ensureString(raw.createdBy ?? raw.usuarioAlta),
    updatedAt: raw.updatedAt ? ensureIsoDate(raw.updatedAt) : undefined,
    updatedBy: ensureString(raw.updatedBy ?? raw.usuarioModificacion),
    accessId: ensureString(raw.accessId ?? raw.AccessId ?? raw.accessID),
    esGastoDelPeriodo: ensureBoolean(raw.esGastoDelPeriodo ?? raw.gastoPeriodo) ?? undefined,
    source: raw.accessId ? 'import' : 'manual',
  };
}

export function mapDepreciacionRecord(raw: RawRecord): DepreciacionRecord {
  const centro = ensureString(raw.centro ?? raw.Centro) ?? '0';
  const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.fechaCalculo ?? raw.FechaCalculo);
  return {
    id: ensureId(raw),
    centro,
    calculationDate,
    fechaCalculo: calculationDate,
    maquina: ensureString(raw.maquina ?? raw.Maquina ?? raw.activo) ?? 'SIN-MAQ',
    depreMensual: ensureNumber(raw.depreMensual ?? raw.DepreMensual ?? raw.monto ?? raw.Monto),
    vidaUtil: raw.vidaUtil !== undefined ? ensureNumber(raw.vidaUtil) : undefined,
    valorUso: raw.valorUso !== undefined ? ensureNumber(raw.valorUso) : undefined,
    periodo: ensureString(raw.periodo ?? raw.Periodo),
    createdAt: raw.createdAt ? ensureIsoDate(raw.createdAt) : undefined,
    createdBy: ensureString(raw.createdBy ?? raw.usuarioAlta),
    updatedAt: raw.updatedAt ? ensureIsoDate(raw.updatedAt) : undefined,
    updatedBy: ensureString(raw.updatedBy ?? raw.usuarioModificacion),
    accessId: ensureString(raw.accessId ?? raw.AccessId),
    esGastoDelPeriodo: ensureBoolean(raw.esGastoDelPeriodo),
    source: raw.accessId ? 'import' : 'manual',
  };
}

export function mapSueldoRecord(raw: RawRecord): SueldoRecord {
  const centro = ensureString(raw.centro ?? raw.Centro) ?? '0';
  const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.fechaCalculo ?? raw.FechaCalculo);
  const rawEmployeeNumber = raw.nroEmpleado ?? raw.NroEmpleado ?? raw.empleado ?? 0;
  const parsedEmployeeNumber =
    typeof rawEmployeeNumber === 'number'
      ? rawEmployeeNumber
      : Number.parseInt(String(rawEmployeeNumber).replace(/[^0-9]/g, ''), 10);

  return {
    id: ensureId(raw),
    centro,
    calculationDate,
    nroEmpleado: Number.isNaN(parsedEmployeeNumber) ? 0 : parsedEmployeeNumber,
    fechaSueldo: ensureIsoDate(raw.fechaSueldo ?? raw.FechaSueldo ?? raw.fecha),
    sueldoTotal: ensureNumber(raw.sueldoTotal ?? raw.SueldoTotal ?? raw.monto ?? raw.Monto),
    empleadoNombre: ensureString(raw.nombre ?? raw.Nombre ?? raw.empleadoNombre ?? raw.EmpleadoNombre),
    createdAt: raw.createdAt ? ensureIsoDate(raw.createdAt) : undefined,
    createdBy: ensureString(raw.createdBy ?? raw.usuarioAlta),
    updatedAt: raw.updatedAt ? ensureIsoDate(raw.updatedAt) : undefined,
    updatedBy: ensureString(raw.updatedBy ?? raw.usuarioModificacion),
    accessId: ensureString(raw.accessId ?? raw.AccessId),
    esGastoDelPeriodo: ensureBoolean(raw.esGastoDelPeriodo ?? raw.gastoPeriodo) ?? undefined,
    source: raw.accessId ? 'import' : 'manual',
  };
}

export function normalizeRecord<K extends keyof CostosRecordMap>(
  submodule: K,
  raw: RawRecord,
): CostosRecordMap[K] {
  switch (submodule) {
    case 'gastos':
      return mapGastoRecord(raw) as CostosRecordMap[K];
    case 'depreciaciones':
      return mapDepreciacionRecord(raw) as CostosRecordMap[K];
    case 'sueldos':
      return mapSueldoRecord(raw) as CostosRecordMap[K];
    default:
      throw new Error(`Submódulo no soportado: ${String(submodule)}`);
  }
}

export function calculateBalanceSummary(
  response: CostosListResponse<GastoRecord | DepreciacionRecord | SueldoRecord> | undefined,
): BalanceSummaryData {
  if (!response) {
    return {
      totalAmount: 0,
      previousTotal: 0,
      difference: 0,
      balance: 0,
      variationPercentage: 0,
      warning: undefined,
      currency: 'MXN',
    };
  }
  const previous = response.previousTotal ?? 0;
  const { absolute, percentage } = calculateVariation(response.totalAmount, previous);
  return {
    totalAmount: response.totalAmount,
    previousTotal: previous,
    difference: response.difference,
    balance: response.balance,
    variationPercentage: percentage,
    warning: response.warning,
    currency: response.currency,
  };
}

export function buildAllocationBreakdown(
  submodule: Exclude<CostosSubModulo, 'prorrateo'>,
  records: Array<GastoRecord | DepreciacionRecord | SueldoRecord>,
): AllocationItem[] {
  if (records.length === 0) {
    return [];
  }
  const totals = new Map<string, number>();
  for (const record of records) {
    const key = record.centro ?? '0';
    const amount =
      submodule === 'gastos'
        ? (record as GastoRecord).monto
        : submodule === 'depreciaciones'
          ? (record as DepreciacionRecord).depreMensual
          : (record as SueldoRecord).sueldoTotal;
    totals.set(key, (totals.get(key) ?? 0) + amount);
  }
  const grandTotal = Array.from(totals.values()).reduce((acc, value) => acc + value, 0);
  return Array.from(totals.entries())
    .map(([key, amount]) => ({
      key,
      label: `Centro ${key}`,
      amount,
      percentage: grandTotal === 0 ? 0 : amount / grandTotal,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildTrendSeries(history: CostosHistoryPoint[]): TrendPoint[] {
  if (history.length === 0) return [];
  const sorted = [...history].sort((a, b) => (a.period < b.period ? -1 : 1));
  return sorted.map((point, index) => {
    const previous = index === 0 ? point.totalAmount : sorted[index - 1]?.totalAmount ?? point.totalAmount;
    const { percentage } = calculateVariation(point.totalAmount, previous);
    return {
      period: point.period,
      amount: point.totalAmount,
      variation: percentage,
    };
  });
}
