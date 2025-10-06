import type { CatalogEntityBase } from '../types';
import { useCatalogData } from './useCatalogData';

export interface Actividad extends CatalogEntityBase {
  descripcion: string;
  responsable: string;
}

export function useActividades() {
  return useCatalogData<Actividad>({ resource: 'actividades' });
}
