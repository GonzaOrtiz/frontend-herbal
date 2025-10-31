export interface CreateCifTotalPayload {
  producto: string;
  periodo: string;
  monto: number;
  base: number;
  accessId?: string;
}

export interface CreateCifUnitarioPayload {
  producto: string;
  periodo: string;
  cantidad: number;
  accessId?: string;
}

export interface CifTotalRecord {
  id?: string;
  producto: string;
  periodo: string;
  monto: number;
  base: number;
  accessId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CifUnitarioRecord {
  id?: string;
  producto: string;
  periodo: string;
  cantidad: number;
  costoUnitario: number;
  accessId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface RecalculateCifPayload {
  periodo: string;
}

export interface CifRecalculationResult {
  producto: string;
  periodo: string;
  monto: number;
  base: number;
  costoUnitario: number;
  cantidad?: number;
  accessId?: string | null;
  id?: string;
  [key: string]: unknown;
}
