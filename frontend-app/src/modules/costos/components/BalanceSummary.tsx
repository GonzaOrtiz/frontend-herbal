import React from 'react';
import type { BalanceSummaryData } from '../types';
import '../costos.css';

interface BalanceSummaryProps {
  summary: BalanceSummaryData;
  formatted: {
    total: string;
    previous?: string;
    balance: string;
    difference: string;
    variation?: string;
    warning?: string | null;
  };
  onRefresh?: () => void;
  isLoading?: boolean;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summary, formatted, onRefresh, isLoading }) => (
  <section className="costos-card costos-card--highlight" aria-live="polite">
    <header className="costos-toolbar">
      <div>
        <h2>Resumen de balances</h2>
        <p className="costos-metadata">
          <span>Total acumulado del periodo activo.</span>
          <span>Balance devuelto por la API considerando consolidaciones recientes.</span>
        </p>
      </div>
      {onRefresh && (
        <button type="button" className="secondary" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Actualizando…' : 'Actualizar'}
        </button>
      )}
    </header>

    <div className="costos-summary-grid">
      <div className="costos-summary-item">
        <span>{formatted.total}</span>
        <span>Total actual</span>
      </div>
      {formatted.previous && (
        <div className="costos-summary-item">
          <span>{formatted.previous}</span>
          <span>Periodo anterior</span>
        </div>
      )}
      <div className="costos-summary-item">
        <span>{formatted.balance}</span>
        <span>Balance informado</span>
      </div>
      <div className="costos-summary-item">
        <span>{formatted.difference}</span>
        <span>Diferencia</span>
      </div>
      {formatted.variation && (
        <div className="costos-summary-item">
          <span>{formatted.variation}</span>
          <span>Variación porcentual</span>
        </div>
      )}
    </div>

    {formatted.warning && formatted.warning.trim() !== '' && (
      <div className="costos-warning" role="alert">
        {formatted.warning}
      </div>
    )}

    <footer className="costos-metadata">
      <span>Balance: {summary.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
      <span>Diferencia: {summary.difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
    </footer>
  </section>
);

export default BalanceSummary;
