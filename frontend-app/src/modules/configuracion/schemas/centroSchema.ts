import type { ValidationIssue, ValidationResult, Validator } from './types';

export interface CentroFormValues {
  nombre: string;
  nroCentro: string;
}

export const defaultCentroValues: CentroFormValues = {
  nombre: '',
  nroCentro: '',
};

export const centroValidator: Validator<CentroFormValues> = (input) => {
  const values = { ...defaultCentroValues, ...(input as Partial<CentroFormValues>) };
  const issues: ValidationIssue[] = [];

  const nroCentro = values.nroCentro.trim();
  const nombre = values.nombre.trim();
  const parsedNumber = Number(nroCentro);

  if (!nroCentro) {
    issues.push({ path: 'nroCentro', message: 'Ingresa el número de centro.' });
  } else if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
    issues.push({ path: 'nroCentro', message: 'El número debe ser un entero positivo.' });
  }

  if (!nombre) {
    issues.push({ path: 'nombre', message: 'El nombre es obligatorio.' });
  } else if (nombre.length < 3) {
    issues.push({ path: 'nombre', message: 'Ingresa al menos 3 caracteres.' });
  }

  if (issues.length) {
    return { success: false, issues } satisfies ValidationResult<CentroFormValues>;
  }

  return { success: true, data: { nombre, nroCentro } };
};
