import React from 'react';
import type { AccionMasivaResultado } from '../types';

interface Props {
  selected: string[];
  onRun: (accion: 'aprobar' | 'recalcular' | 'cerrar') => void;
  ultimoResultado?: AccionMasivaResultado;
}

const MassActionsDrawer: React.FC<Props> = ({ selected, onRun, ultimoResultado }) => {
  return (
    <aside className="operacion-mass-actions">
      <h4>Acciones masivas</h4>
      <p>{selected.length} registros seleccionados</p>
      <div>
        <button type="button" onClick={() => onRun('aprobar')} disabled={selected.length === 0}>
          Aprobar selección
        </button>
        <button type="button" onClick={() => onRun('recalcular')} disabled={selected.length === 0}>
          Recalcular métricas
        </button>
        <button type="button" onClick={() => onRun('cerrar')} disabled={selected.length === 0}>
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
