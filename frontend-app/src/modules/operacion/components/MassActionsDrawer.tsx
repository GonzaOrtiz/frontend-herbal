import React from 'react';
import type { AccionMasivaResultado } from '../types';

interface Props {
  selected: string[];
  onRun: (accion: 'aprobar' | 'recalcular' | 'cerrar') => void;
  ultimoResultado?: AccionMasivaResultado;
  isProcessing?: boolean;
  onClose?: () => void;
}

const MassActionsDrawer: React.FC<Props> = ({
  selected,
  onRun,
  ultimoResultado,
  isProcessing = false,
  onClose,
}) => {
  const disabled = selected.length === 0 || isProcessing;

  return (
    <aside className="operacion-mass-actions">
      <div className="operacion-panel-header">
        <h4>Acciones masivas</h4>
        {onClose && (
          <button
            type="button"
            className="operacion-panel-close"
            onClick={onClose}
            aria-label="Cerrar acciones masivas"
          >
            ×
          </button>
        )}
      </div>
      <p>{selected.length} registros seleccionados</p>
      {isProcessing && <p>Ejecutando acción…</p>}
      <div>
        <button type="button" onClick={() => onRun('aprobar')} disabled={disabled}>
          Aprobar selección
        </button>
        <button type="button" onClick={() => onRun('recalcular')} disabled={disabled}>
          Recalcular métricas
        </button>
        <button type="button" onClick={() => onRun('cerrar')} disabled={disabled}>
          Cerrar turno
        </button>
      </div>
      {ultimoResultado && (
        <ul>
          <li>Última acción: {ultimoResultado.accion}</li>
          <li>Registros procesados: {ultimoResultado.registrosProcesados}</li>
          <li>Impacto existencias: {ultimoResultado.impactoExistencias}</li>
          <li>Impacto costos: {ultimoResultado.impactoCostos}</li>
          <li>{ultimoResultado.mensaje}</li>
        </ul>
      )}
    </aside>
  );
};

export default MassActionsDrawer;
