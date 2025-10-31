import type { Validator } from './types';

export interface CentroApoyoFormValues {
  nroCentro: string;
  nombre: string;
}

export const defaultCentroApoyoValues: CentroApoyoFormValues = {
  nroCentro: '',
  nombre: '',
};

export const centroApoyoValidator: Validator<CentroApoyoFormValues> = (input) => {
  const issues: Array<{ path: keyof CentroApoyoFormValues; message: string }> = [];
  const raw = (input ?? {}) as Partial<Record<keyof CentroApoyoFormValues, unknown>>;

  const nroCentroValue = 'nroCentro' in raw ? String(raw.nroCentro ?? '') : '';
  const nombreValue = 'nombre' in raw ? String(raw.nombre ?? '') : '';
  const trimmedNombre = nombreValue.trim();

  if (!trimmedNombre) {
    issues.push({ path: 'nombre', message: 'El nombre es obligatorio.' });
  } else if (trimmedNombre.length < 3 || trimmedNombre.length > 120) {
    issues.push({ path: 'nombre', message: 'El nombre debe tener entre 3 y 120 caracteres.' });
  }

  if (!nroCentroValue) {
    issues.push({ path: 'nroCentro', message: 'No se pudo identificar el número de centro.' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  return {
    success: true,
    data: {
      nroCentro: nroCentroValue,
      nombre: trimmedNombre,
    },
  };
};
