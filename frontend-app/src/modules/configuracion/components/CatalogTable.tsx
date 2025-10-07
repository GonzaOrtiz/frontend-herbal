import React from 'react';
import '../configuracion.css';

interface CatalogTableColumn<TEntity> {
  key: keyof TEntity | string;
  label: string;
  width?: string | number;
  render?: (entity: TEntity) => React.ReactNode;
}

interface CatalogTableProps<TEntity> {
  rows: TEntity[];
  columns: CatalogTableColumn<TEntity>[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

const CatalogTable = <TEntity,>({
  rows,
  columns,
  loading,
  emptyMessage,
  pageSize = 10,
}: CatalogTableProps<TEntity>) => {
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(rows.length / pageSize)),
    [rows.length, pageSize],
  );

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageRows = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return rows.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, rows]);

  const from = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, rows.length);

  if (loading) {
    return <div className="table-empty">Cargando catálogo…</div>;
  }

  if (!rows.length) {
    return <div className="table-empty">{emptyMessage ?? 'No hay registros disponibles.'}</div>;
  }

  return (
    <div className="config-table__container">
      <div className="config-table__scroll" style={{ overflowX: 'auto' }}>
        <table className="config-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} style={{ width: column.width }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, index) => (
              <tr key={String((row as any).id ?? `${page}-${index}`)}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render ? column.render(row) : (row as Record<string, unknown>)[column.key as string]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="config-table__pagination" aria-label="Paginación de tabla">
        <span className="config-table__pagination-info">
          Mostrando {from.toLocaleString()}-{to.toLocaleString()} de {rows.length.toLocaleString()}
        </span>
        <div className="config-table__pagination-actions">
          <button
            type="button"
            className="config-pagination-button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span className="config-table__pagination-page">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className="config-pagination-button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export type { CatalogTableColumn };
export default CatalogTable;
