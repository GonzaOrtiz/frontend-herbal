import React from 'react';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  label?: string;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  totalPages,
  from,
  to,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  label = 'Paginación de tabla',
}) => {
  const handlePrevious = () => {
    onPageChange(Math.max(1, page - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(totalPages, page + 1));
  };

  return (
    <div className="table-pagination" role="navigation" aria-label={label}>
      <span className="table-pagination__summary" aria-live="polite">
        Mostrando {from.toLocaleString()}-{to.toLocaleString()} de {totalItems.toLocaleString()}
      </span>
      <div className="table-pagination__actions">
        <label className="table-pagination__page-size">
          Mostrar
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Seleccionar cantidad de registros por página"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          registros
        </label>
        <div className="table-pagination__buttons">
          <button type="button" className="secondary small" onClick={handlePrevious} disabled={page <= 1}>
            Anterior
          </button>
          <span className="table-pagination__page-indicator">
            Página {page} de {totalPages}
          </span>
          <button type="button" className="secondary small" onClick={handleNext} disabled={page >= totalPages}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
