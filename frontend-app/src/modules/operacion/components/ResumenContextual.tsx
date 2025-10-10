import React from 'react';
import type { ResumenContextual } from '../types';
import { formatDate } from '../utils/format';
import SyncStatusBadge from './SyncStatusBadge';
import CloseDayBanner from './CloseDayBanner';

interface Props {
  resumen: ResumenContextual | null;
  totalRegistros: number;
  lastEvent?: string;
}

const ResumenContextualSection: React.FC<Props> = ({ resumen, totalRegistros, lastEvent }) => {
  return (
    <div className="operacion-resumen" role="status" aria-live="polite">
      <div>
        <strong>{resumen?.centro ?? 'Centro sin asignar'}</strong>
        <div>
          Fecha cálculo: {resumen?.calculationDate ? formatDate(resumen.calculationDate) : 'N/D'}
        </div>
        {resumen?.responsable && <div>Responsable: {resumen.responsable}</div>}
      </div>
      <div>
        <SyncStatusBadge status={resumen?.bloqueado ? 'error' : 'synced'}>
          {totalRegistros} registros visibles
        </SyncStatusBadge>
        {lastEvent && <small>Último evento: {lastEvent}</small>}
      </div>
      {resumen?.bloqueado && (
        <CloseDayBanner
          closeReason={resumen.closeReason}
          expectedUnlockAt={resumen.expectedUnlockAt}
          responsable={resumen.responsable}
        />
      )}
    </div>
  );
};

export default ResumenContextualSection;
