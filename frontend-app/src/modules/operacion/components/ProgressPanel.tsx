import React from 'react';
import type { BitacoraImportacion, ImportStatus } from '../types';

interface Props {
  status: ImportStatus;
  bitacora: BitacoraImportacion | null;
}

const statusLabel: Record<ImportStatus, string> = {
  idle: 'En espera',
  processing: 'Procesando',
  waiting: 'En cola',
  completed: 'Completado',
  failed: 'Con errores',
};

const ProgressPanel: React.FC<Props> = ({ status, bitacora }) => {
  const porcentaje = bitacora ? (bitacora.resumen.exitosos / bitacora.resumen.total) * 100 : 0;

  return (
    <div className="progress-panel" aria-live="polite">
      <header>
        <strong>Importación masiva</strong>
        <div>Estado actual: {statusLabel[status]}</div>
      </header>
      <div className="bar" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
        <div className="bar-inner" style={{ width: `${porcentaje}%` }} />
      </div>
      {bitacora && (
        <ul>
          <li>Total filas: {bitacora.resumen.total}</li>
          <li>Exitosas: {bitacora.resumen.exitosos}</li>
          <li>Fallidas: {bitacora.resumen.fallidos}</li>
        </ul>
      )}
    </div>
  );
};

export default ProgressPanel;
