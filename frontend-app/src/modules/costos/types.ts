export type CostosSubModulo = 'gastos' | 'depreciaciones' | 'sueldos' | 'prorrateo';

export interface CostosFilters {
  calculationDate: string;
  centro?: string;
  esGastoDelPeriodo?: boolean;
  producto?: string;
  nroEmpleado?: number | null;
  empleadoQuery?: string;
}

export interface BaseCostRecord {
  id: string;
  centro: string;
  calculationDate: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  accessId?: string;
  esGastoDelPeriodo?: boolean;
  source?: 'manual' | 'import';
}

export interface GastoRecord extends BaseCostRecord {
  fecha: string;
  concepto?: string;
  monto: number;
  tipo?: string;
  tablaOrigen?: string;
  detalle?: Record<string, unknown> | null;
}

export interface DepreciacionRecord extends BaseCostRecord {
  fechaCalculo: string;
  maquina: string;
  depreMensual: number;
  vidaUtil?: number;
  valorUso?: number;
  periodo?: string;
}

export interface SueldoRecord extends BaseCostRecord {
  nroEmpleado: number;
  fechaSueldo: string;
  sueldoTotal: number;
  empleadoNombre?: string;
}

export type CostosRecordMap = {
  gastos: GastoRecord;
  depreciaciones: DepreciacionRecord;
  sueldos: SueldoRecord;
  prorrateo: never;
};

export interface BalanceSummaryData {
  totalAmount: number;
  previousTotal?: number;
  difference: number;
  balance: number;
  variationPercentage?: number;
  warning?: string | null;
  currency: string;
}

export interface AllocationItem {
  key: string;
  label: string;
  amount: number;
  percentage: number;
}

export interface TrendPoint {
  period: string;
  amount: number;
  variation: number;
}

export interface ProcessLogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  actor?: string;
}

export interface CostosProcessState {
  status: 'idle' | 'running' | 'success' | 'error';
  processId?: string;
  progress: number;
  startedAt?: string;
  finishedAt?: string;
  result?: {
    balance: number;
    warning?: string | null;
    difference: number;
  };
  error?: string;
  logs: ProcessLogEntry[];
}

export interface CostosProcessPayload {
  calculationDate: string;
  centro?: string;
  motivo: 'consolidacion' | 'reprocesar' | 'recalcular';
  retryProcessId?: string;
}

export interface ProcessHandle {
  processId: string;
  estimatedSeconds?: number;
}

export interface ProcessStatusResponse {
  status: 'running' | 'completed' | 'error';
  progress: number;
  balance: number;
  difference: number;
  warning?: string | null;
  finishedAt?: string;
  logs?: ProcessLogEntry[];
  error?: string;
}

export interface CostosHistoryPoint {
  period: string;
  totalAmount: number;
}

export interface CostosListResponse<TRecord> {
  items: TRecord[];
  totalAmount: number;
  totalCount: number;
  balance: number;
  difference: number;
  warning?: string | null;
  currency: string;
  previousTotal?: number;
  history: CostosHistoryPoint[];
}
