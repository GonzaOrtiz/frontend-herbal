import React from 'react';

interface Props {
  closeReason?: string;
  expectedUnlockAt?: string;
  responsable?: string;
}

const CloseDayBanner: React.FC<Props> = ({ closeReason, expectedUnlockAt, responsable }) => {
  return (
    <div className="close-day-banner" role="alert">
      <strong>Captura bloqueada</strong>
      <span>{closeReason ?? 'El backend reportó un cierre pendiente.'}</span>
      {expectedUnlockAt && <span>Desbloqueo estimado: {new Date(expectedUnlockAt).toLocaleString('es-MX')}</span>}
      {responsable && <span>Responsable asignado: {responsable}</span>}
    </div>
  );
};

export default CloseDayBanner;
