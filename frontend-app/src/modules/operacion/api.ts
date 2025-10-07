import apiClient from '@/lib/http/apiClient';
import { logHttpError } from '@/lib/observability/logger';
import type {
  AccionMasivaResultado,
  BitacoraImportacion,
  FiltroPersistente,
  ImportacionError,
  ImportStatus,
  OperacionModulo,
  OperacionRegistro,
  ResumenContextual,
} from './types';
import {
  consumoSchema,
  litrosSchema,
  perdidasSchema,
  produccionSchema,
  sobrantesSchema,
} from './schemas';

type RawRecord = Record<string, unknown>;

const resourceMap: Record<OperacionModulo, string> = {
  consumos: 'consumos',
  producciones: 'producciones',
  litros: 'litros-crema',
  perdidas: 'perdidas',
  sobrantes: 'sobrantes',
};

const schemaMap = {
  consumos: consumoSchema,
  producciones: produccionSchema,
  litros: litrosSchema,
  perdidas: perdidasSchema,
  sobrantes: sobrantesSchema,
} as const;

const defaultUnidadPorModulo: Record<OperacionModulo, string> = {
  consumos: 'kg',
  producciones: 'kg',
  litros: 'lt',
  perdidas: 'kg',
  sobrantes: 'kg',
};

function extractRecords(payload: unknown): RawRecord[] {
  if (Array.isArray(payload)) {
    return payload as RawRecord[];
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const candidates = [data.items, data.data, data.results, data.records].find(
      (value): value is RawRecord[] => Array.isArray(value),
    );

    if (candidates) {
      return candidates;
    }
  }

  return [];
}

function normalizeDate(value: unknown) {
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    return value;
  }
  return value;
}

