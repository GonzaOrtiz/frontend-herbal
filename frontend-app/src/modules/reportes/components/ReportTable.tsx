import React from 'react';
import type { ReportTableDescriptor } from '../types';

interface ReportTableProps<Row extends Record<string, unknown>> {
  descriptor: ReportTableDescriptor<Row>;
}

function isNumericColumn(value: unknown): value is number {
  return typeof value === 'number' || (typeof value === 'string' && /^-?\d+[\d,.]*$/.test(value));
}

function formatCellValue(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  return String(value);
}

const ReportTable = <Row extends Record<string, unknown>>({ descriptor }: ReportTableProps<Row>) => {
  const hasRows = descriptor.rows && descriptor.rows.length > 0;
  const titleId = `${descriptor.id}-title`;
  const descriptionId = descriptor.description ? `${descriptor.id}-description` : undefined;
  const searchId = `${descriptor.id}-search`;

  const enableSearch = Boolean(descriptor.enableSearch);
  const enablePagination = Boolean(descriptor.enablePagination);

  const pageSizeOptions = React.useMemo(() => {
    if (!enablePagination) {
      return [];
    }

    const options = new Set<number>();
    (descriptor.pageSizeOptions ?? []).forEach((option) => {
      if (typeof option === 'number' && Number.isFinite(option) && option > 0) {
        options.add(Math.floor(option));
      }
    });

    if (descriptor.defaultPageSize && Number.isFinite(descriptor.defaultPageSize) && descriptor.defaultPageSize > 0) {
      options.add(Math.floor(descriptor.defaultPageSize));
    }

    if (options.size === 0) {
      [10, 25, 50].forEach((option) => options.add(option));
    }

    return Array.from(options).sort((a, b) => a - b);
  }, [descriptor.defaultPageSize, descriptor.pageSizeOptions, enablePagination]);

  const defaultPageSize = React.useMemo(() => {
    if (!enablePagination) {
      return descriptor.rows.length;
    }

    const fallback = descriptor.defaultPageSize ?? pageSizeOptions[0] ?? 10;
    return pageSizeOptions.includes(fallback) ? fallback : pageSizeOptions[0] ?? fallback;
  }, [descriptor.defaultPageSize, descriptor.rows.length, enablePagination, pageSizeOptions]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setSearchTerm('');
    setPage(1);
  }, [descriptor.id]);

  React.useEffect(() => {
    setPageSize(defaultPageSize);
    setPage(1);
  }, [defaultPageSize]);

  const filteredRows = React.useMemo(() => {
    if (!enableSearch) {
      return descriptor.rows;
    }

    const term = searchTerm.trim().toLowerCase();
    if (term.length === 0) {
      return descriptor.rows;
    }

    return descriptor.rows.filter((row) =>
      descriptor.columns.some((column) => {
        const value = row[column.id];
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(term);
      }),
    );
  }, [descriptor.columns, descriptor.rows, enableSearch, searchTerm]);

  const totalItems = filteredRows.length;
  const totalPages = enablePagination ? Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1))) : 1;
  const currentPage = enablePagination ? Math.min(page, totalPages) : 1;
  const startIndex = enablePagination ? (currentPage - 1) * pageSize : 0;
  const endIndex = enablePagination ? Math.min(startIndex + pageSize, totalItems) : totalItems;
  const visibleRows = enablePagination ? filteredRows.slice(startIndex, endIndex) : filteredRows;

  React.useEffect(() => {
    if (!enablePagination) {
      return;
    }

    setPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [enablePagination, totalPages]);

  if (!hasRows) {
    return (
      <section
        className="reportes-table-card reportes-table-card--empty"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="reportes-table-card__header">
          <h4 id={titleId}>{descriptor.title}</h4>
          {descriptor.description && <p id={descriptionId}>{descriptor.description}</p>}
        </header>
        <div className="reportes-table-card__body">
          <div className="reportes-empty-state" role="status" aria-live="polite">
            <h4>Sin datos</h4>
            <p>{descriptor.emptyMessage ?? 'No se encontraron resultados para los filtros seleccionados.'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reportes-table-card" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <header className="reportes-table-card__header">
        <h4 id={titleId}>{descriptor.title}</h4>
        {descriptor.description && <p id={descriptionId}>{descriptor.description}</p>}
      </header>
      <div className="reportes-table-card__body">
        {enableSearch && (
          <div className="reportes-table-controls">
            <div className="reportes-table-controls__search">
              <label className="sr-only" htmlFor={searchId}>
                Buscar en {descriptor.title}
              </label>
              <input
                id={searchId}
                type="search"
                className="reportes-table-search"
                placeholder={descriptor.searchPlaceholder ?? 'Buscar…'}
                value={searchTerm}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(event.target.value);
                  if (enablePagination) {
                    setPage(1);
                  }
                }}
              />
            </div>
          </div>
        )}
        <div className="reportes-table-wrapper">
          <table
            className="reportes-table"
            role="grid"
            aria-label={descriptor.title}
            aria-describedby={descriptionId}
          >
            {descriptor.description && <caption className="sr-only">{descriptor.description}</caption>}
            <thead>
              <tr>
                {descriptor.columns.map((column) => {
                  const align = column.align ?? (column.isNumeric ? 'right' : 'left');
                  return (
                    <th key={String(column.id)} scope="col" style={{ textAlign: align }}>
                      {column.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={descriptor.columns.length} className="reportes-table__cell reportes-table__cell--empty">
                    {descriptor.searchEmptyMessage ?? 'No se encontraron resultados que coincidan con la búsqueda.'}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, index) => (
                  <tr key={index}>
                    {descriptor.columns.map((column) => {
                      const value = row[column.id];
                      const isNumeric = column.isNumeric ?? isNumericColumn(value);
                      const align = column.align ?? (isNumeric ? 'right' : 'left');

                      return (
                        <td
                          key={String(column.id)}
                          className="reportes-table__cell"
                          data-column={column.label}
                          style={{ textAlign: align }}
                        >
                          {formatCellValue(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
            {descriptor.totalRow && (
              <tfoot>
                <tr>
                  {descriptor.columns.map((column, columnIndex) => {
                    const value = descriptor.totalRow?.[column.id];
                    const align = column.align ?? (column.isNumeric ? 'right' : 'left');
                    const displayValue =
                      columnIndex === 0 && descriptor.totalRow?.label
                        ? descriptor.totalRow.label
                        : formatCellValue(value);

                    return (
                      <td
                        key={String(column.id)}
                        className="reportes-table__cell"
                        style={{ textAlign: align }}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {enablePagination && (
          <div className="reportes-table-pagination" role="group" aria-label="Paginación de tabla">
            <div className="reportes-table-pagination__info">
              {totalItems === 0
                ? 'Sin resultados para mostrar'
                : `Mostrando ${(startIndex + 1).toLocaleString()}-${endIndex.toLocaleString()} de ${totalItems.toLocaleString()}`}
            </div>
            <div className="reportes-table-pagination__actions">
              <label className="reportes-table-pagination__page-size">
                <span>Filas por página</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (!Number.isNaN(nextValue)) {
                      setPageSize(nextValue);
                      setPage(1);
                    }
                  }}
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="reportes-table-pagination__buttons">
                <button
                  type="button"
                  className="reportes-table-pagination__button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                  aria-label="Página anterior"
                >
                  Anterior
                </button>
                <span className="reportes-table-pagination__page-indicator">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  className="reportes-table-pagination__button"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  aria-label="Página siguiente"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReportTable;
