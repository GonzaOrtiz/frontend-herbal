import { useCatalogData } from './useCatalogData';

export interface Centro {
  id: string;
  nombre: string;
  nroCentro: number;
}

const mapCentro = (centro: any): Centro => ({
  id: centro?._id ? String(centro._id) : String(centro?.id ?? ''),
  nombre: centro?.nombre ?? '',
  nroCentro: Number(centro?.nroCentro ?? 0),
});

export function useCentros() {
  return useCatalogData<Centro>({ resource: 'centros-produccion', mapResponse: mapCentro });
}