const adaptadores: Record<OperacionModulo, (record: RawRecord) => RawRecord> = {
  consumos: (record) => ({
    id: record._id ?? record.id,
    producto: record.producto ?? record.Producto ?? '',
    insumo: record.insumo ?? record.Insumo ?? record.insumoNombre ?? '',
    cantidad: Number(record.cantidad ?? record.Cantidad ?? 0),
    unidad: record.unidad ?? record.Unidad ?? defaultUnidadPorModulo.consumos,
    tipoProd: record.tipoProd ?? record.tipo ?? record.TipoProd ?? undefined,
    fecha: normalizeDate(record.fecha ?? record.Fecha ?? record.fechaConsumo ?? record.calculationDate ?? new Date()),
    calculationDate: normalizeDate(
      record.calculationDate ?? record.calculo ?? record.CalculationDate ?? record.fecha ?? new Date(),
    ),
    centro: record.centro ?? record.CENTRO ?? record.centroProduccion ?? 'CENTRO-GENERAL',
    lote: record.lote ?? record.Lote ?? record.loteProduccion ?? undefined,
    turno: record.turno ?? record.Turno ?? undefined,
    responsable: record.responsable ?? record.usuario ?? record.createdBy ?? undefined,
    createdBy: record.createdBy ?? record.usuario ?? 'api',
    createdAt: normalizeDate(record.createdAt ?? record.fechaCreacion ?? new Date()),
    updatedBy: record.updatedBy ?? record.usuarioActualiza ?? undefined,
    updatedAt: normalizeDate(record.updatedAt ?? record.fechaActualiza ?? undefined),
    source: (record.source as OperacionRegistro['source']) ?? (record.accessId ? 'import' : 'api'),
    syncStatus: (record.syncStatus as OperacionRegistro['syncStatus']) ?? 'synced',
    lastImportedAt: normalizeDate(record.lastImportedAt ?? record.fechaImportacion ?? undefined),
    changeReason: record.changeReason ?? record.motivo ?? undefined,
  }),
  producciones: (record) => ({
    id: record._id ?? record.id,
    orden: record.orden ?? record.Order ?? record.ordenProduccion ?? '',
    producto: record.producto ?? record.Producto ?? '',
    lote: record.lote ?? record.Lote ?? record.loteProduccion ?? '',
    turno: record.turno ?? record.Turno ?? 'N/D',
    cantidadProducida: Number(record.cantidadProducida ?? record.cantidad ?? record.Cantidad ?? 0),
    unidad: record.unidad ?? record.Unidad ?? defaultUnidadPorModulo.producciones,
    desperdicioPermitido: Number(record.desperdicioPermitido ?? record.desperdicio ?? 0),
    fecha: normalizeDate(record.fecha ?? record.Fecha ?? new Date()),
    calculationDate: normalizeDate(
      record.calculationDate ?? record.CalculationDate ?? record.fecha ?? new Date(),
    ),
    centro: record.centro ?? record.CENTRO ?? record.centroProduccion ?? 'CENTRO-GENERAL',
    responsable: record.responsable ?? record.usuario ?? record.createdBy ?? undefined,
    createdBy: record.createdBy ?? record.usuario ?? 'api',
    createdAt: normalizeDate(record.createdAt ?? record.fechaCreacion ?? new Date()),
    updatedBy: record.updatedBy ?? record.usuarioActualiza ?? undefined,
    updatedAt: normalizeDate(record.updatedAt ?? record.fechaActualiza ?? undefined),
    source: (record.source as OperacionRegistro['source']) ?? (record.accessId ? 'import' : 'api'),
    syncStatus: (record.syncStatus as OperacionRegistro['syncStatus']) ?? 'synced',
    lastImportedAt: normalizeDate(record.lastImportedAt ?? record.fechaImportacion ?? undefined),
    changeReason: record.changeReason ?? record.motivo ?? undefined,
  }),
  litros: (record) => ({
    id: record._id ?? record.id,
    lote: record.lote ?? record.Lote ?? record.loteProduccion ?? 'Lote sin definir',
    turno: record.turno ?? record.Turno ?? 'Turno N/D',
    litros: Number(record.litros ?? record.Monto ?? record.cantidad ?? 0),
    temperatura: Number(record.temperatura ?? record.Temperatura ?? record.temper ?? 0),
    solidosTotales: Number(record.solidosTotales ?? record.Solidos ?? record.solidos ?? 0),
    fecha: normalizeDate(record.fecha ?? record.Fechalitro ?? new Date()),
    calculationDate: normalizeDate(
      record.calculationDate ?? record.fechaCalculo ?? record.fecha ?? new Date(),
    ),
    centro: record.centro ?? record.CENTRO ?? 'CENTRO-GENERAL',
    responsable: record.responsable ?? record.usuario ?? undefined,
    createdBy: record.createdBy ?? record.usuario ?? 'api',
    createdAt: normalizeDate(record.createdAt ?? record.fechaCreacion ?? new Date()),
    updatedBy: record.updatedBy ?? record.usuarioActualiza ?? undefined,
    updatedAt: normalizeDate(record.updatedAt ?? record.fechaActualiza ?? undefined),
    source: (record.source as OperacionRegistro['source']) ?? (record.accessId ? 'import' : 'api'),
    syncStatus: (record.syncStatus as OperacionRegistro['syncStatus']) ?? 'synced',
    lastImportedAt: normalizeDate(record.lastImportedAt ?? record.fechaImportacion ?? undefined),
    changeReason: record.changeReason ?? record.motivo ?? undefined,
  }),
  perdidas: (record) => ({
    id: record._id ?? record.id,
    categoria: (record.categoria as OperacionRegistro['categoria']) ?? 'merma',
    lote: record.lote ?? record.Lote ?? undefined,
    turno: record.turno ?? record.Turno ?? undefined,
    cantidad: Number(record.cantidad ?? record.CANTIKG ?? 0),
    unidad: record.unidad ?? record.Unidad ?? defaultUnidadPorModulo.perdidas,
    justificacion: record.justificacion ?? record.PRODUCTO ?? record.descripcion ?? 'Justificación no proporcionada',
    fecha: normalizeDate(record.fecha ?? record.FechaPer ?? new Date()),
    calculationDate: normalizeDate(
      record.calculationDate ?? record.CalculationDate ?? record.fecha ?? new Date(),
    ),
    centro: record.centro ?? record.CENTRO ?? 'CENTRO-GENERAL',
    responsable: record.responsable ?? record.usuario ?? undefined,
    createdBy: record.createdBy ?? record.usuario ?? 'api',
    createdAt: normalizeDate(record.createdAt ?? record.fechaCreacion ?? new Date()),
    updatedBy: record.updatedBy ?? record.usuarioActualiza ?? undefined,
    updatedAt: normalizeDate(record.updatedAt ?? record.fechaActualiza ?? undefined),
    source: (record.source as OperacionRegistro['source']) ?? (record.accessId ? 'import' : 'api'),
    syncStatus: (record.syncStatus as OperacionRegistro['syncStatus']) ?? 'synced',
    lastImportedAt: normalizeDate(record.lastImportedAt ?? record.fechaImportacion ?? undefined),
    changeReason: record.changeReason ?? record.motivo ?? undefined,
  }),
  sobrantes: (record) => ({
    id: record._id ?? record.id,
    lote: record.lote ?? record.Lote ?? 'Lote sin definir',
    turno: record.turno ?? record.Turno ?? 'Turno N/D',
    cantidad: Number(record.cantidad ?? record.CANTIKG ?? 0),
    unidad: record.unidad ?? record.Unidad ?? defaultUnidadPorModulo.sobrantes,
    destino: record.destino ?? record.Destino ?? record.destinoFinal ?? 'Destino no registrado',
    fecha: normalizeDate(record.fecha ?? record.FechaSob ?? new Date()),
    calculationDate: normalizeDate(
      record.calculationDate ?? record.CalculationDate ?? record.fecha ?? new Date(),
    ),
    centro: record.centro ?? record.CENTRO ?? 'CENTRO-GENERAL',
    responsable: record.responsable ?? record.usuario ?? undefined,
    createdBy: record.createdBy ?? record.usuario ?? 'api',
    createdAt: normalizeDate(record.createdAt ?? record.fechaCreacion ?? new Date()),
    updatedBy: record.updatedBy ?? record.usuarioActualiza ?? undefined,
    updatedAt: normalizeDate(record.updatedAt ?? record.fechaActualiza ?? undefined),
    source: (record.source as OperacionRegistro['source']) ?? (record.accessId ? 'import' : 'api'),
    syncStatus: (record.syncStatus as OperacionRegistro['syncStatus']) ?? 'synced',
    lastImportedAt: normalizeDate(record.lastImportedAt ?? record.fechaImportacion ?? undefined),
    changeReason: record.changeReason ?? record.motivo ?? undefined,
  }),
};

