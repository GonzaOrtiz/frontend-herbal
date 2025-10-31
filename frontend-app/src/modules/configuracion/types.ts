import type { ReactNode } from 'react';

export type CatalogEntityStatus = 'activo' | 'inactivo' | 'sincronizando';

export interface AuditInfo {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  changeReason?: string;
}

export interface CatalogEntityBase {
  id: string;
  nombre: string;
  estado: CatalogEntityStatus;
  audit: AuditInfo;
}

export interface SyncStatus {
  inProgress: boolean;
  message?: string;
  etaMinutes?: number;
  affectedModules?: string[];
}

export interface ConfigRouteMeta {
  title: string;
  description: string;
  breadcrumb: string[];
  permissions: {
    read: string;
    write?: string;
  };
  featureFlag?: FeatureFlagKey;
  dependencies?: string[];
  secondaryNavLabel?: string;
}

export interface ConfigRoute {
  id: string;
  path: string;
  meta: ConfigRouteMeta;
  element: ReactNode;
}

export type FeatureFlagKey =
  | 'catalogoActividades'
  | 'catalogoEmpleados'
  | 'catalogoCentros'
  | 'parametrosGenerales'
  | 'catalogoCentrosApoyo';

export interface CatalogFilterState {
  search: string;
  status: CatalogEntityStatus | 'todos';
  updatedBy?: string;
}

export interface CatalogMutationContext<TData> {
  previous?: TData;
  optimisticId?: string;
}

export interface CatalogMutationOptions<TEntity> {
  invalidateKeys: string[];
  optimistic?: (data: TEntity[]) => TEntity[];
}

export type CatalogId = string;
