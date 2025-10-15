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

const CuadrosComparativos: React.FC<CuadrosComparativosProps> = ({ cards }) => {
  const tableTitleId = 'cuadros-comparativos-table-title';
  const descriptionId = 'cuadros-comparativos-table-description';
  const hasPeriodoColumn = cards.some((card) => Boolean(card.periodoLabel));
  const hasTendenciaColumn = cards.some((card) => Boolean(card.tendenciaLabel));

  return (
    <section
      className="reportes-table-card"
      aria-labelledby={tableTitleId}
      aria-describedby={descriptionId}
    >
      <header className="reportes-table-card__header">
        <h4 id={tableTitleId}>Detalle por producto</h4>
        <p id={descriptionId}>Comparativo de costos directos e indirectos.</p>
      </header>
      <div className="reportes-table-card__body">
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
              {cards.map((card) => (
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
      </div>
    </section>
  );
};

export default CuadrosComparativos;