function adaptModuloRegistro(modulo: OperacionModulo, record: RawRecord): RawRecord {
  return adaptadores[modulo](record);
}

function parseRegistros(modulo: OperacionModulo, records: RawRecord[]): OperacionRegistro[] {
  const schema = schemaMap[modulo];
  const adapted = records.map((record) => adaptModuloRegistro(modulo, record));
  const result = schema.parseMany(adapted);
  if (!result.success) {
    throw Object.assign(new Error('VALIDATION_ERROR'), { details: result.errors });
  }
  return result.data;
}

function serializeRegistro(modulo: OperacionModulo, registro: OperacionRegistro): RawRecord {
  switch (modulo) {
    case 'consumos':
      return {
        producto: registro.producto,
        insumo: 'insumo' in registro ? registro.insumo : undefined,
        cantidad: 'cantidad' in registro ? registro.cantidad : undefined,
        unidad: 'unidad' in registro ? registro.unidad : undefined,
        tipoProd: 'tipoProd' in registro ? registro.tipoProd : undefined,
        fecha: registro.fecha,
        calculationDate: registro.calculationDate,
        centro: registro.centro,
        lote: 'lote' in registro ? registro.lote : undefined,
        turno: 'turno' in registro ? registro.turno : undefined,
        responsable: registro.responsable,
        changeReason: registro.changeReason,
      } satisfies RawRecord;
    case 'producciones':
      return {
        orden: 'orden' in registro ? registro.orden : undefined,
        producto: registro.producto,
        lote: 'lote' in registro ? registro.lote : undefined,
        turno: 'turno' in registro ? registro.turno : undefined,
        cantidadProducida: 'cantidadProducida' in registro ? registro.cantidadProducida : undefined,
        unidad: registro.unidad,
        desperdicioPermitido: 'desperdicioPermitido' in registro ? registro.desperdicioPermitido : undefined,
        fecha: registro.fecha,
        calculationDate: registro.calculationDate,
        centro: registro.centro,
        responsable: registro.responsable,
      } satisfies RawRecord;
    case 'litros':
      return {
        lote: 'lote' in registro ? registro.lote : undefined,
        turno: 'turno' in registro ? registro.turno : undefined,
        litros: 'litros' in registro ? registro.litros : undefined,
        temperatura: 'temperatura' in registro ? registro.temperatura : undefined,
        solidosTotales: 'solidosTotales' in registro ? registro.solidosTotales : undefined,
        fecha: registro.fecha,
        calculationDate: registro.calculationDate,
        centro: registro.centro,
        responsable: registro.responsable,
      } satisfies RawRecord;
    case 'perdidas':
      return {
        categoria: 'categoria' in registro ? registro.categoria : undefined,
        lote: 'lote' in registro ? registro.lote : undefined,
        turno: 'turno' in registro ? registro.turno : undefined,
        cantidad: 'cantidad' in registro ? registro.cantidad : undefined,
        unidad: 'unidad' in registro ? registro.unidad : undefined,
        justificacion: 'justificacion' in registro ? registro.justificacion : undefined,
        fecha: registro.fecha,
        calculationDate: registro.calculationDate,
        centro: registro.centro,
        responsable: registro.responsable,
      } satisfies RawRecord;
    case 'sobrantes':
      return {
        lote: 'lote' in registro ? registro.lote : undefined,
        turno: 'turno' in registro ? registro.turno : undefined,
        cantidad: 'cantidad' in registro ? registro.cantidad : undefined,
        unidad: 'unidad' in registro ? registro.unidad : undefined,
        destino: 'destino' in registro ? registro.destino : undefined,
        fecha: registro.fecha,
        calculationDate: registro.calculationDate,
        centro: registro.centro,
        responsable: registro.responsable,
      } satisfies RawRecord;
    default:
      return registro as RawRecord;
  }
}

