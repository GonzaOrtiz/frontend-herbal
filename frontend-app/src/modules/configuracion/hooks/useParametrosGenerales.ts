import { useCatalogData } from './useCatalogData';
import type { CatalogEntityBase } from '../types';

export interface ParametroGeneral extends CatalogEntityBase {
  politicaCosteo: 'promedio' | 'peps' | 'ueps';
  fechaCalculo: string;
}

export function useParametrosGenerales() {
  return useCatalogData<ParametroGeneral>({ resource: 'parametros-generales' });
}
