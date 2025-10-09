import React, { useEffect, useMemo, useState } from 'react';
import TablePagination from '@/components/TablePagination';
import usePagination from '@/lib/usePagination';
import type { OperacionRegistro, VistaModuloConfig } from '../types';
import { formatDate, formatNumber } from '../utils/format';
import { groupBy } from '../utils/grouping';
import SyncStatusBadge from './SyncStatusBadge';

interface Props {
  config: VistaModuloConfig;
  registros: OperacionRegistro[];
  onSelect: (ids: string[]) => void;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

const OperacionDataGrid: React.FC<Props> = ({ config, registros, onSelect, loading, error, onRetry }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const agrupacion = config.agrupaciones?.[0];

  const datos = useMemo(() => {
    if (!agrupacion) return [{ key: 'all', registros }];
    return groupBy(registros, agrupacion);
  }, [registros, agrupacion]);

  const flattenedRegistros = useMemo(
    () =>
      datos.flatMap((grupo) =>
        grupo.registros.map((registro) => ({
          registro,
          grupoKey: grupo.key,
        })),
      ),
    [datos],
  );

  const pagination = usePagination(flattenedRegistros, {
    initialPageSize: 25,
    pageSizeOptions: [25, 50, 100],
  });

  useEffect(() => {
    setSelected((prev) => {
      if (prev.length === 0) return prev;
      const validIds = new Set(registros.map((registro) => registro.id));
      const next = prev.filter((id) => validIds.has(id));
      if (next.length !== prev.length) {
        onSelect(next);
      }
      return next;
    });
  }, [registros, onSelect]);

  if (loading) {
    return (
      <div className="operacion-datagrid operacion-datagrid--placeholder" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p>Cargando registros de {config.titulo.toLowerCase()}…</p>
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'No se pudo obtener la información.';
    return (
      <div className="operacion-datagrid operacion-datagrid--placeholder" role="alert">
        <p>Ocurrió un problema al consultar los datos.</p>
        <small>{message}</small>
        {onRetry && (
        <button type="button" className="primary" onClick={onRetry}>
          Reintentar consulta
        </button>
        )}
      </div>
    );
  }

  if (registros.length === 0) {
    return (
      <div className="operacion-datagrid operacion-datagrid--placeholder">
        <p>No hay registros que coincidan con los filtros actuales.</p>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setSelected([]);
            onSelect([]);
          }}
        >
          Limpiar selección
        </button>
      </div>
    );
  }

  const renderCell = (registro: OperacionRegistro, key: string) => {
    const value = (registro as Record<string, unknown>)[key];
    if (typeof value === 'number') {
      return formatNumber(value);
    }
    if (key.toLowerCase().includes('fecha')) {
      return formatDate(String(value));
    }
    return value?.toString() ?? '—';
  };

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      onSelect(next);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelected([]);
    onSelect([]);
  };

  return (
    <div className="operacion-datagrid">
      <div className="operacion-toolbar">
        <div>
          <strong>{config.titulo}</strong>
          <p>{config.descripcion}</p>
        </div>
        <button type="button" className="secondary" onClick={handleClearSelection}>
          Limpiar selección
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <span className="sr-only">Seleccionar</span>
              </th>
              {config.columnas.map((columna) => (
                <th key={columna.key as string} title={columna.tooltip} style={{ width: columna.width }}>
                  {columna.label}
                </th>
              ))}
              <th>Trazabilidad</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map(({ registro, grupoKey }) => (
              <tr
                key={`${grupoKey}-${registro.id}`}
                data-group={agrupacion ? `${agrupacion}:${grupoKey}` : undefined}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(registro.id)}
                    onChange={() => toggleSelection(registro.id)}
                    aria-label={`Seleccionar registro ${registro.id}`}
                  />
                </td>
                {config.columnas.map((columna) => (
                  <td key={`${registro.id}-${String(columna.key)}`}>{renderCell(registro, String(columna.key))}</td>
                ))}
                <td>
                  <SyncStatusBadge status={registro.syncStatus}>
                    {registro.source} · {formatDate(registro.createdAt)}
                  </SyncStatusBadge>
                </td>
              </tr>
            ))}
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
        label={`Paginación de ${config.titulo}`}
      />
    </div>
  );
};

export default OperacionDataGrid;
