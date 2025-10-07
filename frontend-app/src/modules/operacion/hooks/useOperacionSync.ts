import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@/lib/query/QueryClient';
import { logHttpError } from '@/lib/observability/logger';
import { useOperacionContext } from '../context/OperacionContext';
import { fetchCierreOperacion } from '../api';
import type { OperacionModulo } from '../types';
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

    let cancelled = false;

    const poll = async () => {
      const estado = await fetchCierreOperacion(modulo);
      if (cancelled || !estado) return;
      setResumen((prev) => {
        const base = prev ?? {
          centro: 'CENTRO-GENERAL',
          calculationDate: new Date().toISOString().slice(0, 10),
        };
        return {
          ...base,
          ...estado,
          responsable: estado.responsable ?? prev?.responsable ?? 'coordinador.01',
        };
      });
      setLastEvent('sync:polling');
    };

    poll();
    const interval = window.setInterval(() => {
      void poll();
    }, pollingMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enablePolling, modulo, pollingMs, setResumen]);

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
