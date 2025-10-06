import React from 'react';
import Chip from '@mui/material/Chip';

export type EntityStatus = 'activo' | 'inactivo' | 'sincronizando';

const statusMap = {
  activo: { label: 'Activo', color: 'success' },
  inactivo: { label: 'Inactivo', color: 'default' },
  sincronizando: { label: 'Sincronizando', color: 'warning' },
};

const EntityStatusBadge: React.FC<{ status: EntityStatus }> = ({ status }) => {
  const { label, color } = statusMap[status] || { label: 'Desconocido', color: 'default' };
  return <Chip label={label} color={color as any} size="small" />;
};

export default EntityStatusBadge;
