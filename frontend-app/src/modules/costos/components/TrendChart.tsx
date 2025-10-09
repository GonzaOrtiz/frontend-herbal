import React, { useMemo } from 'react';
import type { TrendPoint } from '../types';
import '../costos.css';

interface TrendChartProps {
  points: TrendPoint[];
}

const TrendChart: React.FC<TrendChartProps> = ({ points }) => {
  const { path, min, max } = useMemo(() => {
    if (points.length === 0) {
      return { path: '', min: 0, max: 0 };
    }
    const amounts = points.map((point) => point.amount);
    const minValue = Math.min(...amounts);
    const maxValue = Math.max(...amounts);
    const range = maxValue - minValue || 1;

    const pathData = points
      .map((point, index) => {
        const x = (index / (points.length - 1 || 1)) * 100;
        const y = 100 - ((point.amount - minValue) / range) * 100;
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');

    return { path: pathData, min: minValue, max: maxValue };
  }, [points]);

  return (
    <section className="costos-card costos-card--highlight">
      <h2>Tendencia del periodo</h2>
      <p className="costos-metadata">
        Evolución del total registrado por periodo de cálculo. Utiliza la variación para identificar anomalías.
      </p>
      {points.length === 0 ? (
        <p className="costos-empty-state">Aún no hay datos históricos suficientes para mostrar tendencia.</p>
      ) : (
        <div>
          <svg viewBox="0 0 100 100" className="costos-trend-chart" role="img" aria-label="Tendencia de costos">
            <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={3} strokeLinecap="round" />
            {points.map((point, index) => {
              const x = (index / (points.length - 1 || 1)) * 100;
              const range = max - min || 1;
              const y = 100 - ((point.amount - min) / range) * 100;
              return <circle key={point.period} cx={x} cy={y} r={2.6} fill="var(--color-primary)" />;
            })}
          </svg>
          <div className="costos-metadata">
            <span>Valor mínimo: {min.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            <span>Valor máximo: {max.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default TrendChart;
