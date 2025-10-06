import type { ValidationIssue, ValidationResult, Validator } from './types';

export interface EmpleadoFormValues {
  identificador: string;
  nombre: string;
  correo: string;
  activo: boolean;
  centroAsignado: string;
}

export const defaultEmpleadoValues: EmpleadoFormValues = {
  identificador: '',
  nombre: '',
  correo: '',
  activo: true,
  centroAsignado: '',
};

const correoPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const empleadoValidator: Validator<EmpleadoFormValues> = (input) => {
  const values = { ...defaultEmpleadoValues, ...(input as Partial<EmpleadoFormValues>) };
  const issues: ValidationIssue[] = [];

  if (!values.identificador.trim()) {
    issues.push({ path: 'identificador', message: 'El identificador es obligatorio.' });
  }

  if (!values.nombre || values.nombre.trim().length < 4) {
    issues.push({ path: 'nombre', message: 'Incluye nombre y apellidos.' });
  }

  if (!values.correo || !correoPattern.test(values.correo)) {
    issues.push({ path: 'correo', message: 'Correo electrónico inválido.' });
  }

  if (!values.centroAsignado) {
    issues.push({ path: 'centroAsignado', message: 'Selecciona un centro asignado.' });
  }

  if (issues.length) {
    return { success: false, issues } satisfies ValidationResult<EmpleadoFormValues>;
  }

  return { success: true, data: values };
};
