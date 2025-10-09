import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mapGastoRecord,
  mapDepreciacionRecord,
  calculateBalanceSummary,
  buildAllocationBreakdown,
  buildTrendSeries,
} from '../utils/transformers.js';
import type { CostosListResponse, GastoRecord } from '../types';

test('mapGastoRecord normaliza montos y fechas', () => {
  const record = mapGastoRecord({
    id: '123',
    centro: '101',
    monto: '8.420,75',
    fecha: '2024-05-10',
    concepto: 'Reparación de caldera',
    tipo: 'Mantenimiento',
    esGastoDelPeriodo: 'true',
  });

  assert.equal(record.id, '123');
  assert.equal(record.centro, '101');
  assert.equal(record.monto, 8420.75);
  assert.equal(new Date(record.fecha).toISOString().startsWith('2024-05-10'), true);
  assert.equal(record.esGastoDelPeriodo, true);
});

test('mapDepreciacionRecord asigna valores por defecto', () => {
  const record = mapDepreciacionRecord({ id: 'dep-1', depreMensual: 1200 });
  assert.equal(record.maquina, 'SIN-MAQ');
  assert.equal(record.depreMensual, 1200);
  assert.equal(record.centro, '0');
});

test('calculateBalanceSummary calcula variación porcentual', () => {
  const response: CostosListResponse<GastoRecord> = {
    items: [
      {
        id: '1',
        centro: '101',
        calculationDate: '2024-05-31',
        fecha: '2024-05-10',
        monto: 1000,
      },
    ],
    totalAmount: 1000,
    totalCount: 1,
    balance: 950,
    difference: 50,
    previousTotal: 800,
    warning: null,
    currency: 'MXN',
    history: [],
  };

  const summary = calculateBalanceSummary(response);
  assert.equal(summary.totalAmount, 1000);
  assert.equal(summary.difference, 50);
  assert.ok(summary.variationPercentage && summary.variationPercentage > 0);
});

test('buildAllocationBreakdown calcula porcentaje por centro', () => {
  const records: GastoRecord[] = [
    {
      id: '1',
      centro: '101',
      calculationDate: '2024-05-31',
      fecha: '2024-05-01',
      monto: 400,
    },
    {
      id: '2',
      centro: '202',
      calculationDate: '2024-05-31',
      fecha: '2024-05-02',
      monto: 600,
    },
  ];

  const breakdown = buildAllocationBreakdown('gastos', records);
  const totalPercentage = breakdown.reduce((acc, item) => acc + item.percentage, 0);
  assert.equal(breakdown.length, 2);
  assert.ok(Math.abs(totalPercentage - 1) < 1e-6);
});

test('buildTrendSeries ordena por periodo', () => {
  const history = [
    { period: '2024-04', totalAmount: 800 },
    { period: '2024-05', totalAmount: 1000 },
    { period: '2024-03', totalAmount: 500 },
  ];

  const trend = buildTrendSeries(history);
  assert.equal(trend[0].period, '2024-03');
  assert.equal(trend[trend.length - 1].period, '2024-05');
  assert.equal(trend.length, 3);
});
