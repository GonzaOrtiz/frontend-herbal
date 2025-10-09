import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildShareableLink,
  compareFilters,
  normalizeCentro,
  normalizePeriodo,
  normalizeProducto,
  parseFiltersFromSearch,
  serializeFiltersToSearch,
} from '../utils/filters.js';

test('normalizePeriodo acepta YYYY-MM y lo convierte a primer día', () => {
  assert.equal(normalizePeriodo('2024-05'), '2024-05-01');
  assert.equal(normalizePeriodo('2024-05-01'), '2024-05-01');
  assert.equal(typeof normalizePeriodo('2024-05-15'), 'string');
  assert.equal(normalizePeriodo('no-date'), undefined);
});

test('normalizeCentro filtra valores inválidos', () => {
  assert.equal(normalizeCentro(' 101 '), '101');
  assert.equal(normalizeCentro('abc'), undefined);
  assert.equal(normalizeCentro(null), undefined);
});

test('serialize y parse mantienen filtros equivalentes', () => {
  const filters = { periodo: '2024-05-01', producto: 'Queso', centro: '200' };
  const params = serializeFiltersToSearch(filters);
  const parsed = parseFiltersFromSearch(params);
  assert.deepEqual(parsed, filters);
});

test('compareFilters detecta diferencias', () => {
  const a = { periodo: '2024-05-01', producto: 'Queso' };
  const b = { periodo: '2024-05-01', producto: 'Queso' };
  const c = { periodo: '2024-04-01', producto: 'Queso' };
  assert.equal(compareFilters(a, b), true);
  assert.equal(compareFilters(a, c), false);
});

test('buildShareableLink incluye parámetros esperados', () => {
  if (typeof window === 'undefined') {
    globalThis.window = {
      location: {
        origin: 'http://localhost',
        pathname: '/reportes',
        hash: '',
      },
      history: {
        pushState: () => {},
        replaceState: () => {},
      },
    } as unknown as Window & typeof globalThis;
  }
  const link = buildShareableLink({ periodo: '2024-05-01', centro: '101' });
  assert.equal(link.includes('periodo=2024-05-01'), true);
  assert.equal(link.includes('centro=101'), true);
});

test('normalizeProducto elimina espacios extra', () => {
  assert.equal(normalizeProducto('  Crema '), 'Crema');
  assert.equal(normalizeProducto('   '), undefined);
});
