import React from 'react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import type { AllocationItem } from '../types';
import '../costos.css';

interface AllocationBreakdownProps {
  items: AllocationItem[];
  currency: string;
}

const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({ items, currency }) => (
  <section className="costos-card costos-card--highlight">
    <h2>Distribución por centro</h2>
    <p className="costos-metadata">
      Visualiza cómo se distribuye el importe total entre centros para validar prorrateos y asignaciones.
    </p>
    {items.length === 0 ? (
      <p className="costos-empty-state">Sin datos suficientes para calcular la distribución.</p>
    ) : (
      <ul className="costos-allocation-list">
        {items.map((item) => (
          <li key={item.key} className="costos-allocation-item">
            <div>
              <span>{item.label}</span>
              <p className="costos-metadata">
                {formatCurrency(item.amount, { currency })} · {formatPercentage(item.percentage)}
              </p>
              <div className="costos-allocation-bar" aria-hidden="true">
                <span style={{ width: `${Math.min(item.percentage * 100, 100)}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default AllocationBreakdown;
