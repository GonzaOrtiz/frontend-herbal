import { useMemo } from 'react';
import apiClient from '@/lib/http/apiClient';
import { useCatalogData } from './useCatalogData';

export interface CentroApoyo {
  id: string;
  nroCentro: number;
  nombre: string;
  fechaActualizacion?: string;
}

export interface CentroApoyoExpense {
  id: string;
  concepto: string;
  categoria: string;
  monto: number;
  esGastoDelPeriodo: boolean;
  fechaCalculo?: string;
  centro?: string;
}

export interface CentroApoyoExpenseFilters {
  fechaCalculo: string;
  esGastoDelPeriodo?: boolean;
}

export interface CentroApoyoExpenseResponse {
  items: CentroApoyoExpense[];
  total: number;
  count: number;
  currency: string;
}

function mapCentroApoyo(raw: any): CentroApoyo {
  const idCandidate = raw?._id ?? raw?.id ?? raw?.centroId ?? raw?.nroCentro;
  const nro = Number(raw?.nroCentro ?? raw?.numero ?? raw?.centro ?? 0);
  const nombre = typeof raw?.nombre === 'string' ? raw.nombre : String(raw?.descripcion ?? '');
  const updatedAt =
    typeof raw?.fechaActualizacion === 'string'
      ? raw.fechaActualizacion
      : typeof raw?.updatedAt === 'string'
        ? raw.updatedAt
        : undefined;

  return {
    id: idCandidate ? String(idCandidate) : `${nro}-${nombre}`,
    nroCentro: Number.isFinite(nro) ? nro : 0,
    nombre: nombre || 'Sin nombre',
    fechaActualizacion: updatedAt,
  };
}

function mapExpense(raw: any): CentroApoyoExpense {
  const id =
    raw?._id ??
    raw?.id ??
    `${raw?.tablaOrigen ?? raw?.concepto ?? 'gasto'}-${raw?.fechaCalculo ?? raw?.fecha ?? Date.now()}`;
  const rawMonto = raw?.monto ?? raw?.amount ?? raw?.total ?? 0;
  const categoria = raw?.categoria ?? raw?.tipo ?? raw?.conceptoTipo ?? 'Sin categoría';
  const rawPeriodo = raw?.esGastoDelPeriodo ?? raw?.delPeriodo ?? raw?.periodoActual;
  let esDelPeriodo = false;
  if (typeof rawPeriodo === 'boolean') {
    esDelPeriodo = rawPeriodo;
  } else if (typeof rawPeriodo === 'string') {
    esDelPeriodo = rawPeriodo.toLowerCase() === 'true';
  }

  return {
    id: String(id),
    concepto:
      typeof raw?.tablaOrigen === 'string'
        ? raw.tablaOrigen
        : typeof raw?.concepto === 'string'
          ? raw.concepto
          : raw?.descripcion ?? 'Sin concepto',
    categoria: String(categoria || 'Sin categoría'),
    monto: Number.isFinite(rawMonto) ? Number(rawMonto) : 0,
    esGastoDelPeriodo: Boolean(esDelPeriodo),
    fechaCalculo:
      typeof raw?.fechaCalculo === 'string'
        ? raw.fechaCalculo
        : typeof raw?.calculationDate === 'string'
          ? raw.calculationDate
          : typeof raw?.fecha === 'string'
            ? raw.fecha
            : undefined,
    centro: typeof raw?.centro === 'string' ? raw.centro : undefined,
  };
}

export function useCentrosApoyoCatalog() {
  const catalog = useCatalogData<CentroApoyo>({
    resource: 'centros-apoyo',
    mapResponse: mapCentroApoyo,
  });

  const orderedItems = useMemo(
    () => [...catalog.items].sort((a, b) => a.nroCentro - b.nroCentro),
    [catalog.items],
  );

  return { ...catalog, items: orderedItems } as const;
}

export async function fetchCentroApoyoDetalle(id: string, options: { signal?: AbortSignal } = {}): Promise<CentroApoyo> {
  const data = await apiClient.get<unknown>(`/api/centros-apoyo/${id}`, options);
  return mapCentroApoyo(data);
}

export async function actualizarCentroApoyo(
  id: string,
  payload: { nombre: string },
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  await apiClient.put(`/api/centros-apoyo/${id}`, payload, options);
}

function buildExpenseQuery(centroId: string, filters: CentroApoyoExpenseFilters): string {
  const params = new URLSearchParams();
  if (centroId) {
    params.set('centroId', centroId);
  }
  if (filters.fechaCalculo) {
    params.set('fechaCalculo', filters.fechaCalculo);
  }
  if (filters.esGastoDelPeriodo !== undefined) {
    params.set('esGastoDelPeriodo', String(filters.esGastoDelPeriodo));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function listCentroApoyoGastos(
  centroId: string,
  filters: CentroApoyoExpenseFilters,
  options: { signal?: AbortSignal } = {},
): Promise<CentroApoyoExpenseResponse> {
  const query = buildExpenseQuery(centroId, filters);
  const response = await apiClient.get<unknown>(`/api/centros-apoyo/gastos${query}`, options);

  let items: unknown[] = [];
  let total = 0;
  let count = 0;
  let currency = 'MXN';

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
    if (typeof data.total === 'number') {
      total = data.total;
    } else if (typeof data.totalAmount === 'number') {
      total = data.totalAmount;
    }
    if (typeof data.count === 'number') {
      count = data.count;
    }
    if (typeof data.currency === 'string') {
      currency = data.currency;
    }
  }

  const expenses = items.map(mapExpense);
  if (total === 0) {
    total = expenses.reduce((acc, item) => acc + item.monto, 0);
  }
  if (!count) {
    count = expenses.length;
  }

  return { items: expenses, total, count, currency };
}

export type { CentroApoyoExpenseFilters as CentrosApoyoFilters };
