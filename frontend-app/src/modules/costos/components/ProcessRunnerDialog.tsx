import React from 'react';
import type { BalanceSummaryData, CostosProcessState } from '../types';
import '../costos.css';

interface ProcessRunnerDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onRefresh: () => void;
  process: CostosProcessState;
  latestSummary: BalanceSummaryData | null;
}

const statusLabel: Record<CostosProcessState['status'], string> = {
  idle: 'Listo para ejecutar',
  running: 'En ejecución',
  success: 'Completado',
  error: 'Con errores',
};

const ProcessRunnerDialog: React.FC<ProcessRunnerDialogProps> = ({
  open,
  onClose,
  onStart,
  onCancel,
  onRetry,
  onRefresh,
  process,
  latestSummary,
}) => {
  if (!open) return null;

  const simulatedResult =
    process.result ??
    (latestSummary
      ? {
          balance: latestSummary.balance,
          difference: latestSummary.difference,
          warning: latestSummary.warning ?? null,
        }
      : undefined);

  return (
    <div className="costos-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Seguimiento de consolidación">
      <div className="costos-dialog">
        <header>
          <h2>Consolidación de costos</h2>
          <p className="costos-metadata">
            El prorrateo real se ejecuta automáticamente tras importaciones o sincronizaciones. Usa esta simulación para revisar
            cómo se actualizarían los balances y mantener visibilidad del flujo sin invocar servicios inexistentes.
          </p>
        </header>
        <div className="costos-dialog__body">
          <div>
            <strong>Estado: {statusLabel[process.status]}</strong>
            {simulatedResult && (
              <p className="costos-metadata">
                Balance: {simulatedResult.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} · Diferencia:{' '}
                {simulatedResult.difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            )}
            {simulatedResult?.warning && <p className="costos-warning">{simulatedResult.warning}</p>}
          </div>

          <div>
            <span className="costos-metadata">Progreso</span>
            <div className="costos-progress-bar" aria-valuenow={process.progress} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${process.progress}%` }} />
            </div>
            {process.startedAt && <p className="costos-metadata">Iniciado: {new Date(process.startedAt).toLocaleString('es-MX')}</p>}
            {process.finishedAt && (
              <p className="costos-metadata">Finalizado: {new Date(process.finishedAt).toLocaleString('es-MX')}</p>
            )}
          </div>
        </div>
        <div className="costos-dialog__footer">
          <button type="button" className="ghost" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="secondary" onClick={onRefresh} disabled={process.status === 'running'}>
            Refrescar balances
          </button>
          {process.status === 'idle' && (
            <button type="button" className="primary" onClick={onStart}>
              Simular consolidación
            </button>
          )}
          {process.status === 'running' && (
            <button type="button" className="secondary" onClick={onCancel}>
              Cancelar
            </button>
          )}
          {process.status === 'error' && (
            <button type="button" className="primary" onClick={onRetry}>
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessRunnerDialog;
