import { useCallback, useEffect, useRef } from 'react';
import {
  cancelProcess,
  fetchProcessStatus,
  retryProcess,
  startCostosProcess,
} from '../api/costosApi';
import { useCostosContext } from '../context/CostosContext';
import type { CostosProcessPayload } from '../types';

const POLLING_INTERVAL = 2500;

export function useProcessRunner() {
  const { filters, processState, updateProcessState } = useCostosContext();
  const pollerRef = useRef<NodeJS.Timeout | null>(null);

  const clearPoller = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (processId: string) => {
      clearPoller();
      const executePoll = async () => {
        try {
          const status = await fetchProcessStatus(processId);
          updateProcessState((current) => ({
            ...current,
            progress: status.progress,
            result: {
              balance: status.balance,
              difference: status.difference,
              warning: status.warning,
            },
            logs: status.logs ?? current.logs,
            status: status.status === 'completed' ? 'success' : status.status === 'error' ? 'error' : 'running',
            finishedAt: status.finishedAt,
            error: status.error,
          }));

          if (status.status === 'completed' || status.status === 'error') {
            clearPoller();
          }
        } catch (error) {
          clearPoller();
          updateProcessState((current) => ({
            ...current,
            status: 'error',
            error: error instanceof Error ? error.message : 'No se pudo obtener el estado del proceso.',
          }));
        }
      };

      void executePoll();
      pollerRef.current = setInterval(executePoll, POLLING_INTERVAL);
    },
    [clearPoller, updateProcessState],
  );

  const start = useCallback(
    async (payload?: Partial<CostosProcessPayload>) => {
      updateProcessState(() => ({ status: 'running', logs: [], progress: 0 }));
      try {
        const response = await startCostosProcess({
          calculationDate: filters.calculationDate,
          centro: filters.centro,
          motivo: payload?.motivo ?? 'consolidacion',
          retryProcessId: payload?.retryProcessId,
        });
        updateProcessState((current) => ({
          ...current,
          processId: response.processId,
          startedAt: new Date().toISOString(),
          progress: 5,
        }));
        pollStatus(response.processId);
      } catch (error) {
        updateProcessState((current) => ({
          ...current,
          status: 'error',
          error: error instanceof Error ? error.message : 'No se pudo iniciar el proceso.',
        }));
      }
    },
    [filters.calculationDate, filters.centro, pollStatus, updateProcessState],
  );

  const cancel = useCallback(async () => {
    if (!processState.processId) return;
    try {
      await cancelProcess(processState.processId);
      clearPoller();
      updateProcessState((current) => ({
        ...current,
        status: 'idle',
        progress: 0,
      }));
    } catch (error) {
      updateProcessState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'No se pudo cancelar el proceso.',
      }));
    }
  }, [processState.processId, clearPoller, updateProcessState]);

  const retry = useCallback(async () => {
    if (!processState.processId) {
      await start({ motivo: 'reprocesar' });
      return;
    }
    try {
      const handle = await retryProcess(processState.processId);
      updateProcessState((current) => ({
        ...current,
        status: 'running',
        progress: 0,
        logs: [],
        processId: handle.processId,
        startedAt: new Date().toISOString(),
      }));
      pollStatus(handle.processId);
    } catch (error) {
      updateProcessState((current) => ({
        ...current,
        status: 'error',
        error: error instanceof Error ? error.message : 'No se pudo reiniciar el proceso.',
      }));
    }
  }, [pollStatus, processState.processId, start, updateProcessState]);

  useEffect(() => () => clearPoller(), [clearPoller]);

  return {
    processState,
    start,
    cancel,
    retry,
  };
}
