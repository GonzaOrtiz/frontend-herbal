import React from 'react';
import { formatDate } from '../utils/format';

interface Props {
  closeReason?: string;
  expectedUnlockAt?: string;
  responsable?: string;
}

const CloseDayBanner: React.FC<Props> = ({ closeReason, expectedUnlockAt, responsable }) => {
  let unlockText: string | null = null;
  if (expectedUnlockAt) {
    const baseDate = new Date(expectedUnlockAt);
    if (Number.isNaN(baseDate.getTime())) {
      unlockText = expectedUnlockAt;
    } else {
      const time = baseDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      });
      unlockText = `${formatDate(expectedUnlockAt)} ${time}`;
    }
  }

  return (
    <div className="close-day-banner" role="alert">
      <strong>Captura bloqueada</strong>
      <span>{closeReason ?? 'El backend reportó un cierre pendiente.'}</span>
      {unlockText && <span>Desbloqueo estimado: {unlockText}</span>}
      {responsable && <span>Responsable asignado: {responsable}</span>}
    </div>
  );
};

export default CloseDayBanner;
