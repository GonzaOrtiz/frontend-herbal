import React from 'react';
import type { ReportSummaryCard } from '../types';

interface ReportSummaryCardsProps {
  cards: ReportSummaryCard[];
}

const toneClassMap: Record<Exclude<ReportSummaryCard['tone'], undefined>, string> = {
  default: '',
  success: 'reportes-summary-card--success',
  warning: 'reportes-summary-card--warning',
  danger: 'reportes-summary-card--danger',
};

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <section aria-label="Indicadores clave" className="reportes-summary-cards">
      {cards.map((card) => {
        const toneClass = card.tone ? toneClassMap[card.tone] ?? '' : '';
        return (
          <article key={card.id} className={`reportes-summary-card ${toneClass}`.trim()}>
            <span className="reportes-summary-card__label">{card.label}</span>
            <span className="reportes-summary-card__value" aria-live="polite">
              {card.value}
            </span>
            {card.helpText && <p className="reportes-summary-card__help">{card.helpText}</p>}
          </article>
        );
      })}
    </section>
  );
};

export default ReportSummaryCards;
