import React from 'react';
import { useConfigContext } from '../context/ConfigContext';
import '../configuracion.css';

const ConfigBreadcrumbs: React.FC = () => {
  const { activeRoute } = useConfigContext();

  if (!activeRoute) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="config-breadcrumbs">
      {activeRoute.meta.breadcrumb.map((crumb, index) => (
        <span key={crumb} className="config-breadcrumbs__item">
          {crumb}
          {index < activeRoute.meta.breadcrumb.length - 1 && (
            <span aria-hidden="true" className="config-breadcrumbs__separator">
              /
            </span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default ConfigBreadcrumbs;
