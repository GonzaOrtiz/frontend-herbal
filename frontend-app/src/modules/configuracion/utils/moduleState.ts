import { hasPermission } from '../stores/permissions.js';
import type { ConfigRoute } from '../types';

export interface RouteMeta {
  title: string;
  breadcrumb: string[];
  permissions: { read: string };
  featureFlag?: string;
  dependencies?: string[];
}

export interface RouteDefinition {
  id: string;
  meta: RouteMeta;
}

export function filterRoutesByFeatureFlags(
  routes: ConfigRoute[],
  featureFlags: Record<string, boolean>
): ConfigRoute[] {
  return routes.filter((route) => {
    const permissionOk = hasPermission(route.meta.permissions.read);
    const featureFlagOk = route.meta.featureFlag ? featureFlags[route.meta.featureFlag] : true;
    return permissionOk && featureFlagOk;
  });
}

export function getSyncStatus(route: RouteDefinition) {
  const flagName = `sync:${route.id}`;
  type SessionStorageLike = { getItem: (key: string) => string | null } | undefined;
  const globalStorage =
    typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis
      ? (globalThis as { sessionStorage?: SessionStorageLike }).sessionStorage
      : undefined;
  const storage = globalStorage ?? (globalThis as { sessionStorage?: SessionStorageLike }).sessionStorage;
  const shouldSync = storage ? Boolean(storage.getItem(flagName)) : false;
  if (!shouldSync) {
    return { inProgress: false } as const;
  }

  return {
    inProgress: true,
    message: `Sincronización en curso para ${route.meta.title}.`,
    etaMinutes: 3,
    affectedModules: route.meta.dependencies,
  };
}
