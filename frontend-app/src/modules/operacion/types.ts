export type OperacionModulo = 'consumos' | 'producciones' | 'litros' | 'perdidas' | 'sobrantes';

export type ImportStatus = 'idle' | 'processing' | 'waiting' | 'completed' | 'failed';

export type SyncStatus = 'synced' | 'processing' | 'error' | 'stale';

export interface TrazabilidadMetadata {
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  source?: 'manual' | 'import' | 'api';
  syncStatus?: SyncStatus;
  lastImportedAt?: string;
  changeReason?: string;
  accessId?: string;
}

export interface BaseOperacionRegistro extends TrazabilidadMetadata {
  id: string;
  centro?: string;
  fecha: string;
  calculationDate?: string;
  responsable?: string;
}

export interface ConsumoRegistro extends BaseOperacionRegistro {
  producto: string;
  insumo: string;
  cantidad: number;
  unidad: string;
  tipoProd?: string;
}

export interface ProduccionRegistro extends BaseOperacionRegistro {
  producto: string;
  cantidad: number;
  centro: string;
  etapa: string;
}

export interface LitrosCremaRegistro extends BaseOperacionRegistro {
  producto: string;
  litros: number;
}

export interface PerdidaRegistro extends BaseOperacionRegistro {
  grupo?: string;
  producto?: string;
  horma?: number;
  cantidad: number;
  unidad?: string;
}

export interface SobranteRegistro extends BaseOperacionRegistro {
  grupo?: string;
  producto?: string;
  horma?: number;
  cantidad?: number;
  unidad?: string;
}

export type OperacionRegistro =
  | ConsumoRegistro
  | ProduccionRegistro
  | LitrosCremaRegistro
  | PerdidaRegistro
  | SobranteRegistro;

export interface FiltroPersistente {
  calculationDate: string;
  producto?: string;
  centro?: string;
  actividad?: string;
  orden?: string;
  lote?: string;
  turno?: string;
  rango?: {
    desde: string;
    hasta: string;
  };
}

export type RolOperacion = 'coordinador' | 'analista' | 'auditor';

export interface VistaGuardada {
  id: string;
  nombre: string;
  modulo: OperacionModulo;
  filtros: FiltroPersistente;
  owner: string;
  rolesVisibles: RolOperacion[];
  createdAt: string;
}

export interface ResumenContextual {
  centro: string;
  calculationDate: string;
  responsable?: string;
  bloqueado?: boolean;
  closeReason?: string;
  expectedUnlockAt?: string;
}

export interface ImportacionError {
  row: number;
  field: string;
  message: string;
  type: 'validation' | 'business' | 'conflict';
  usuario: string;
  timestamp: string;
}

export interface BitacoraImportacion {
  modulo: OperacionModulo;
  status: ImportStatus;
  resumen: {
    total: number;
    exitosos: number;
    fallidos: number;
    omitidos: number;
  };
  errores: ImportacionError[];
  archivoOriginal?: string;
  resumeToken?: string;
}

export interface AccionMasivaResultado {
  accion: 'aprobar' | 'recalcular' | 'cerrar';
  registrosProcesados: number;
  impactoExistencias: number;
  impactoCostos: number;
  mensaje: string;
}

export interface VistaModuloConfig {
  modulo: OperacionModulo;
  titulo: string;
  descripcion: string;
  filtrosDisponibles: Array<keyof FiltroPersistente>;
  agrupaciones?: Array<'lote' | 'turno'>;
  columnas: Array<{
    key: keyof OperacionRegistro | string;
    label: string;
    numeric?: boolean;
    width?: number;
    tooltip?: string;
  }>;
}
