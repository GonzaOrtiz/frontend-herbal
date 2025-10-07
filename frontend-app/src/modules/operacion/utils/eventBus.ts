import type { AccionMasivaResultado, OperacionModulo, OperacionRegistro } from '../types';

export type OperacionEvent =
  | { type: 'registro:creado'; modulo: OperacionModulo; registro: OperacionRegistro }
  | { type: 'registro:actualizado'; modulo: OperacionModulo; registro: OperacionRegistro }
  | { type: 'registro:eliminado'; modulo: OperacionModulo; id: string }
  | { type: 'importacion:finalizada'; modulo: OperacionModulo; resumen: AccionMasivaResultado }
  | { type: 'cierre:solicitado'; modulo: OperacionModulo; payload: { closeReason?: string } };

export type OperacionEventListener = (event: OperacionEvent) => void;

const listeners = new Set<OperacionEventListener>();

export function emitOperacionEvent(event: OperacionEvent) {
  listeners.forEach((listener) => listener(event));
}

export function subscribeOperacionEvent(listener: OperacionEventListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
