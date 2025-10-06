import type { CatalogEntityStatus } from '../types';
import type { ValidationIssue, ValidationResult, Validator } from './types';

export interface ActividadFormValues {
  nombre: string;
  descripcion: string;
  estado: CatalogEntityStatus;
  responsable: string;
}

export const defaultActividadValues: ActividadFormValues = {
  nombre: '',
  descripcion: '',
  estado: 'activo',
  responsable: '',
};

const validStatuses: CatalogEntityStatus[] = ['activo', 'inactivo', 'sincronizando'];

export const actividadValidator: Validator<ActividadFormValues> = (input) => {
  const values = { ...defaultActividadValues, ...(input as Partial<ActividadFormValues>) };
  const issues: ValidationIssue[] = [];

  if (!values.nombre || values.nombre.trim().length < 3) {
    issues.push({ path: 'nombre', message: 'El nombre debe tener al menos 3 caracteres.' });
  }

  if (!values.descripcion || values.descripcion.trim().length < 10) {
    issues.push({ path: 'descripcion', message: 'Describe la actividad con al menos 10 caracteres.' });
  }

  if (!validStatuses.includes(values.estado)) {
    issues.push({ path: 'estado', message: 'Estado no válido.' });
  }

  if (!values.responsable) {
    issues.push({ path: 'responsable', message: 'Debes asignar un responsable funcional.' });
  }

  if (issues.length) {
    return { success: false, issues };
  }

  return { success: true, data: values } satisfies ValidationResult<ActividadFormValues>;
};

export type ActividadValidationResult = ValidationResult<ActividadFormValues>;
