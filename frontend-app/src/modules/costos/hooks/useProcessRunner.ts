import { useCallback, useEffect, useRef } from 'react';
import { useCostosContext } from '../context/CostosContext';
import type { CostosProcessPayload, ProcessLogEntry } from '../types';

const SIMULATION_DURATION = 4500;
const STEP_COUNT = 4;

function createLog(message: string, level: ProcessLogEntry['level'] = 'info'): ProcessLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    message,
    level,
    actor: 'sistema',
  };
}

export function useProcessRunner() {
  const { filters, processState, updateProcessState, lastSummary } = useCostosContext();
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timerId = setTimeout(callback, delay);
    timersRef.current.push(timerId);
  }, []);

  const start = useCallback(
    (payload?: Partial<CostosProcessPayload>) => {
      clearTimers();
      const centroLabel = filters.centro ? ` · Centro ${filters.centro}` : '';
      const motivoLabel = payload?.motivo === 'reprocesar' ? ' (reproceso manual)' : '';

      updateProcessState(() => ({
        status: 'running',
        progress: 5,
        logs: [
          createLog(
            `Se inició la simulación de consolidación para ${filters.calculationDate}${centroLabel}${motivoLabel}.`,
          ),
        ],
        startedAt: new Date().toISOString(),
        finishedAt: undefined,
        error: undefined,
        processId: undefined,
        result: undefined,
      }));

      const stepMessages = [
        'Validando movimientos importados…',
        'Distribuyendo costos entre centros…',
        'Recalculando balances consolidados…',
      ];

      stepMessages.forEach((message, index) => {
        schedule(() => {
          updateProcessState((current) => ({
            ...current,
            progress: Math.min(25 + index * 25, 90),
            logs: [...current.logs, createLog(message)],
          }));
        }, ((index + 1) * SIMULATION_DURATION) / STEP_COUNT);
      });

      schedule(() => {
        clearTimers();
        updateProcessState((current) => {
          const result = {
            balance: lastSummary?.balance ?? 0,
            difference: lastSummary?.difference ?? 0,
            warning: lastSummary?.warning ?? null,
          };
          return {
            ...current,
            status: 'success',
            progress: 100,
            finishedAt: new Date().toISOString(),
            result,
            logs: [
              ...current.logs,
              createLog(
                result.warning
                  ? `Simulación finalizada con advertencias: ${result.warning}`
                  : 'Simulación finalizada sin advertencias. Se conservan los balances vigentes.',
                result.warning ? 'warning' : 'info',
              ),
            ],
          };
        });
      }, SIMULATION_DURATION);
    },
    [clearTimers, filters.calculationDate, filters.centro, lastSummary, schedule, updateProcessState],
  );

  const cancel = useCallback(() => {
    if (processState.status !== 'running') return;
    clearTimers();
    updateProcessState((current) => ({
      ...current,
      status: 'idle',
      progress: 0,
      finishedAt: new Date().toISOString(),
      logs: [
        ...current.logs,
        createLog('La simulación se canceló. Se conservarán los últimos balances conocidos.', 'warning'),
      ],
    }));
  }, [clearTimers, processState.status, updateProcessState]);

  const retry = useCallback(() => {
    start({ motivo: 'reprocesar' });
  }, [start]);

  useEffect(
    () => () => {
      clearTimers();
    },
    [clearTimers],
  );

  return {
    processState,
    start,
    cancel,
    retry,
  };
}
