import apiClient from '@/lib/http/apiClient';
import { logHttpError } from '@/lib/observability/logger';
import type {
  AccionMasivaResultado,
  FiltroPersistente,
  OperacionModulo,
  OperacionRegistro,
  ResumenContextual,
} from './types';

type RawRecord = Record<string, unknown>;

const resourceMap: Record<OperacionModulo, string> = {
  consumos: 'consumos',
  producciones: 'producciones',
  litros: 'litros-crema',
  perdidas: 'perdidas',
  sobrantes: 'sobrantes',
};

function ensureId(raw: RawRecord): string {
  const id = raw._id ?? raw.id ?? raw.ID ?? raw.Id;
  if (id !== undefined && id !== null) {
    return String(id);
  }
  return `tmp-${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeDateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toISOString();
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

function ensureIsoDate(value: unknown, fallback: string): string {
  return normalizeDateString(value) ?? fallback;
}

const fromApi: Record<OperacionModulo, (raw: RawRecord) => OperacionRegistro> = {
  consumos: (raw) => {
    const fecha = ensureIsoDate(raw.fecha ?? raw.Fecha, new Date().toISOString());
    const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.CalculationDate, fecha);
    return {
      id: ensureId(raw),
      producto: String(raw.producto ?? ''),
      insumo: String(raw.insumo ?? ''),
      cantidad: Number(raw.cantidad ?? 0),
      unidad: String(raw.unidad ?? ''),
      tipoProd: raw.tipoProd ? String(raw.tipoProd) : undefined,
      fecha,
      calculationDate,
      centro: raw.centro ? String(raw.centro) : 'CENTRO-GENERAL',
      responsable: raw.responsable ? String(raw.responsable) : raw.usuario ? String(raw.usuario) : undefined,
      createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
      createdAt: normalizeDateString(raw.createdAt) ?? fecha,
      updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
      updatedAt: normalizeDateString(raw.updatedAt),
      source: raw.accessId ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: raw.accessId ? String(raw.accessId) : undefined,
    };
  },
  producciones: (raw) => {
    const fecha = ensureIsoDate(raw.fecha ?? raw.Fecha, new Date().toISOString());
    const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.CalculationDate, fecha);
    const centroValue = raw.centro ?? raw.CENTRO;
    return {
      id: ensureId(raw),
      producto: String(raw.producto ?? ''),
      cantidad: Number(raw.cantidad ?? 0),
      centro: centroValue !== undefined ? String(centroValue) : '0',
      etapa: String(raw.etapa ?? raw.Etapa ?? 'N/D'),
      fecha,
      calculationDate,
      responsable: raw.responsable ? String(raw.responsable) : undefined,
      createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
      createdAt: normalizeDateString(raw.createdAt) ?? fecha,
      updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
      updatedAt: normalizeDateString(raw.updatedAt),
      source: raw.accessId ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: raw.accessId ? String(raw.accessId) : undefined,
    };
  },
  litros: (raw) => {
    const fecha = ensureIsoDate(raw.Fechalitro ?? raw.fecha, new Date().toISOString());
    const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.fechaCalculo, fecha);
    return {
      id: ensureId(raw),
      producto: String(raw.Producto ?? raw.producto ?? ''),
      litros: Number(raw.Monto ?? raw.litros ?? 0),
      fecha,
      calculationDate,
      responsable: raw.responsable ? String(raw.responsable) : undefined,
      createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
      createdAt: normalizeDateString(raw.createdAt) ?? fecha,
      updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
      updatedAt: normalizeDateString(raw.updatedAt),
      source: raw.accessId ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: raw.accessId ? String(raw.accessId) : undefined,
    };
  },
  perdidas: (raw) => {
    const fecha = ensureIsoDate(raw.FechaPer ?? raw.fecha, new Date().toISOString());
    const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.CalculationDate, fecha);
    return {
      id: ensureId(raw),
      producto: raw.PRODUCTO ? String(raw.PRODUCTO) : undefined,
      grupo: raw.GRUPO ? String(raw.GRUPO) : undefined,
      horma: raw.HORMA !== undefined ? Number(raw.HORMA) : undefined,
      cantidad: Number(raw.CANTIKG ?? raw.cantidad ?? 0),
      unidad: raw.unidad ? String(raw.unidad) : undefined,
      fecha,
      calculationDate,
      responsable: raw.responsable ? String(raw.responsable) : undefined,
      createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
      createdAt: normalizeDateString(raw.createdAt) ?? fecha,
      updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
      updatedAt: normalizeDateString(raw.updatedAt),
      source: raw.accessId ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: raw.accessId ? String(raw.accessId) : undefined,
    };
  },
  sobrantes: (raw) => {
    const fecha = ensureIsoDate(raw.FechaSob ?? raw.fecha, new Date().toISOString());
    const calculationDate = ensureIsoDate(raw.calculationDate ?? raw.CalculationDate, fecha);
    return {
      id: ensureId(raw),
      producto: raw.PRODUCTO ? String(raw.PRODUCTO) : undefined,
      grupo: raw.GRUPO ? String(raw.GRUPO) : undefined,
      horma: raw.HORMA !== undefined ? Number(raw.HORMA) : undefined,
      cantidad: raw.CANTIKG !== undefined ? Number(raw.CANTIKG) : raw.cantidad !== undefined ? Number(raw.cantidad) : undefined,
      unidad: raw.unidad ? String(raw.unidad) : undefined,
      fecha,
      calculationDate,
      responsable: raw.responsable ? String(raw.responsable) : undefined,
      createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
      createdAt: normalizeDateString(raw.createdAt) ?? fecha,
      updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
      updatedAt: normalizeDateString(raw.updatedAt),
      source: raw.accessId ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: raw.accessId ? String(raw.accessId) : undefined,
    };
  },
};

const toApi: Record<OperacionModulo, (registro: OperacionRegistro) => RawRecord> = {
  consumos: (registro) => ({
    producto: registro.producto,
    insumo: registro.insumo,
    cantidad: registro.cantidad,
    unidad: registro.unidad,
    tipoProd: registro.tipoProd,
    fecha: registro.fecha,
    calculationDate: registro.calculationDate,
    accessId: registro.accessId,
  }),
  producciones: (registro) => ({
    producto: registro.producto,
    cantidad: registro.cantidad,
    centro: Number.parseInt(registro.centro, 10) || 0,
    etapa: registro.etapa,
    fecha: registro.fecha,
    calculationDate: registro.calculationDate,
    accessId: registro.accessId,
  }),
  litros: (registro) => ({
    fecha: registro.fecha,
    Producto: registro.producto,
    Monto: registro.litros,
  }),
  perdidas: (registro) => ({
    FechaPer: registro.fecha,
    GRUPO: registro.grupo,
    PRODUCTO: registro.producto,
    HORMA: registro.horma,
    CANTIKG: registro.cantidad,
    calculationDate: registro.calculationDate,
  }),
  sobrantes: (registro) => ({
    FechaSob: registro.fecha,
    GRUPO: registro.grupo,
    PRODUCTO: registro.producto,
    HORMA: registro.horma,
    CANTIKG: registro.cantidad,
    calculationDate: registro.calculationDate,
  }),
};

function buildQuery(modulo: OperacionModulo, filtros: FiltroPersistente): string {
  const params = new URLSearchParams();

  if (filtros.producto) {
    params.set('producto', filtros.producto);
  }

  if (filtros.rango && (modulo === 'consumos' || modulo === 'producciones' || modulo === 'perdidas' || modulo === 'sobrantes')) {
    params.set('desde', filtros.rango.desde);
    params.set('hasta', filtros.rango.hasta);
  }

  if (modulo === 'producciones' && filtros.centro) {
    params.set('centro', filtros.centro);
  }

  return params.toString();
}

function mapResponse(modulo: OperacionModulo, payload: unknown): OperacionRegistro[] {
  if (!payload) return [];
  const records = Array.isArray(payload) ? payload : [payload];
  return (records as RawRecord[]).map((raw) => fromApi[modulo](raw));
}

export async function fetchOperacionRegistros(
  modulo: OperacionModulo,
  filtros: FiltroPersistente,
): Promise<OperacionRegistro[]> {
  const resource = resourceMap[modulo];
  const query = buildQuery(modulo, filtros);
  const endpoint = query ? `/api/${resource}?${query}` : `/api/${resource}`;
  const payload = await apiClient.get<unknown>(endpoint);
  return mapResponse(modulo, payload);
}

export async function createOperacionRegistro(
  modulo: OperacionModulo,
  registro: OperacionRegistro,
  usuario?: string,
): Promise<OperacionRegistro> {
  const resource = resourceMap[modulo];
  const headers = usuario ? { 'x-user': usuario } : undefined;
  const payload = toApi[modulo](registro);
  const response = await apiClient.post<unknown, RawRecord>(`/api/${resource}`, payload, { headers });
  const registros = mapResponse(modulo, response);
  return registros[0] ?? fromApi[modulo](payload);
}

export async function updateOperacionRegistro(
  modulo: OperacionModulo,
  registro: OperacionRegistro,
  usuario?: string,
): Promise<OperacionRegistro> {
  const resource = resourceMap[modulo];
  const headers = usuario ? { 'x-user': usuario } : undefined;
  const payload = toApi[modulo](registro);
  const response = await apiClient.put<unknown, RawRecord>(`/api/${resource}/${registro.id}`, payload, { headers });
  const registros = mapResponse(modulo, response);
  return registros[0] ?? registro;
}

export async function deleteOperacionRegistro(
  modulo: OperacionModulo,
  id: string,
  usuario?: string,
): Promise<void> {
  const resource = resourceMap[modulo];
  const headers = usuario ? { 'x-user': usuario } : undefined;
  await apiClient.delete(`/api/${resource}/${id}`, { headers });
}

export async function runAccionMasivaRemota(
  modulo: OperacionModulo,
  accion: 'aprobar' | 'recalcular' | 'cerrar',
  ids: string[],
): Promise<AccionMasivaResultado> {
  const impactoBase = ids.length;
  return {
    accion,
    registrosProcesados: impactoBase,
    impactoExistencias: accion === 'recalcular' ? impactoBase * 2 : 0,
    impactoCostos: accion === 'cerrar' ? impactoBase : 0,
    mensaje: `Acción ${accion} programada para ${impactoBase} registros del módulo ${modulo}.`,
  };
}

export async function fetchCierreOperacion(modulo: OperacionModulo): Promise<Partial<ResumenContextual> | null> {
  try {
    const response = await apiClient.get<{ date?: string }>(`/api/fecha-calculo`);
    if (!response?.date) {
      return null;
    }
    return {
      centro: 'CENTRO-GENERAL',
      calculationDate: response.date,
      bloqueado: false,
    };
  } catch (error) {
    logHttpError({ url: '/api/fecha-calculo', method: 'GET', status: undefined, payload: { error } });
    return null;
  }
}

