import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import TablePagination from '@/components/TablePagination';
import usePagination from '@/lib/usePagination';
import type {
  BaseCostRecord,
  CostosRecordMap,
  CostosSubModulo,
  DepreciacionRecord,
  GastoRecord,
  SueldoRecord,
} from '../types';
import type { ColumnDefinition, CostosModuleConfig } from '../pages/config';
import '../../operacion/operacion.css';
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
  onAction?: (actionId: string) => void;
  rowActions?: {
    header: string;
    width?: string;
    render: (record: CostosRecordMap[K]) => React.ReactNode;
  };
}

function formatDate(value: string | undefined | null): string {
  if (!value) {
    return '—';
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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
    return value.toLocaleString('es-AR', { minimumFractionDigits: 2 });
  }
  if (typeof value === 'boolean') {
    return value ? <span className="costos-table-badge">Sí</span> : 'No';
  }
  if (typeof value === 'string') {
    if (column.key.toLowerCase().includes('fecha')) {
      return formatDate(value);
    }
    return value;
  }
  if (!value) {
    return '—';
  }
  return JSON.stringify(value);
}

function buildTraceLabel(record: BaseCostRecord): string {
  const source = record.source === 'import' ? 'import' : 'manual';
  const date = formatDate(record.createdAt ?? record.calculationDate);
  const actor = record.createdBy ? ` · ${record.createdBy}` : '';
  return `${source} · ${date}${actor}`;
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
  onAction,
  rowActions,
}: CostosDataTableProps<K>) => {
  const pagination = usePagination(records, {
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  });

  const pageRecords = pagination.items;

  if (loading) {
    return (
      <div className="operacion-datagrid operacion-datagrid--placeholder" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p>Cargando registros de {config.title.toLowerCase()}…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="operacion-datagrid operacion-datagrid--placeholder" role="alert">
        <p>Ocurrió un problema al consultar los datos.</p>
        <small>No se pudieron cargar los registros. Intenta nuevamente.</small>
        <button type="button" className="primary" onClick={onRetry}>
          Reintentar consulta
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="operacion-datagrid operacion-datagrid--placeholder">
        <p>{config.emptyState}</p>
        <button type="button" className="secondary" onClick={() => onSelect(null)}>
          Limpiar selección
        </button>
      </div>
    );
  }

  return (
    <section className="operacion-datagrid costos-datagrid" aria-label={`Listado de ${config.title.toLowerCase()}`}>
      <header className="operacion-datagrid__header">
        <div className="operacion-datagrid__header-text">
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <div className="costos-datagrid__header-actions">
          <button type="button" className="secondary" onClick={() => onSelect(null)}>
            Limpiar selección
          </button>
        </div>
      </header>

      {config.actions.length > 0 && (
        <div className="costos-datagrid__actions" role="group" aria-label="Acciones rápidas">
          {config.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={
                action.intent === 'primary' ? 'primary' : action.intent === 'secondary' ? 'secondary' : 'ghost'
              }
              disabled={action.disabled}
              aria-disabled={action.disabled ? 'true' : undefined}
              title={action.disabled ? action.description ?? 'Acción disponible próximamente.' : undefined}
              onClick={() => {
                if (action.disabled) {
                  return;
                }
                onAction?.(action.id);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="operacion-datagrid__table-container">
        <div className="operacion-datagrid__scroll">
          <table className="operacion-datagrid__table">
            <thead>
              <tr>
                <th className="operacion-datagrid__selection">
                  <span className="sr-only">Seleccionar</span>
                </th>
                {config.columns.map((column) => (
                  <th key={column.key} style={{ width: column.width }} scope="col">
                    {column.label}
                  </th>
                ))}
                {rowActions && (
                  <th scope="col" style={{ width: rowActions.width }}>
                    {rowActions.header}
                  </th>
                )}
                <th scope="col">Trazabilidad</th>
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((record) => {
                const isSelected = record.id === selectedId;
                return (
                  <tr key={record.id} data-selected={isSelected ? 'true' : 'false'}>
                    <td className="operacion-datagrid__cell operacion-datagrid__cell--selection">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(isSelected ? null : record)}
                        aria-label={`Seleccionar registro ${record.id}`}
                      />
                    </td>
                    {config.columns.map((column) => (
                      <td key={`${record.id}-${column.key}`} className="operacion-datagrid__cell" style={{ textAlign: column.align ?? 'left' }}>
                        {getCellValue(record, column, currency)}
                      </td>
                    ))}
                    {rowActions && (
                      <td
                        className="operacion-datagrid__cell operacion-datagrid__cell--nowrap costos-datagrid__actions-cell"
                        style={{ width: rowActions.width }}
                      >
                        {rowActions.render(record)}
                      </td>
                    )}
                    <td className="operacion-datagrid__cell operacion-datagrid__cell--nowrap">
                      <span className="costos-datagrid__trace operacion-chip sync">{buildTraceLabel(record)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          from={pagination.from}
          to={pagination.to}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          label={`Paginación de ${config.title}`}
        />
      </div>
    </section>
  );
};

export default CostosDataTable;
