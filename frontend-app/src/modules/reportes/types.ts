export type ReportCategory = 'financieros' | 'operativos' | 'auditoria';

export type ReportFormat = 'json' | 'csv' | 'xlsx';

export interface ReportFilters {
  periodo?: string;
  producto?: string;
  centro?: string;
  format?: ReportFormat;
}

export type ReportId =
  | 'costos'
  | 'comparativo'
  | 'cif'
  | 'consumos'
  | 'asignaciones'
  | 'mano-obra'
  | 'cuadros'
  | 'descargas';

export interface ReportRoute {
  id: ReportCategory;
  path: string;
  title: string;
  description: string;
  permissions: string[];
}

export interface ReportDescriptor {
  id: ReportId;
  title: string;
  description: string;
  requiredFilters?: Array<keyof ReportFilters>;
}

export interface ReportDownloadLog {
  id: string;
  reportId: ReportId;
  filters: ReportFilters;
  format: ReportFormat;
  status: 'completed' | 'failed' | 'pending';
  rowCount: number;
  createdBy: string;
  requestedAt: string;
  completedAt?: string;
}

export interface BaseTableRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ReportTableDescriptor<Row extends BaseTableRow = BaseTableRow> {
  id: string;
  title: string;
  description: string;
  columns: Array<{
    id: keyof Row;
    label: string;
    align?: 'left' | 'right' | 'center';
    isNumeric?: boolean;
  }>;
  rows: Row[];
  subtotalBy?: keyof Row;
  totalRow?: Partial<Row> & { label?: string };
  emptyMessage?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchEmptyMessage?: string;
  enablePagination?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
}

export interface ReportSummaryCard {
  id: string;
  label: string;
  value: string;
  helpText?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export interface ReportCuadroCard {
  id: string;
  producto: string;
  periodoLabel?: string;
  costoDirecto: string;
  costoUnitarioLt?: string;
  costoUnitarioKg?: string;
  costoIndirecto: string;
  diferencia: string;
  diferenciaPorcentaje?: string;
  tone: 'default' | 'success' | 'warning' | 'danger';
  tendenciaLabel?: string;
}

export interface ComparisonPoint {
  name: string;
  egresos: number;
  insumos: number;
}

export interface ComparisonInsight {
  differenceLabel: string;
  consistent: boolean;
  statusLabel: string;
}

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'downloading' | 'completed' | 'error';
  percentage: number;
  message?: string;
  error?: string;
  downloadUrl?: string;
  rowCount?: number;
}
