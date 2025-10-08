import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import type {
  CostosRecordMap,
  CostosSubModulo,
  DepreciacionRecord,
  GastoRecord,
  SueldoRecord,
} from '../types';
import type { ColumnDefinition, CostosModuleConfig } from '../pages/config';
import '../costos.css';

interface CostosDataTableProps<K extends Exclude<CostosSubModulo, 'prorrateo'>> {
  config: CostosModuleConfig;
  records: CostosRecordMap[K][];
  currency: string;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onSelect: (record: CostosRecordMap[K] | null) => void;
  selectedId: string | null;
}

function getCellValue(
  record: GastoRecord | DepreciacionRecord | SueldoRecord,
  column: ColumnDefinition,
  currency: string,
): React.ReactNode {
  const value = (record as Record<string, unknown>)[column.key];
  if (column.render) {
    return column.render(value, record as Record<string, unknown>);
  }
  if (typeof value === 'number') {
    if (column.align === 'right') {
      return formatCurrency(value, { currency });
    }
    return value.toLocaleString('es-MX', { minimumFractionDigits: 2 });
  }
  if (typeof value === 'boolean') {
    return value ? <span className="costos-table-badge">Sí</span> : 'No';
  }
  if (typeof value === 'string') {
    if (column.key.toLowerCase().includes('fecha')) {
      return new Date(value).toLocaleDateString('es-MX');
    }
    return value;
  }
  if (!value) {
    return '—';
  }
  return JSON.stringify(value);
}

const CostosDataTable = <K extends Exclude<CostosSubModulo, 'prorrateo'>>({
  config,
  records,
  currency,
  loading,
  error,
  onRetry,
  onSelect,
  selectedId,
}: CostosDataTableProps<K>) => {
  if (loading) {
    return <div className="costos-empty-state">Cargando registros de costos…</div>;
  }

  if (error) {
    return (
      <div className="costos-empty-state" role="alert">
        <p>No se pudieron cargar los registros. Intenta nuevamente.</p>
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return <div className="costos-empty-state">{config.emptyState}</div>;
  }

  return (
    <div className="costos-card" role="region" aria-live="polite">
      <div className="costos-toolbar">
        <div>
          <h2>{config.title}</h2>
          <p className="costos-metadata">{config.description}</p>
        </div>
      </div>
      <div className="costos-actions" role="group" aria-label="Acciones rápidas">
        {config.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={action.intent === 'primary' ? 'primary' : undefined}
          >
            {action.label}
          </button>
        ))}
      </div>
      <table className="costos-table">
        <thead>
          <tr>
            {config.columns.map((column) => (
              <th key={column.key} style={{ width: column.width }} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              data-selected={record.id === selectedId}
              onClick={() => onSelect(record)}
            >
              {config.columns.map((column) => (
                <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                  {getCellValue(record, column, currency)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CostosDataTable;
