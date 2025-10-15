import React from 'react';
import type { ReportCuadroCard } from '../types';

interface CuadrosComparativosProps {
  cards: ReportCuadroCard[];
}

const toneRowClassMap: Record<ReportCuadroCard['tone'], string> = {
  default: '',
  success: 'reportes-cuadros-row--success',
  warning: 'reportes-cuadros-row--warning',
  danger: 'reportes-cuadros-row--danger',
};

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const CuadrosComparativos: React.FC<CuadrosComparativosProps> = ({ cards }) => {
  const tableTitleId = 'cuadros-comparativos-table-title';
  const descriptionId = 'cuadros-comparativos-table-description';
  const hasPeriodoColumn = cards.some((card) => Boolean(card.periodoLabel));
  const hasTendenciaColumn = cards.some((card) => Boolean(card.tendenciaLabel));

  const [searchTerm, setSearchTerm] = React.useState('');
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = React.useState(1);

  const filteredCards = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return cards;
    }

    return cards.filter((card) => {
      const producto = card.producto.toLowerCase();
      const periodo = card.periodoLabel?.toLowerCase() ?? '';
      const tendencia = card.tendenciaLabel?.toLowerCase() ?? '';

      return producto.includes(term) || periodo.includes(term) || tendencia.includes(term);
    });
  }, [cards, searchTerm]);

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize, cards]);

  const totalPages = React.useMemo(() => {
    if (filteredCards.length === 0) {
      return 1;
    }

    return Math.max(1, Math.ceil(filteredCards.length / pageSize));
  }, [filteredCards.length, pageSize]);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedCards = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredCards.slice(startIndex, startIndex + pageSize);
  }, [filteredCards, page, pageSize]);

  const normalizedPageSizeOptions = React.useMemo(() => {
    const uniqueOptions = new Set([...PAGE_SIZE_OPTIONS, pageSize]);
    return Array.from(uniqueOptions).sort((a, b) => a - b);
  }, [pageSize]);

  const hasResults = filteredCards.length > 0;
  const from = hasResults ? (page - 1) * pageSize + 1 : 0;
  const to = hasResults ? Math.min(page * pageSize, filteredCards.length) : 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
  };

  const handlePreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const sectionClassName = `reportes-table-card${hasResults ? '' : ' reportes-table-card--empty'}`;
  const displayPage = hasResults ? page : 0;
  const displayTotalPages = hasResults ? totalPages : 0;

  return (
    <section
      className={sectionClassName}
      aria-labelledby={tableTitleId}
      aria-describedby={descriptionId}
    >
      <header className="reportes-table-card__header">
        <h4 id={tableTitleId}>Detalle por producto</h4>
        <p id={descriptionId}>Comparativo de costos directos e indirectos.</p>
      </header>
      <div className="reportes-table-card__body">
        <div className="reportes-cuadros-controls">
          <div className="reportes-cuadros-filter-bar" role="search">
            <div className="reportes-cuadros-filter-bar__field">
              <label htmlFor="cuadros-comparativos-search" className="reportes-cuadros-filter-bar__label">
                Búsqueda
              </label>
              <input
                id="cuadros-comparativos-search"
                type="search"
                className="reportes-cuadros-filter-bar__input"
                placeholder="Buscar por producto"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {hasResults ? (
            <>
              <div className="reportes-table-wrapper">
                <table
                  className="reportes-table"
                  role="grid"
                  aria-label="Detalle de cuadros comparativos por producto"
                  aria-describedby={descriptionId}
                >
                  <thead>
                    <tr>
                      <th scope="col" style={{ textAlign: 'left' }}>
                        Producto
                      </th>
                      {hasPeriodoColumn && (
                        <th scope="col" style={{ textAlign: 'left' }}>
                          Periodo
                        </th>
                      )}
                      <th scope="col" style={{ textAlign: 'right' }}>
                        Costo directo
                      </th>
                      <th scope="col" style={{ textAlign: 'right' }}>
                        Costo indirecto
                      </th>
                      <th scope="col" style={{ textAlign: 'right' }}>
                        Diferencia
                      </th>
                      {hasTendenciaColumn && (
                        <th scope="col" style={{ textAlign: 'left' }}>
                          Tendencia
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCards.map((card) => (
                      <tr key={card.id} className={toneRowClassMap[card.tone]}>
                        <th scope="row" className="reportes-table__cell reportes-table__cell--row-header">
                          {card.producto}
                        </th>
                        {hasPeriodoColumn && (
                          <td className="reportes-table__cell" data-column="Periodo">
                            {card.periodoLabel ?? '—'}
                          </td>
                        )}
                        <td
                          className="reportes-table__cell"
                          data-column="Costo directo"
                          style={{ textAlign: 'right' }}
                        >
                          {card.costoDirecto}
                        </td>
                        <td
                          className="reportes-table__cell"
                          data-column="Costo indirecto"
                          style={{ textAlign: 'right' }}
                        >
                          {card.costoIndirecto}
                        </td>
                        <td
                          className="reportes-table__cell"
                          data-column="Diferencia"
                          style={{ textAlign: 'right' }}
                        >
                          <div className="reportes-cuadros-difference">
                            <span className="reportes-cuadros-difference__value">{card.diferencia}</span>
                            {card.diferenciaPorcentaje && (
                              <span className="reportes-cuadros-difference__percentage">
                                {card.diferenciaPorcentaje}
                              </span>
                            )}
                          </div>
                        </td>
                        {hasTendenciaColumn && (
                          <td className="reportes-table__cell" data-column="Tendencia">
                            {card.tendenciaLabel ?? '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="reportes-cuadros-pagination" aria-label="Paginación de detalle por producto">
                <span className="reportes-cuadros-pagination__info">
                  Mostrando {from.toLocaleString()}-{to.toLocaleString()} de {filteredCards.length.toLocaleString()}
                </span>
                <div className="reportes-cuadros-pagination__actions">
                  <label className="reportes-cuadros-pagination__page-size">
                    Mostrar
                    <select value={pageSize} onChange={handlePageSizeChange}>
                      {normalizedPageSizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    registros
                  </label>
                  <button
                    type="button"
                    className="secondary small"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                  <span className="reportes-cuadros-pagination__page">
                    Página {displayPage} de {displayTotalPages}
                  </span>
                  <button
                    type="button"
                    className="secondary small"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="reportes-empty-state" role="status">
              <p>No se encontraron productos que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CuadrosComparativos;
