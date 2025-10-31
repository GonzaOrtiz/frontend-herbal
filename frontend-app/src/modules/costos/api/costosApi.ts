import apiClient from '@/lib/http/apiClient';
import type {
  CostosFilters,
  CostosListResponse,
  CostosProcessPayload,
  CostosRecordMap,
  CostosSubModulo,
  ProcessHandle,
  ProcessStatusResponse,
} from '../types';
import { buildTrendSeries, normalizeRecord } from '../utils/transformers';

const endpointMap: Record<Exclude<CostosSubModulo, 'prorrateo'>, string> = {
  gastos: '/api/costos/gasto-centro',
  depreciaciones: '/api/costos/depreciacion',
  sueldos: '/api/costos/sueldo',
};

const processEndpoint = '/api/costos/procesos';

function buildQuery(filters: CostosFilters): string {
  const params = new URLSearchParams();
  if (filters.centro) params.set('centro', filters.centro);
  if (filters.calculationDate) params.set('fechaCalculo', filters.calculationDate);
  if (filters.esGastoDelPeriodo !== undefined) {
    params.set('esGastoDelPeriodo', String(filters.esGastoDelPeriodo));
  }
  if (filters.concepto) params.set('concepto', filters.concepto);
  if (filters.nroEmpleado !== undefined && filters.nroEmpleado !== null) {
    params.set('nroEmpleado', String(filters.nroEmpleado));
  }
  return params.toString();
}

function inferTotalAmount<T extends { monto?: number; depreMensual?: number; sueldoTotal?: number }>(
  submodule: CostosSubModulo,
  items: T[],
): number {
  switch (submodule) {
    case 'gastos':
      return items.reduce((acc, item) => acc + (item.monto ?? 0), 0);
    case 'depreciaciones':
      return items.reduce((acc, item) => acc + (item.depreMensual ?? 0), 0);
    case 'sueldos':
      return items.reduce((acc, item) => acc + (item.sueldoTotal ?? 0), 0);
    default:
      return 0;
  }
}

function normalizeHistory(raw: unknown): { period: string; totalAmount: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const period = 'period' in item ? String(item.period) : undefined;
      const amountCandidate =
        'amount' in item
          ? (item.amount as number)
          : 'totalAmount' in item
            ? (item.totalAmount as number)
            : 'monto' in item
              ? (item.monto as number)
              : undefined;
      const totalAmount = Number.isFinite(amountCandidate) ? (amountCandidate as number) : 0;
      if (!period) return null;
      return { period, totalAmount };
    })
    .filter((item): item is { period: string; totalAmount: number } => item !== null);
}

export async function fetchCostosList<K extends Exclude<CostosSubModulo, 'prorrateo'>>(
  submodule: K,
  filters: CostosFilters,
): Promise<CostosListResponse<CostosRecordMap[K]>> {
  const endpoint = endpointMap[submodule];
  const query = buildQuery(filters);
  const url = query ? `${endpoint}?${query}` : endpoint;
  const response = await apiClient.get<unknown>(url);

  let items: unknown[] = [];
  let balance = 0;
  let difference = 0;
  let warning: string | null | undefined;
  let previousTotal: number | undefined;
  let totalAmount: number | undefined;
  let totalCount: number | undefined;
  let currency = 'ARS';
  let history: { period: string; totalAmount: number }[] = [];

  if (Array.isArray(response)) {
    items = response;
  } else if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>;
    if (Array.isArray(data.items)) {
      items = data.items;
    } else if (Array.isArray(data.data)) {
      items = data.data;
    } else if (Array.isArray(data.result)) {
      items = data.result;
    }
    if (typeof data.balance === 'number') {
      balance = data.balance;
    }
    if (typeof data.difference === 'number') {
      difference = data.difference;
    }
    if (typeof data.warning === 'string') {
      warning = data.warning;
    } else if (typeof data.alert === 'string') {
      warning = data.alert;
    }
    if (typeof data.previousTotal === 'number') {
      previousTotal = data.previousTotal;
    }
    if (typeof data.totalAmount === 'number') {
      totalAmount = data.totalAmount;
    }
    if (typeof data.count === 'number') {
      totalCount = data.count;
    }
    if (typeof data.currency === 'string') {
      currency = data.currency;
    }
    if (Array.isArray(data.history) || Array.isArray(data.historico)) {
      history = normalizeHistory((data.history ?? data.historico) as unknown[]);
    }
  }

  const normalized = items.map((item) => normalizeRecord(submodule, item as Record<string, unknown>));
  const computedTotalAmount = totalAmount ?? inferTotalAmount(submodule, normalized);
  const computedDifference = difference || 0;
  const computedBalance = balance ?? 0;
  const computedHistory = history.length > 0 ? history : buildImplicitHistory(normalized, submodule);

  return {
    items: normalized,
    totalAmount: computedTotalAmount,
    totalCount: totalCount ?? normalized.length,
    balance: computedBalance,
    warning,
    difference: computedDifference,
    previousTotal,
    currency,
    history: computedHistory,
  };
}

function buildImplicitHistory<K extends Exclude<CostosSubModulo, 'prorrateo'>>(
  items: CostosRecordMap[K][],
  submodule: K,
): { period: string; totalAmount: number }[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    const period = (item.calculationDate ?? '').slice(0, 10) || 'Periodo';
    const amount =
      submodule === 'gastos'
        ? (item as CostosRecordMap['gastos']).monto
        : submodule === 'depreciaciones'
          ? (item as CostosRecordMap['depreciaciones']).depreMensual
          : (item as CostosRecordMap['sueldos']).sueldoTotal;
    totals.set(period, (totals.get(period) ?? 0) + amount);
  }
  return Array.from(totals.entries()).map(([period, totalAmount]) => ({ period, totalAmount }));
}

export async function startCostosProcess(payload: CostosProcessPayload): Promise<ProcessHandle> {
  return apiClient.post<ProcessHandle, CostosProcessPayload>(processEndpoint, payload);
}

export async function fetchProcessStatus(processId: string): Promise<ProcessStatusResponse> {
  return apiClient.get<ProcessStatusResponse>(`${processEndpoint}/${processId}`);
}

export async function cancelProcess(processId: string): Promise<void> {
  await apiClient.post<void, Record<string, never>>(`${processEndpoint}/${processId}/cancel`, {});
}

export async function retryProcess(processId: string): Promise<ProcessHandle> {
  return apiClient.post<ProcessHandle, Record<string, string>>(`${processEndpoint}/${processId}/retry`, {});
}

export function deriveTrendPoints(response: CostosListResponse<CostosRecordMap[keyof CostosRecordMap]>) {
  return buildTrendSeries(response.history);
}
