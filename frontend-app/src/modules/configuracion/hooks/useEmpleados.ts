import { useCatalogData } from './useCatalogData';

export interface Empleado {
  id: string;
  nombre: string;
  nroEmpleado: number;
}

const mapEmpleado = (empleado: any): Empleado => ({
  id: empleado?._id ? String(empleado._id) : String(empleado?.id ?? ''),
  nombre: empleado?.nombre ?? '',
  nroEmpleado: Number(empleado?.Nroem ?? empleado?.nroEmpleado ?? 0),
});

export function useEmpleados() {
  return useCatalogData<Empleado>({ resource: 'empleados', mapResponse: mapEmpleado });
}
