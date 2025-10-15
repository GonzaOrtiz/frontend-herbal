import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCuadrosResponse } from '../utils/normalizers.js';

test('normalizeCuadrosResponse formatea montos y clasifica tonos', () => {
  const response = [
    { id: 'card-1', producto: 'Queso manchego', periodo: '2024-05-01', costoDirecto: 1000, costoIndirecto: 1020 },
    { id: 'card-2', producto: 'Crema doble', periodo: '2024-05-01', costoDirecto: 1250, costoIndirecto: 800 },
  ];

  const cards = normalizeCuadrosResponse(response);

  assert.equal(cards.length, 2);
  const first = cards[0];
  assert.equal(first.producto, 'Queso manchego');
  assert.equal(first.periodoLabel, '2024-05');
  assert.equal(first.costoDirecto.includes('$'), true);
  assert.equal(first.costoIndirecto.includes('$'), true);
  assert.equal(first.diferencia.includes('$'), true);
  assert.equal(first.tone, 'success');
  assert.ok(first.diferenciaPorcentaje?.includes('%'));

  const second = cards[1];
  assert.equal(second.tone, 'danger');
  assert.equal(second.diferencia.startsWith('-'), true);
});
