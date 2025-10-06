import type { CatalogEntityBase } from '../types';
import { useCatalogData } from './useCatalogData';

export interface Centro extends CatalogEntityBase {
  codigo: string;
  tipo: 'produccion' | 'apoyo';
}

export function useCentros() {
  return useCatalogData<Centro>({ resource: 'centros' });
}
