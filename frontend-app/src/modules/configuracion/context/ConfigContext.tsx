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
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ routes, children }) => {
  const [activeRouteId, setActiveRouteId] = useState<string>(() => routes[0]?.id ?? '');

  useEffect(() => {
    if (!routes.length) {
      setActiveRouteId('');
      return;
    }
    const exists = routes.some((route) => route.id === activeRouteId);
    if (!exists) {
      setActiveRouteId(routes[0].id);
    }
  }, [routes, activeRouteId]);

  const activeRoute = useMemo(() => routes.find((route) => route.id === activeRouteId), [routes, activeRouteId]);

  const value = useMemo<ConfigContextValue>(
    () => ({ routes, activeRoute, selectRoute: setActiveRouteId }),
    [routes, activeRoute]
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
