import React from 'react';
import type { SyncStatus } from '../types';

interface Props {
  status: SyncStatus | 'error';
  children: React.ReactNode;
}

const statusClass: Record<Props['status'], string> = {
  synced: 'operacion-chip sync',
  processing: 'operacion-chip processing',
  error: 'operacion-chip error',
  stale: 'operacion-chip stale',
};

const SyncStatusBadge: React.FC<Props> = ({ status, children }) => {
  return <span className={statusClass[status] ?? statusClass.synced}>{children}</span>;
};

export default SyncStatusBadge;
