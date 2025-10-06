import React, { useMemo } from 'react';
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

  const routes = useMemo(() => filterRoutesByFeatureFlags(buildConfigRoutes(), featureFlags), [featureFlags]);

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
        {activeRoute.element}
      </ProtectedRoute>
    </div>
  );
};

export default ConfiguracionModule;