function buildQuery(modulo: OperacionModulo, filtros: FiltroPersistente): string {
  const params = new URLSearchParams();

  if (filtros.producto) params.set('producto', filtros.producto);
  if (filtros.centro) params.set('centro', filtros.centro);
  if (filtros.actividad) params.set('actividad', filtros.actividad);
  if (filtros.orden) params.set('orden', filtros.orden);
  if (filtros.lote) params.set('lote', filtros.lote);
  if (filtros.turno) params.set('turno', filtros.turno);

  if (filtros.rango) {
    params.set('desde', filtros.rango.desde);
    params.set('hasta', filtros.rango.hasta);
  } else if (filtros.calculationDate) {
    params.set('calculationDate', filtros.calculationDate);
  }

  if (modulo === 'litros' && !params.has('calculationDate') && filtros.calculationDate) {
    params.set('fecha', filtros.calculationDate);
  }

  return params.toString();
}

export async function fetchOperacionRegistros(
  modulo: OperacionModulo,
  filtros: FiltroPersistente,
): Promise<OperacionRegistro[]> {
  const resource = resourceMap[modulo];
  const query = buildQuery(modulo, filtros);
  const endpoint = query ? `/api/${resource}?${query}` : `/api/${resource}`;

  const payload = await apiClient.get<unknown>(endpoint);
  const registros = parseRegistros(modulo, extractRecords(payload));
  return registros;
}

export async function createOperacionRegistro(
  modulo: OperacionModulo,
  registro: OperacionRegistro,
  usuario?: string,
): Promise<OperacionRegistro> {
  const resource = resourceMap[modulo];
  const payload = serializeRegistro(modulo, registro);
  const headers = usuario ? { 'x-user': usuario } : undefined;
  const response = await apiClient.post<unknown, RawRecord>(`/api/${resource}` as string, payload, { headers });
  const raw = extractRecords(response ?? []);
  if (raw.length > 0) {
    const registros = parseRegistros(modulo, raw);
    return registros[0] ?? registro;
  }
  if (response && typeof response === 'object') {
    const registros = parseRegistros(modulo, [response as RawRecord]);
    return registros[0] ?? registro;
  }
  return registro;
}

