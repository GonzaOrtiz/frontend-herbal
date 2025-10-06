import type { CatalogEntityBase } from '../types';
import { useCatalogData } from './useCatalogData';

export interface Empleado extends CatalogEntityBase {
  correo: string;
  centroAsignado: string;
}

export function useEmpleados() {
  return useCatalogData<Empleado>({ resource: 'empleados' });
}
