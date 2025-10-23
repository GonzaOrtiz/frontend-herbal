import type { FiltroPersistente, OperacionModulo, OperacionRegistro } from '../types';

function normalizeText(value?: string | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed.toLowerCase();
}

function normalizeDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function matchesTextField(registro: OperacionRegistro, key: keyof OperacionRegistro, filtro?: string): boolean {
  if (!filtro) return true;
  const expected = normalizeText(filtro);
  if (!expected) return true;
  const raw = registro[key];
  if (typeof raw !== 'string') return false;
  const actual = normalizeText(raw);
  if (!actual) return false;
  return actual.includes(expected);
}

function matchesCalculationDate(registro: OperacionRegistro, filtros: FiltroPersistente): boolean {
  const expected = normalizeDate(filtros.calculationDate);
  if (!expected) return true;
  const calculationDate = normalizeDate(registro.calculationDate ?? registro.fecha);
  if (!calculationDate) return false;
  return calculationDate === expected;
}

function matchesRango(registro: OperacionRegistro, filtros: FiltroPersistente): boolean {
  if (!filtros.rango) return true;
  const fechaRegistro = normalizeDate(registro.fecha);
  if (!fechaRegistro) return false;
  const desde = normalizeDate(filtros.rango.desde);
  const hasta = normalizeDate(filtros.rango.hasta);

  if (desde && fechaRegistro < desde) return false;
  if (hasta && fechaRegistro > hasta) return false;
  return true;
}

function matchesCentro(registro: OperacionRegistro, filtros: FiltroPersistente): boolean {
  if (!filtros.centro) return true;
  if (!('centro' in registro)) return false;
  const actual = normalizeText(registro.centro ?? '');
  const expected = normalizeText(filtros.centro);
  if (!expected) return true;
  return actual === expected;
}

function matchesProducto(registro: OperacionRegistro, filtros: FiltroPersistente): boolean {
  if (!filtros.producto) return true;
  if (!('producto' in registro)) return false;
  return matchesTextField(registro, 'producto', filtros.producto);
}

export function filterOperacionRegistros(
  registros: OperacionRegistro[] | undefined,
  modulo: OperacionModulo,
  filtros: FiltroPersistente,
): OperacionRegistro[] {
  if (!registros) return [];

  return registros.filter((registro) => {
    if (!matchesCalculationDate(registro, filtros)) return false;
    if (!matchesRango(registro, filtros)) return false;

    if (!matchesProducto(registro, filtros)) return false;

    if (modulo === 'producciones' && !matchesCentro(registro, filtros)) {
      return false;
    }

    return true;
  });
}
