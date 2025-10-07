import type { ValidationIssue, ValidationResult, Validator } from './types';

export interface EmpleadoFormValues {
  nombre: string;
}

export const defaultEmpleadoValues: EmpleadoFormValues = {
  nombre: '',
};

export const empleadoValidator: Validator<EmpleadoFormValues> = (input) => {
  const values = { ...defaultEmpleadoValues, ...(input as Partial<EmpleadoFormValues>) };
  const issues: ValidationIssue[] = [];

  const nombre = values.nombre.trim();

  if (!nombre) {
    issues.push({ path: 'nombre', message: 'El nombre del empleado es obligatorio.' });
  } else if (nombre.length < 3) {
    issues.push({ path: 'nombre', message: 'Ingresa al menos 3 caracteres.' });
  }

  if (issues.length) {
    return { success: false, issues } satisfies ValidationResult<EmpleadoFormValues>;
  }

  return { success: true, data: { nombre } };
};
