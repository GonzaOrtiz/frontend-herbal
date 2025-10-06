import type { ValidationIssue, ValidationResult, Validator } from './types';

export interface ParametrosGeneralesFormValues {
  fechaCalculo: string;
  politicaCosteo: 'promedio' | 'peps' | 'ueps';
  aprobador: string;
}

export const defaultParametrosValues: ParametrosGeneralesFormValues = {
  fechaCalculo: '',
  politicaCosteo: 'promedio',
  aprobador: '',
};

export const parametrosGeneralesValidator: Validator<ParametrosGeneralesFormValues> = (input) => {
  const values = { ...defaultParametrosValues, ...(input as Partial<ParametrosGeneralesFormValues>) };
  const issues: ValidationIssue[] = [];

  if (!values.fechaCalculo) {
    issues.push({ path: 'fechaCalculo', message: 'Selecciona la fecha de cálculo.' });
  }

  if (!['promedio', 'peps', 'ueps'].includes(values.politicaCosteo)) {
    issues.push({ path: 'politicaCosteo', message: 'Selecciona una política válida.' });
  }

  if (!values.aprobador) {
    issues.push({ path: 'aprobador', message: 'Debes indicar el aprobador responsable.' });
  }

  if (issues.length) {
    return { success: false, issues } satisfies ValidationResult<ParametrosGeneralesFormValues>;
  }

  return { success: true, data: values };
};
