import type { ValidationIssue, ValidationResult, Validator } from './types';

export interface ActividadFormValues {
  nombre: string;
}

export const defaultActividadValues: ActividadFormValues = {
  nombre: '',
};

export const actividadValidator: Validator<ActividadFormValues> = (input) => {
  const values = { ...defaultActividadValues, ...(input as Partial<ActividadFormValues>) };
  const issues: ValidationIssue[] = [];

  const nombre = values.nombre.trim();

  if (!nombre) {
    issues.push({ path: 'nombre', message: 'El nombre de la actividad es obligatorio.' });
  } else if (nombre.length < 3) {
    issues.push({ path: 'nombre', message: 'Ingresa al menos 3 caracteres.' });
  }

  if (issues.length) {
    return { success: false, issues };
  }

  return { success: true, data: { nombre } } satisfies ValidationResult<ActividadFormValues>;
};

export type ActividadValidationResult = ValidationResult<ActividadFormValues>;
