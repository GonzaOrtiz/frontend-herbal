import React from 'react';
import type { CostosProcessState } from '../types';
import '../costos.css';

interface ProcessRunnerDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  onCancel: () => void;
  onRetry: () => void;
  process: CostosProcessState;
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
  process,
}) => {
  if (!open) return null;

  return (
    <div className="costos-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Seguimiento de consolidación">
      <div className="costos-dialog">
        <header>
          <h2>Consolidación de costos</h2>
          <p className="costos-metadata">
            Monitorea el avance del prorrateo automático y consolida costos en caso de desbalances. Los resultados se reflejan en
            los módulos de Existencias y Asientos.
          </p>
        </header>
        <div className="costos-dialog__body">
          <div>
            <strong>Estado: {statusLabel[process.status]}</strong>
            {process.result && (
              <p className="costos-metadata">
                Balance: {process.result.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} · Diferencia:{' '}
                {process.result.difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            )}
            {process.result?.warning && <p className="costos-warning">{process.result.warning}</p>}
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
          {process.status === 'idle' && (
            <button type="button" className="primary" onClick={onStart}>
              Ejecutar consolidación
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
