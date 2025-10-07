import { useEffect, useMemo, useState } from 'react';
import ConfiguracionModule from './modules/configuracion';
import './App.css';

type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: JSX.Element;
};

const buildNavigation = (): NavItem[] => [
  {
    id: 'overview',
    label: 'Panel general',
    description: 'Monitorea el estado global de los catálogos y sus dependencias.',
    icon: <SidebarIcon name="dashboard" />,
  },
  {
    id: 'parametros',
    label: 'Parámetros generales',
    description: 'Ajusta políticas y parámetros maestros del sistema.',
    icon: <SidebarIcon name="sliders" />,
  },
  {
    id: 'centros',
    label: 'Centros de producción',
    description: 'Administra ubicaciones, responsables y capacidades.',
    icon: <SidebarIcon name="factory" />,
  },
  {
    id: 'empleados',
    label: 'Personal operativo',
    description: 'Gestiona credenciales, roles y perfiles por área.',
    icon: <SidebarIcon name="users" />,
  },
  {
    id: 'actividades',
    label: 'Actividades',
    description: 'Define etapas de producción y tareas dependientes.',
    icon: <SidebarIcon name="workflow" />,
  },
];

function SidebarIcon({ name }: { name: 'dashboard' | 'sliders' | 'factory' | 'users' | 'workflow' }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 13h6v7H4zm10-9h6v16h-6zM4 4h6v7H4zm10 9h6v7h-6z" fill="currentColor" />
        </svg>
      );
    case 'sliders':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M9 5a2 2 0 1 1-4 0H3V3h2a2 2 0 1 1 4 0h12v2H9zm8 8a2 2 0 1 1 4 0h2v2h-2a2 2 0 1 1-4 0H3v-2h14zm-8 6a2 2 0 1 1-4 0H3v-2h2a2 2 0 1 1 4 0h12v2H9z"
            fill="currentColor"
          />
        </svg>
      );
    case 'factory':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M3 21V9l6 4V9l6 4V5l6 3v13H3zm12-7h2v-2h-2zm0 4h2v-2h-2zm-4-4h2v-2h-2zm0 4h2v-2h-2z"
            fill="currentColor"
          />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-4 6c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4zm8-7a3 3 0 1 0-6 0 3 3 0 0 0 6 0zm-1 7c1.298.607 2 1.398 2 2.3V21h-3v-2c0-.673-.342-1.3-.959-1.87z"
            fill="currentColor"
          />
        </svg>
      );
    case 'workflow':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M7 4h10v6H7zm12 14h-4v-4h-2v4H5v-6h4v-4h2v4h6V8h2z"
            fill="currentColor"
          />
        </svg>
      );
    default:
      return null;
  }
}

function App() {
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [openSections, setOpenSections] = useState({ overview: true, shortcuts: false });

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 1024;
      setIsCompactViewport(compact);
      setIsSidebarVisible(!compact);
      setIsSidebarExpanded(!compact);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = useMemo(() => buildNavigation(), []);

  const toggleSidebar = () => {
    if (isCompactViewport) {
      setIsSidebarVisible((visible) => {
        const nextVisible = !visible;
        if (nextVisible) {
          setIsSidebarExpanded(true);
        }
        return nextVisible;
      });
    } else {
      setIsSidebarExpanded((expanded) => !expanded);
    }
  };

  const closeSidebar = () => {
    if (isCompactViewport) {
      setIsSidebarVisible(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="app-navbar__content">
          <div className="app-navbar__brand">
            <div className="app-navbar__logo" aria-hidden="true">
              🌿
            </div>
            <div className="app-navbar__headline">
              <p className="app-navbar__eyebrow">Suite Herbal ERP</p>
              <h1 className="app-navbar__title">Configuración y catálogos</h1>
              <p className="app-navbar__subtitle">
                Administra los catálogos maestros y parámetros generales utilizados por los módulos operativos.
              </p>
            </div>
          </div>
          <div className="app-navbar__actions" aria-label="Acciones rápidas">
            <button type="button" className="app-navbar__action app-navbar__action--primary">
              Agregar catálogo
            </button>
            <button type="button" className="app-navbar__action">Centro de ayuda</button>
          </div>
        </div>
      </header>

      <div className="app-shell__content">
        <div className="app-layout">
          <button
            type="button"
            className="app-sidebar__toggle"
            onClick={toggleSidebar}
            aria-expanded={isCompactViewport ? isSidebarVisible : isSidebarExpanded}
            aria-controls="app-sidebar"
          >
            {isCompactViewport
              ? isSidebarVisible
                ? 'Cerrar panel'
                : 'Abrir panel'
              : isSidebarExpanded
                ? 'Contraer panel'
                : 'Expandir panel'}
          </button>

          {isCompactViewport && isSidebarVisible && (
            <button type="button" className="app-sidebar__backdrop" aria-label="Cerrar panel" onClick={closeSidebar} />
          )}

          <aside
            id="app-sidebar"
            className="app-sidebar"
            aria-label="Panel contextual de configuración"
            data-expanded={isSidebarExpanded}
            data-visible={isSidebarVisible}
            data-compact={isCompactViewport}
          >
            <div className="app-sidebar__content">
              <nav className="app-sidebar__nav" aria-label="Secciones principales">
                <ul>
                  {navigationItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="app-sidebar__nav-item"
                        aria-label={item.label}
                        tabIndex={0}
                      >
                        <span className="app-sidebar__nav-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        <span className="app-sidebar__nav-text">
                          <span className="app-sidebar__nav-label">{item.label}</span>
                          <span className="app-sidebar__nav-description">{item.description}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <section className={`app-sidebar__section ${openSections.overview ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="app-sidebar__section-toggle"
                  onClick={() => toggleSection('overview')}
                  aria-expanded={openSections.overview}
                >
                  <span>Resumen del panel</span>
                  <span aria-hidden="true">{openSections.overview ? '−' : '+'}</span>
                </button>
                <div className="app-sidebar__section-body" hidden={!openSections.overview}>
                  <p className="app-sidebar__description">
                    Consulta el estado general de los catálogos y mantén visibles las dependencias clave antes de
                    publicar cambios.
                  </p>
                  <ul className="app-sidebar__stats">
                    <li className="app-sidebar__stat">
                      <span className="app-sidebar__stat-value">4</span>
                      <span className="app-sidebar__stat-label">Catálogos activos</span>
                    </li>
                    <li className="app-sidebar__stat">
                      <span className="app-sidebar__stat-value">3</span>
                      <span className="app-sidebar__stat-label">Dependencias críticas</span>
                    </li>
                    <li className="app-sidebar__stat">
                      <span className="app-sidebar__stat-value">En línea</span>
                      <span className="app-sidebar__stat-label">Estado de sincronización</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className={`app-sidebar__section ${openSections.shortcuts ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="app-sidebar__section-toggle"
                  onClick={() => toggleSection('shortcuts')}
                  aria-expanded={openSections.shortcuts}
                >
                  <span>Atajos recomendados</span>
                  <span aria-hidden="true">{openSections.shortcuts ? '−' : '+'}</span>
                </button>
                <div className="app-sidebar__section-body" hidden={!openSections.shortcuts}>
                  <ul className="app-sidebar__links">
                    <li>
                      <button type="button" className="app-sidebar__link">
                        Revisar dependencias
                      </button>
                    </li>
                    <li>
                      <button type="button" className="app-sidebar__link">
                        Programar sincronización
                      </button>
                    </li>
                    <li>
                      <button type="button" className="app-sidebar__link">
                        Descargar respaldo
                      </button>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </aside>

          <main className="app-main">
            <ConfiguracionModule />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
