import type { OperacionRegistro } from '../types';

export interface GroupedRegistro {
  key: string;
  registros: OperacionRegistro[];
}

export function groupBy(registros: OperacionRegistro[], property: 'lote' | 'turno'): GroupedRegistro[] {
  const map = new Map<string, OperacionRegistro[]>();
  registros.forEach((registro) => {
    const value = (registro as unknown as Record<string, string | undefined>)[property];
    const key = value ?? 'Sin dato';
    const collection = map.get(key) ?? [];
    collection.push(registro);
    map.set(key, collection);
  });
  return Array.from(map.entries()).map(([key, value]) => ({ key, registros: value }));
}
