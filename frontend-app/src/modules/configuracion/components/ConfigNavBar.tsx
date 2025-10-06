import React from 'react';
import { useConfigContext } from '../context/ConfigContext';
import '../configuracion.css';

const ConfigNavBar: React.FC = () => {
  const { routes, activeRoute, selectRoute } = useConfigContext();

  return (
    <nav className="config-nav" aria-label="Navegación secundaria">
      {routes.map((route) => (
        <button
          key={route.id}
          type="button"
          className={`config-nav__item ${activeRoute?.id === route.id ? 'config-nav__item--active' : ''}`}
          onClick={() => selectRoute(route.id)}
          aria-current={activeRoute?.id === route.id ? 'page' : undefined}
        >
          {route.meta.secondaryNavLabel ?? route.meta.title}
        </button>
      ))}
    </nav>
  );
};

export default ConfigNavBar;
