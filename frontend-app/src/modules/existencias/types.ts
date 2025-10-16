export interface ExistenciaRecord {
  id: string;
  producto: string;
  cantidadInicial: number;
  produccion: number;
  ventas: number;
  perdidas: number;
  sobrantes: number;
  cantidadFinal: number;
  accessId?: string;
  calculationDate?: string;
  lastUpdatedAt?: string;
}

export interface ExistenciasBalance {
  debitos: number;
  creditos: number;
  diferencia: number;
}

export interface ExistenciasResumen {
  existencias: ExistenciaRecord[];
  balance: ExistenciasBalance;
  totalProductos: number;
  lastConsolidatedAt?: string;
}

export interface ExistenciaInicialPayload {
  producto: string;
  cantidad: number;
  accessId?: string;
}

export interface ConsolidarExistenciasPayload {
  fecha?: string;
}

export interface AsientoControl {
  id: string;
  debitos: number;
  creditos: number;
  fecha: string;
  accessId?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface CreateAsientoControlPayload {
  debitos: number;
  creditos: number;
  fecha?: string;
  accessId?: string;
}
