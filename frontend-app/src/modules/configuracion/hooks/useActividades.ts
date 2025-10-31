import { useCatalogData } from './useCatalogData';

export interface Actividad {
  id: string;
  nombre: string;
  nroAct: number;
}

const mapActividad = (actividad: any): Actividad => ({
  id: actividad?._id ? String(actividad._id) : String(actividad?.id ?? ''),
  nombre: actividad?.nombre ?? '',
  nroAct: Number(actividad?.nroAct ?? 0),
});

export function useActividades() {
  return useCatalogData<Actividad>({ resource: 'actividades', mapResponse: mapActividad });
}

