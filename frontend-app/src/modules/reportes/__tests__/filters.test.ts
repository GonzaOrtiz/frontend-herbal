import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildShareableLink,
  compareFilters,
  normalizeCentro,
  normalizeFilters,
  normalizePeriodo,
  normalizeProducto,
  parseFiltersFromSearch,
  serializeFiltersToSearch,
} from '../utils/filters.js';

test('normalizePeriodo acepta YYYY-MM y lo convierte a primer día', () => {
  assert.equal(normalizePeriodo('2024-05'), '2024-05-01');
  assert.equal(normalizePeriodo('2024-05-01'), '2024-05-01');
  assert.equal(normalizePeriodo('2024-05-15'), '2024-05-15');
  assert.equal(normalizePeriodo('no-date'), undefined);
});

test('serializeFiltersToSearch siempre incluye el día cuando hay periodo', () => {
  const params = serializeFiltersToSearch({ periodo: '2024-05' });
  assert.equal(params.get('periodo'), '2024-05-01');
});

test('normalizeFilters homogeniza todas las propiedades', () => {
  const filters = normalizeFilters({ periodo: '2024-05', producto: '  Crema  ', centro: ' 101 ' });
  assert.deepEqual(filters, { periodo: '2024-05-01', producto: 'Crema', centro: '101' });
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
