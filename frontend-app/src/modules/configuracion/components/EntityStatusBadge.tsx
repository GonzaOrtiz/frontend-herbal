import React from 'react';
import type { CatalogEntityStatus } from '../types';
import '../configuracion.css';

const statusLabels: Record<CatalogEntityStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  sincronizando: 'Sincronizando',
};

interface EntityStatusBadgeProps {
  status: CatalogEntityStatus;
  reason?: string;
}

const EntityStatusBadge: React.FC<EntityStatusBadgeProps> = ({ status, reason }) => (
  <span className={`badge badge--${status}`} title={reason ?? statusLabels[status]}>
    {statusLabels[status]}
    {reason && <span aria-hidden="true">•</span>}
  </span>
);

export default EntityStatusBadge;
