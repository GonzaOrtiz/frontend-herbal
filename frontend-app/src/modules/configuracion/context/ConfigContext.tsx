import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ConfigRoute } from '../types';

interface ConfigContextValue {
  routes: ConfigRoute[];
  activeRoute: ConfigRoute | undefined;
  selectRoute: (routeId: string) => void;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

interface ConfigProviderProps {
  routes: ConfigRoute[];
  children: React.ReactNode;
  activeRouteId?: string;
  onRouteChange?: (routeId: string) => void;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  routes,
  children,
  activeRouteId: externalActiveRouteId,
  onRouteChange,
}) => {
  const [internalActiveRouteId, setInternalActiveRouteId] = useState<string>(() => routes[0]?.id ?? '');

  useEffect(() => {
    if (!routes.length) {
      setInternalActiveRouteId('');
      return;
    }

    setInternalActiveRouteId((current) => {
      if (routes.some((route) => route.id === current)) {
        return current;
      }
      const fallbackId = routes[0].id;
      if (!externalActiveRouteId) {
        onRouteChange?.(fallbackId);
      }
      return fallbackId;
    });
  }, [routes, externalActiveRouteId, onRouteChange]);

  useEffect(() => {
    if (!externalActiveRouteId) {
      return;
    }
    const exists = routes.some((route) => route.id === externalActiveRouteId);
    if (!exists && routes[0]) {
      onRouteChange?.(routes[0].id);
    }
  }, [externalActiveRouteId, routes, onRouteChange]);

  const resolvedActiveRouteId = useMemo(() => {
    if (externalActiveRouteId && routes.some((route) => route.id === externalActiveRouteId)) {
      return externalActiveRouteId;
    }
    return internalActiveRouteId;
  }, [externalActiveRouteId, routes, internalActiveRouteId]);

  const activeRoute = useMemo(
    () => routes.find((route) => route.id === resolvedActiveRouteId),
    [routes, resolvedActiveRouteId]
  );

  const selectRoute = useMemo<ConfigContextValue['selectRoute']>(() => {
    return (routeId: string) => {
      if (!routes.some((route) => route.id === routeId)) {
        return;
      }
      if (externalActiveRouteId && onRouteChange) {
        onRouteChange(routeId);
        return;
      }

      setInternalActiveRouteId(routeId);
      onRouteChange?.(routeId);
    };
  }, [externalActiveRouteId, onRouteChange, routes]);

  const value = useMemo<ConfigContextValue>(
    () => ({ routes, activeRoute, selectRoute }),
    [routes, activeRoute, selectRoute]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext debe usarse dentro de ConfigProvider');
  }
  return context;
}
