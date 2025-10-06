import type { ValidationIssue, ValidationResult, Validator } from './types';

export interface CentroFormValues {
  codigo: string;
  nombre: string;
  tipo: 'produccion' | 'apoyo';
  responsable: string;
}

export const defaultCentroValues: CentroFormValues = {
  codigo: '',
  nombre: '',
  tipo: 'produccion',
  responsable: '',
};

export const centroValidator: Validator<CentroFormValues> = (input) => {
  const values = { ...defaultCentroValues, ...(input as Partial<CentroFormValues>) };
  const issues: ValidationIssue[] = [];

  if (!values.codigo || values.codigo.trim().length < 2) {
    issues.push({ path: 'codigo', message: 'El código debe tener al menos 2 caracteres.' });
  }

  if (!values.nombre || values.nombre.trim().length < 4) {
    issues.push({ path: 'nombre', message: 'El nombre debe tener al menos 4 caracteres.' });
  }

  if (!['produccion', 'apoyo'].includes(values.tipo)) {
    issues.push({ path: 'tipo', message: 'Selecciona un tipo válido.' });
  }

  if (!values.responsable) {
    issues.push({ path: 'responsable', message: 'Debes asignar un responsable.' });
  }

  if (issues.length) {
    return { success: false, issues } satisfies ValidationResult<CentroFormValues>;
  }

  return { success: true, data: values };
};
