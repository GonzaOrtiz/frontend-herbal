import { buildCentrosApoyoSummary } from '../utils/centrosApoyo';

const sampleExpenses = [
  {
    id: '1',
    concepto: 'Energía',
    categoria: 'Energía',
    monto: 18250.45,
    esGastoDelPeriodo: true,
    fechaCalculo: '2024-05-31',
  },
  {
    id: '2',
    concepto: 'Caldera',
    categoria: 'Caldera',
    monto: 6200,
    esGastoDelPeriodo: true,
    fechaCalculo: '2024-05-31',
  },
  {
    id: '3',
    concepto: 'Refrigeración',
    categoria: 'Energía',
    monto: 4200,
    esGastoDelPeriodo: false,
    fechaCalculo: '2024-05-31',
  },
];

describe('buildCentrosApoyoSummary', () => {
  it('calcula totales y porcentajes por categoría', () => {
    const summary = buildCentrosApoyoSummary(sampleExpenses);
    expect(summary.total).toBeCloseTo(28650.45, 2);
    expect(summary.periodTotal).toBeCloseTo(24450.45, 2);
    expect(summary.outOfPeriodTotal).toBeCloseTo(4200, 2);
    expect(summary.categories).toHaveLength(2);
    expect(summary.categories[0].category).toBe('Energía');
    expect(summary.categories[0].amount).toBeCloseTo(22450.45, 2);
    expect(summary.categories[0].percentage).toBeCloseTo(22450.45 / 28650.45, 5);
    expect(summary.categories[1].category).toBe('Caldera');
    expect(summary.categories[1].amount).toBeCloseTo(6200, 2);
  });

  it('devuelve ceros cuando no hay gastos', () => {
    const summary = buildCentrosApoyoSummary([]);
    expect(summary.total).toBe(0);
    expect(summary.periodTotal).toBe(0);
    expect(summary.outOfPeriodTotal).toBe(0);
    expect(summary.categories).toHaveLength(0);
  });
});
