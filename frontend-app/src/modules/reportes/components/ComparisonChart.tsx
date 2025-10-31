import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ComparisonInsight, ComparisonPoint } from '../types';

interface ComparisonChartProps {
  data: ComparisonPoint[];
  insight: ComparisonInsight;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, insight }) => (
  <figure aria-label="Comparativo de egresos vs insumos" role="group">
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} barGap={12} role="img" aria-label="Gráfico comparativo de egresos e insumos">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)} />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
            }
            contentStyle={{ backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: 12 }}
          />
          <Legend />
          <Bar dataKey="egresos" name="Egresos" fill="#1d4ed8" radius={[12, 12, 0, 0]} />
          <Bar dataKey="insumos" name="Insumos" fill="#0ea5e9" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <figcaption>
      <strong>{insight.differenceLabel}</strong>
      <p>{insight.statusLabel}</p>
      <span role="status" aria-live="polite">
        {insight.consistent ? '✅ Totales consistentes' : '⚠️ Revisión requerida'}
      </span>
    </figcaption>
  </figure>
);

export default ComparisonChart;
