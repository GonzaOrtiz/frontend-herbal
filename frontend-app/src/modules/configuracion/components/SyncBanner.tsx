import React from 'react';
import { SyncStatus } from '../types';
import '../configuracion.css';

interface SyncBannerProps {
  status: SyncStatus;
  catalogName: string;
}

const SyncBanner: React.FC<SyncBannerProps> = ({ status, catalogName }) => {
  if (!status.inProgress) {
    return null;
  }

  return (
    <div className="sync-banner" role="status" aria-live="polite">
      <strong>{catalogName} en sincronización.</strong>
      <p>
        {status.message ?? 'Los datos están actualizándose desde el backend.'}
        {status.etaMinutes !== undefined && ` Tiempo estimado restante: ${status.etaMinutes} minutos.`}
      </p>
      {status.affectedModules && status.affectedModules.length > 0 && (
        <p>
          Módulos afectados:{' '}
          {status.affectedModules.join(', ')}
        </p>
      )}
    </div>
  );
};

export default SyncBanner;
