import React, { useMemo, useEffect } from 'react';
import ConfigBreadcrumbs from './components/ConfigBreadcrumbs';
import ConfigNavBar from './components/ConfigNavBar';
import ProtectedRoute from './components/ProtectedRoute';
import SyncBanner from './components/SyncBanner';
import { ConfigProvider, useConfigContext } from './context/ConfigContext';
import { ToastProvider } from './context/ToastContext';
import { useFeatureFlags } from './stores/featureFlags';
import { buildConfigRoutes } from './routes';
import { filterRoutesByFeatureFlags, getSyncStatus } from './utils/moduleState';
import './configuracion.css';

const ConfiguracionModule: React.FC = () => {
  const featureFlags = useFeatureFlags();

  const routes = useMemo(() => {
    const filteredRoutes = filterRoutesByFeatureFlags(buildConfigRoutes(), featureFlags);
    console.log('Feature Flags:', featureFlags);
    console.log('Rutas generadas:', buildConfigRoutes());
    console.log('Rutas filtradas:', filteredRoutes);
    return filteredRoutes;
  }, [featureFlags]);

  useEffect(() => {
    if (routes.length === 0) {
      console.warn('No se encontraron rutas habilitadas. Verifica los feature flags y permisos.');
    }
  }, [routes]);

  return (
    <ToastProvider>
      <ConfigProvider routes={routes}>
        <div className="configuracion-module">
          <ConfigBreadcrumbs />
          <ConfigNavBar />
          <RouteContainer />
        </div>
      </ConfigProvider>
    </ToastProvider>
  );
};

const RouteContainer: React.FC = () => {
  const { activeRoute } = useConfigContext();

  if (!activeRoute) {
    return <div className="config-alert">No hay catálogos habilitados. Activa los feature flags correspondientes.</div>;
  }

  const syncStatus = getSyncStatus(activeRoute);

  return (
    <div>
      <SyncBanner status={syncStatus} catalogName={activeRoute.meta.title} />
      <ProtectedRoute permissions={[activeRoute.meta.permissions.read]}>
        {activeRoute.element as React.ReactNode}
      </ProtectedRoute>
    </div>
  );
};

export default ConfiguracionModule;
