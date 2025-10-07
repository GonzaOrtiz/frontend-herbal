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

const possibleIdKeys = ['_id', 'id', 'ID', 'Id', 'idRegistro', 'IDRegistro', 'idLitros', 'IDLitros'];

function ensureId(raw: RawRecord): string {
  for (const key of possibleIdKeys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  const dynamicIdKey = Object.keys(raw).find((key) => /id$/i.test(key) || /^id/i.test(key));
  if (dynamicIdKey) {
    const value = raw[dynamicIdKey];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }

  return `tmp-${Math.random().toString(36).slice(2, 11)}`;
}

function getRawValue(raw: RawRecord, ...candidates: string[]): unknown {
  for (const candidate of candidates) {
    if (candidate in raw) {
      return raw[candidate];
    }
  }

  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());
  const matchingKey = Object.keys(raw).find((key) => normalizedCandidates.includes(key.toLowerCase()));
  if (matchingKey) {
    return raw[matchingKey];
  }

  return undefined;
}

function parseNumeric(value: unknown): number {
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
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  return normalizeDateString(value) ?? fallback;
}

const fromApi: Record<OperacionModulo, (raw: RawRecord) => OperacionRegistro> = {
  consumos: (raw) => {
    const fecha = ensureIsoDate(getRawValue(raw, 'fecha', 'Fecha'), new Date().toISOString());
    const calculationDate = ensureIsoDate(getRawValue(raw, 'calculationDate', 'CalculationDate', 'fechaCalculo'), fecha);
    return {
      id: ensureId(raw),
      producto: String(getRawValue(raw, 'producto', 'Producto') ?? ''),
      insumo: String(getRawValue(raw, 'insumo', 'Insumo') ?? ''),
      cantidad: parseNumeric(getRawValue(raw, 'cantidad', 'Cantidad')), 
      unidad: String(getRawValue(raw, 'unidad', 'Unidad') ?? ''),
      tipoProd: getRawValue(raw, 'tipoProd', 'TipoProd') ? String(getRawValue(raw, 'tipoProd', 'TipoProd')) : undefined,
      fecha,
      calculationDate,
      centro: getRawValue(raw, 'centro', 'Centro') ? String(getRawValue(raw, 'centro', 'Centro')) : 'CENTRO-GENERAL',
      responsable: getRawValue(raw, 'responsable', 'usuario')
        ? String(getRawValue(raw, 'responsable', 'usuario'))
        : undefined,
      createdBy: getRawValue(raw, 'createdBy') ? String(getRawValue(raw, 'createdBy')) : undefined,
      createdAt: normalizeDateString(getRawValue(raw, 'createdAt')) ?? fecha,
      updatedBy: getRawValue(raw, 'updatedBy') ? String(getRawValue(raw, 'updatedBy')) : undefined,
      updatedAt: normalizeDateString(getRawValue(raw, 'updatedAt')),
      source: getRawValue(raw, 'accessId') ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: getRawValue(raw, 'accessId') ? String(getRawValue(raw, 'accessId')) : undefined,
    };
  },
  producciones: (raw) => {
    const fecha = ensureIsoDate(getRawValue(raw, 'fecha', 'Fecha'), new Date().toISOString());
    const calculationDate = ensureIsoDate(getRawValue(raw, 'calculationDate', 'CalculationDate', 'fechaCalculo'), fecha);
    const centroValue = getRawValue(raw, 'centro', 'Centro', 'CENTRO');
    return {
      id: ensureId(raw),
      producto: String(getRawValue(raw, 'producto', 'Producto') ?? ''),
      cantidad: parseNumeric(getRawValue(raw, 'cantidad', 'Cantidad')), 
      centro: centroValue !== undefined ? String(centroValue) : '0',
      etapa: String(getRawValue(raw, 'etapa', 'Etapa') ?? 'N/D'),
      fecha,
      calculationDate,
      responsable: getRawValue(raw, 'responsable') ? String(getRawValue(raw, 'responsable')) : undefined,
      createdBy: getRawValue(raw, 'createdBy') ? String(getRawValue(raw, 'createdBy')) : undefined,
      createdAt: normalizeDateString(getRawValue(raw, 'createdAt')) ?? fecha,
      updatedBy: getRawValue(raw, 'updatedBy') ? String(getRawValue(raw, 'updatedBy')) : undefined,
      updatedAt: normalizeDateString(getRawValue(raw, 'updatedAt')),
      source: getRawValue(raw, 'accessId') ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: getRawValue(raw, 'accessId') ? String(getRawValue(raw, 'accessId')) : undefined,
    };
  },
  litros: (raw) => {
    const fecha = ensureIsoDate(getRawValue(raw, 'Fechalitro', 'fecha'), new Date().toISOString());
    const calculationDate = ensureIsoDate(getRawValue(raw, 'calculationDate', 'fechaCalculo'), fecha);
    return {
      id: ensureId(raw),
      producto: String(getRawValue(raw, 'Producto', 'producto') ?? ''),
      litros: parseNumeric(getRawValue(raw, 'Monto', 'monto', 'litros', 'Litros')),
      fecha,
      calculationDate,
      responsable: getRawValue(raw, 'responsable') ? String(getRawValue(raw, 'responsable')) : undefined,
      createdBy: getRawValue(raw, 'createdBy') ? String(getRawValue(raw, 'createdBy')) : undefined,
      createdAt: normalizeDateString(getRawValue(raw, 'createdAt')) ?? fecha,
      updatedBy: getRawValue(raw, 'updatedBy') ? String(getRawValue(raw, 'updatedBy')) : undefined,
      updatedAt: normalizeDateString(getRawValue(raw, 'updatedAt')),
      source: getRawValue(raw, 'accessId') ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: getRawValue(raw, 'accessId') ? String(getRawValue(raw, 'accessId')) : undefined,
    };
  },
  perdidas: (raw) => {
    const fecha = ensureIsoDate(getRawValue(raw, 'FechaPer', 'fecha'), new Date().toISOString());
    const calculationDate = ensureIsoDate(
      getRawValue(raw, 'calculationDate', 'CalculationDate', 'fechaCalculo'),
      fecha,
    );
    return {
      id: ensureId(raw),
      producto: getRawValue(raw, 'PRODUCTO', 'producto') ? String(getRawValue(raw, 'PRODUCTO', 'producto')) : undefined,
      grupo: getRawValue(raw, 'GRUPO', 'grupo') ? String(getRawValue(raw, 'GRUPO', 'grupo')) : undefined,
      horma: getRawValue(raw, 'HORMA', 'horma') !== undefined ? parseNumeric(getRawValue(raw, 'HORMA', 'horma')) : undefined,
      cantidad: parseNumeric(getRawValue(raw, 'CANTIKG', 'cantidad', 'Cantidad')),
      unidad: getRawValue(raw, 'unidad', 'Unidad') ? String(getRawValue(raw, 'unidad', 'Unidad')) : undefined,
      fecha,
      calculationDate,
      responsable: getRawValue(raw, 'responsable') ? String(getRawValue(raw, 'responsable')) : undefined,
      createdBy: getRawValue(raw, 'createdBy') ? String(getRawValue(raw, 'createdBy')) : undefined,
      createdAt: normalizeDateString(getRawValue(raw, 'createdAt')) ?? fecha,
      updatedBy: getRawValue(raw, 'updatedBy') ? String(getRawValue(raw, 'updatedBy')) : undefined,
      updatedAt: normalizeDateString(getRawValue(raw, 'updatedAt')),
      source: getRawValue(raw, 'accessId') ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: getRawValue(raw, 'accessId') ? String(getRawValue(raw, 'accessId')) : undefined,
    };
  },
  sobrantes: (raw) => {
    const fecha = ensureIsoDate(getRawValue(raw, 'FechaSob', 'fecha'), new Date().toISOString());
    const calculationDate = ensureIsoDate(
      getRawValue(raw, 'calculationDate', 'CalculationDate', 'fechaCalculo'),
      fecha,
    );
    return {
      id: ensureId(raw),
      producto: getRawValue(raw, 'PRODUCTO', 'producto') ? String(getRawValue(raw, 'PRODUCTO', 'producto')) : undefined,
      grupo: getRawValue(raw, 'GRUPO', 'grupo') ? String(getRawValue(raw, 'GRUPO', 'grupo')) : undefined,
      horma:
        getRawValue(raw, 'HORMA', 'horma') !== undefined ? parseNumeric(getRawValue(raw, 'HORMA', 'horma')) : undefined,
      cantidad:
        getRawValue(raw, 'CANTIKG', 'cantidad', 'Cantidad') !== undefined
          ? parseNumeric(getRawValue(raw, 'CANTIKG', 'cantidad', 'Cantidad'))
          : undefined,
      unidad: getRawValue(raw, 'unidad', 'Unidad') ? String(getRawValue(raw, 'unidad', 'Unidad')) : undefined,
      fecha,
      calculationDate,
      responsable: getRawValue(raw, 'responsable') ? String(getRawValue(raw, 'responsable')) : undefined,
      createdBy: getRawValue(raw, 'createdBy') ? String(getRawValue(raw, 'createdBy')) : undefined,
      createdAt: normalizeDateString(getRawValue(raw, 'createdAt')) ?? fecha,
      updatedBy: getRawValue(raw, 'updatedBy') ? String(getRawValue(raw, 'updatedBy')) : undefined,
      updatedAt: normalizeDateString(getRawValue(raw, 'updatedAt')),
      source: getRawValue(raw, 'accessId') ? 'import' : 'api',
      syncStatus: 'synced',
      lastImportedAt: calculationDate,
      accessId: getRawValue(raw, 'accessId') ? String(getRawValue(raw, 'accessId')) : undefined,
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
  producciones: (registro) => {
    const centroParsed = Number.parseInt(registro.centro, 10);
    const centro = Number.isNaN(centroParsed) ? registro.centro : centroParsed;
    return {
      producto: registro.producto,
      cantidad: registro.cantidad,
      centro,
      etapa: registro.etapa,
      fecha: registro.fecha,
      calculationDate: registro.calculationDate,
      accessId: registro.accessId,
    };
  },
  litros: (registro) => ({
    fecha: registro.fecha,
    Producto: registro.producto,
    Monto: registro.litros,
    calculationDate: registro.calculationDate,
    accessId: registro.accessId,
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

function extractRecords(payload: unknown): RawRecord[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload as RawRecord[];
  }

  if (typeof payload === 'object') {
    const container = payload as RawRecord;
    const possibleKeys = ['data', 'records', 'items', 'result', 'values', 'rows'];

    for (const key of possibleKeys) {
      const value = container[key];
      if (Array.isArray(value)) {
        return value as RawRecord[];
      }
      if (value && typeof value === 'object') {
        const nested = extractRecords(value);
        if (nested.length > 0) {
          return nested;
        }
      }
    }

    const firstArray = Object.values(container).find((value) => Array.isArray(value));
    if (Array.isArray(firstArray)) {
      return firstArray as RawRecord[];
    }

    return [container];
  }

  return [];
}

function mapResponse(modulo: OperacionModulo, payload: unknown): OperacionRegistro[] {
  const records = extractRecords(payload);
  return records.map((raw) => fromApi[modulo](raw));
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

