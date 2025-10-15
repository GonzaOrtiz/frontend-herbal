import React from 'react';
import type { ReportCuadroCard } from '../types';

interface CuadrosComparativosProps {
  cards: ReportCuadroCard[];
}

const toneClassMap: Record<ReportCuadroCard['tone'], string> = {
  default: '',
  success: 'reportes-cuadro-card--success',
  warning: 'reportes-cuadro-card--warning',
  danger: 'reportes-cuadro-card--danger',
};

const CuadrosComparativos: React.FC<CuadrosComparativosProps> = ({ cards }) => (
  <section aria-label="Cuadros comparativos de costos" className="reportes-cuadros-grid">
    {cards.map((card) => (
      <article key={card.id} className={`reportes-cuadro-card ${toneClassMap[card.tone]}`}>
        <header className="reportes-cuadro-card__header">
          <h4>{card.producto}</h4>
          {card.periodoLabel && <span>{card.periodoLabel}</span>}
        </header>
        <dl className="reportes-cuadro-card__metrics">
          <div>
            <dt>Costo directo</dt>
            <dd>{card.costoDirecto}</dd>
          </div>
          <div>
            <dt>Costo indirecto</dt>
            <dd>{card.costoIndirecto}</dd>
          </div>
        </dl>
        <footer className="reportes-cuadro-card__footer">
          <div className="reportes-cuadro-card__difference">
            <strong>{card.diferencia}</strong>
            {card.diferenciaPorcentaje && <span>{card.diferenciaPorcentaje}</span>}
          </div>
          {card.tendenciaLabel && <p>{card.tendenciaLabel}</p>}
        </footer>
      </article>
    ))}
  </section>
);

export default CuadrosComparativos;
