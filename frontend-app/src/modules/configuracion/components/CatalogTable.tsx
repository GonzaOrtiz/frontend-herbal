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
}

const CatalogTable = <TEntity,>({ rows, columns, loading, emptyMessage }: CatalogTableProps<TEntity>) => {
  if (loading) {
    return <div className="table-empty">Cargando catálogo…</div>;
  }

  if (!rows.length) {
    return <div className="table-empty">{emptyMessage ?? 'No hay registros disponibles.'}</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="config-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} style={{ width: column.width }}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String((row as any).id ?? index)}>
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
  );
};

export type { CatalogTableColumn };
export default CatalogTable;
