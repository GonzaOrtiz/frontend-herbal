import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@/lib/query/QueryClient';
import { logHttpError } from '@/lib/observability/logger';
import { useOperacionContext } from '../context/OperacionContext';
import type { OperacionModulo, OperacionRegistro } from '../types';
import { emitOperacionEvent, subscribeOperacionEvent } from '../utils/eventBus';

interface SyncOptions {
  dependencias?: string[];
  enablePolling?: boolean;
  pollingMs?: number;
}

export function useOperacionSync(options: SyncOptions = {}) {
  const { dependencias = ['existencias', 'costos'], enablePolling = true, pollingMs = 60_000 } = options;
  const queryClient = useQueryClient();
  const { modulo, setResumen, resumen } = useOperacionContext();
  const [lastEvent, setLastEvent] = useState<string>('');

  useEffect(() => {
    const unsubscribe = subscribeOperacionEvent((event) => {
      setLastEvent(event.type);
      if (event.type === 'registro:creado' || event.type === 'registro:actualizado') {
        queryClient.invalidateQueries(['operacion', event.modulo]);
        dependencias.forEach((dependencia) => queryClient.invalidateQueries(['operacion', dependencia]));
      }

      if (event.type === 'cierre:solicitado') {
        setResumen({
          centro: resumen?.centro ?? 'CENTRO-GENERAL',
          calculationDate: resumen?.calculationDate ?? new Date().toISOString().slice(0, 10),
          responsable: resumen?.responsable ?? 'coordinador.01',
          bloqueado: true,
          closeReason: event.payload.closeReason ?? 'Cierre solicitado por coordinación',
          expectedUnlockAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        });
      }

      if (event.type === 'importacion:finalizada' && event.resumen.accion === 'recalcular') {
        queryClient.invalidateQueries(['operacion', 'existencias']);
      }
    });

    return () => unsubscribe();
  }, [dependencias, queryClient, resumen, setResumen]);

  useEffect(() => {
    if (!enablePolling) return;
    if (typeof window === 'undefined') return;
    const interval = window.setInterval(() => {
      emitOperacionEvent({ type: 'registro:actualizado', modulo, registro: datasetSnapshot(modulo) });
    }, pollingMs);
    return () => window.clearInterval(interval);
  }, [enablePolling, modulo, pollingMs]);

  const desbloquear = useCallback(() => {
    setResumen(resumen ? { ...resumen, bloqueado: false, closeReason: undefined, expectedUnlockAt: undefined } : null);
  }, [resumen, setResumen]);

  const forceInvalidate = useCallback(() => {
    try {
      dependencias.forEach((dependencia) => queryClient.invalidateQueries(['operacion', dependencia]));
    } catch (error) {
      logHttpError({ url: '/operacion/sync', method: 'POST', payload: { dependencias }, status: 500 });
    }
  }, [dependencias, queryClient]);

  return useMemo(() => ({ lastEvent, desbloquear, forceInvalidate }), [lastEvent, desbloquear, forceInvalidate]);
}

function datasetSnapshot(modulo: OperacionModulo) {
  const now = new Date();
  return {
    id: `${modulo}-polling`,
    centro: 'CENTRO-GENERAL',
    fecha: now.toISOString(),
    calculationDate: now.toISOString().slice(0, 10),
    createdBy: 'system',
    createdAt: now.toISOString(),
    source: 'api' as const,
    syncStatus: 'processing' as const,
  } as unknown as OperacionRegistro;
}