export async function updateOperacionRegistro(
  modulo: OperacionModulo,
  registro: OperacionRegistro,
  usuario?: string,
): Promise<OperacionRegistro> {
  const resource = resourceMap[modulo];
  const payload = serializeRegistro(modulo, registro);
  const headers = usuario ? { 'x-user': usuario } : undefined;
  const response = await apiClient.put<unknown, RawRecord>(`/api/${resource}/${registro.id}`, payload, {
    headers,
  });
  const raw = extractRecords(response ?? []);
  if (raw.length > 0) {
    const registros = parseRegistros(modulo, raw);
    return registros[0] ?? registro;
  }
  if (response && typeof response === 'object') {
    const registros = parseRegistros(modulo, [response as RawRecord]);
    return registros[0] ?? registro;
  }
  return registro;
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

interface BulkImportPayload {
  rows: RawRecord[];
  usuario: string;
  archivo?: string;
}

interface BulkImportResponse {
  registros?: RawRecord[];
  bitacora?: Partial<BitacoraImportacion>;
  errores?: ImportacionError[];
  status?: ImportStatus;
  resumen?: BitacoraImportacion['resumen'];
  resumeToken?: string;
}

export async function bulkImportOperacion(
  modulo: OperacionModulo,
  payload: BulkImportPayload,
): Promise<{ registros: OperacionRegistro[]; bitacora: BitacoraImportacion }> {
  const resource = resourceMap[modulo];
  const response = await apiClient.post<BulkImportResponse, BulkImportPayload>(
    `/api/${resource}/bulk-import`,
    payload,
  );

  const registros = response?.registros ? parseRegistros(modulo, response.registros) : [];

  const resumen = response?.bitacora?.resumen ??
    response?.resumen ?? {
      total: payload.rows.length,
      exitosos: registros.length,
      fallidos: payload.rows.length - registros.length,
      omitidos: 0,
    };

  const bitacora: BitacoraImportacion = {
    modulo,
    status: response?.bitacora?.status ?? response?.status ?? (registros.length ? 'completed' : 'failed'),
    resumen,
    errores: response?.bitacora?.errores ?? response?.errores ?? [],
    archivoOriginal: response?.bitacora?.archivoOriginal ?? payload.archivo,
    resumeToken: response?.bitacora?.resumeToken ?? response?.resumeToken ?? `${modulo}-${Date.now()}`,
  };

  return { registros, bitacora };
}

interface AccionMasivaResponse {
  registrosProcesados?: number;
  impactoExistencias?: number;
  impactoCostos?: number;
  mensaje?: string;
}

export async function runAccionMasivaRemota(
  modulo: OperacionModulo,
  accion: 'aprobar' | 'recalcular' | 'cerrar',
  ids: string[],
): Promise<AccionMasivaResultado> {
  const resource = resourceMap[modulo];
  const payload = await apiClient.post<AccionMasivaResponse, { accion: string; ids: string[] }>(
    `/api/${resource}/acciones-masivas`,
    { accion, ids },
  );

  return {
    accion,
    registrosProcesados: payload?.registrosProcesados ?? ids.length,
    impactoExistencias: payload?.impactoExistencias ?? 0,
    impactoCostos: payload?.impactoCostos ?? 0,
    mensaje: payload?.mensaje ?? `Acción ${accion} enviada a ${ids.length} registros`,
  };
}

interface CierreResponse {
  bloqueado?: boolean;
  closeReason?: string;
  expectedUnlockAt?: string;
  responsable?: string;
}

export async function fetchCierreOperacion(modulo: OperacionModulo): Promise<Partial<ResumenContextual> | null> {
  const resource = resourceMap[modulo];
  try {
    const response = await apiClient.get<CierreResponse>(`/api/${resource}/cierre-estado`);
    if (!response) {
      return null;
    }
    return {
      bloqueado: Boolean(response.bloqueado),
      closeReason: response.closeReason,
      expectedUnlockAt: response.expectedUnlockAt,
      responsable: response.responsable,
    };
  } catch (error) {
    logHttpError({ url: `/api/${resource}/cierre-estado`, method: 'GET', status: undefined, payload: { error } });
    return null;
  }
}
