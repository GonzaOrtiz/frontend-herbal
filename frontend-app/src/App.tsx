import { useEffect, useMemo, useState } from 'react';
import ConfiguracionModule from './modules/configuracion';
import OperacionModule from './modules/operacion';
import { buildOperacionRoutes } from './modules/operacion/routes';
import type { OperacionModulo } from './modules/operacion/types';
import './App.css';

type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: JSX.Element;
};
type DomainKey = 'configuracion' | 'operacion';

type DomainAction = {
  label: string;
  variant?: 'primary' | 'default';
};

type SidebarStat = {
  value: string;
  label: string;
};

type DomainConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  logo: string;
  actions: DomainAction[];
  overview: {
    description: string;
    stats: SidebarStat[];
  };
  shortcuts: string[];
};

type SidebarIconName =
  | 'dashboard'
  | 'sliders'
  | 'factory'
  | 'users'
  | 'workflow'
  | 'consumos'
  | 'producciones'
  | 'litros'
  | 'perdidas'
  | 'sobrantes';

type EnhancedNavItem = NavItem & {
  onSelect?: () => void;
  isActive?: boolean;
};

const buildConfiguracionNavigation = (): EnhancedNavItem[] => [
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

const domainConfigs: Record<DomainKey, DomainConfig> = {
  configuracion: {
    eyebrow: 'Suite Herbal ERP',
    title: 'Configuración y catálogos',
    subtitle: 'Administra los catálogos maestros y parámetros generales utilizados por los módulos operativos.',
    logo: '🌿',
    actions: [
      { label: 'Agregar catálogo', variant: 'primary' },
      { label: 'Centro de ayuda' },
    ],
    overview: {
      description:
        'Consulta el estado general de los catálogos y mantén visibles las dependencias clave antes de publicar cambios.',
      stats: [
        { value: '4', label: 'Catálogos activos' },
        { value: '3', label: 'Dependencias críticas' },
        { value: 'En línea', label: 'Estado de sincronización' },
      ],
    },
    shortcuts: ['Revisar dependencias', 'Programar sincronización', 'Descargar respaldo'],
  },
  operacion: {
    eyebrow: 'Suite Herbal ERP · Operación',
    title: 'Operación diaria',
    subtitle:
      'Captura y monitorea consumos, producciones, litros, pérdidas y sobrantes con trazabilidad y cierres controlados.',
    logo: '🛠️',
    actions: [
      { label: 'Nueva importación', variant: 'primary' },
      { label: 'Ver bitácoras' },
    ],
    overview: {
      description:
        'Supervisa la captura diaria, valida cierres pendientes y sincroniza los módulos dependientes en tiempo real.',
      stats: [
        { value: '5', label: 'Turnos abiertos' },
        { value: '2', label: 'Bloqueos activos' },
        { value: '92%', label: 'Sincronización completada' },
      ],
    },
    shortcuts: ['Revisar consumos pendientes', 'Descargar bitácoras', 'Configurar alertas'],
  },
};

const domainEntries: { id: DomainKey; label: string }[] = [
  { id: 'configuracion', label: 'Configuración' },
  { id: 'operacion', label: 'Operación diaria' },
];

function SidebarIcon({ name }: { name: SidebarIconName }) {
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
    case 'consumos':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 2c-1.657 0-3 1.79-3 4v1H7a3 3 0 0 0-3 3v2h16V10a3 3 0 0 0-3-3h-2V6c0-2.21-1.343-4-3-4zm-8 12v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4H4z"
            fill="currentColor"
          />
        </svg>
      );
    case 'producciones':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 4h4l2 3h4l2-3h4v6h-4l-2 3h-4l-2-3H4zM4 18h16v2H4z"
            fill="currentColor"
          />
        </svg>
      );
    case 'litros':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 2 7 9c0 3.314 2.239 6 5 6s5-2.686 5-6l-5-7zm0 20a5 5 0 0 1-5-5h2a3 3 0 0 0 6 0h2a5 5 0 0 1-5 5z"
            fill="currentColor"
          />
        </svg>
      );
    case 'perdidas':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 2 3 22h18L12 2zm0 4 6.16 14H5.84L12 6zm-1 5v5h2v-5h-2zm0 6v2h2v-2h-2z"
            fill="currentColor"
          />
        </svg>
      );
    case 'sobrantes':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 4h16v10H5.414L4 15.414V4zm6 14h10v2H10v-2z"
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
  const [activeDomain, setActiveDomain] = useState<DomainKey>('configuracion');
  const [operacionModulo, setOperacionModulo] = useState<OperacionModulo>('consumos');

  const operacionRoutes = useMemo(() => buildOperacionRoutes(), []);
  const navigationItems = useMemo<EnhancedNavItem[]>(() => {
    if (activeDomain === 'operacion') {
      return operacionRoutes.map((route) => ({
        id: route.id,
        label: route.title,
        description: route.description,
        icon: <SidebarIcon name={route.id} />,
        onSelect: () => {
          setOperacionModulo(route.id);
          if (isCompactViewport) {
            setIsSidebarVisible(false);
          }
        },
        isActive: route.id === operacionModulo,
      }));
    }
    return buildConfiguracionNavigation();
  }, [activeDomain, operacionRoutes, operacionModulo, isCompactViewport, setIsSidebarVisible]);

  const domainConfig = domainConfigs[activeDomain];

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

  const isSidebarOpen = isCompactViewport ? isSidebarVisible : isSidebarExpanded;
  const toggleLabel = isCompactViewport
    ? isSidebarVisible
      ? 'Cerrar panel'
      : 'Abrir panel'
    : isSidebarExpanded
      ? 'Contraer panel'
      : 'Expandir panel';

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="app-navbar__content">
          <div className="app-navbar__start">
            {isCompactViewport && (
              <button
                type="button"
                className="app-navbar__toggle app-toggle-button"
                onClick={toggleSidebar}
                aria-expanded={isSidebarOpen}
                aria-controls="app-sidebar"
                aria-label={toggleLabel}
                title={toggleLabel}
                data-open={isSidebarOpen}
              >
                <span className="sr-only">{toggleLabel}</span>
                <span className="app-toggle-button__icon" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
            )}

            <div className="app-navbar__brand">
              <div className="app-navbar__logo" aria-hidden="true">
                {domainConfig.logo}
              </div>
              <div className="app-navbar__headline">
                <p className="app-navbar__eyebrow">{domainConfig.eyebrow}</p>
                <h1 className="app-navbar__title">{domainConfig.title}</h1>
                <p className="app-navbar__subtitle">{domainConfig.subtitle}</p>
                <div className="app-navbar__domains" role="tablist" aria-label="Dominios principales">
                  {domainEntries.map((entry) => {
                    const isActive = entry.id === activeDomain;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        role="tab"
                        className="app-navbar__domain-button"
                        aria-selected={isActive}
                        data-active={isActive}
                        onClick={() => setActiveDomain(entry.id)}
                      >
                        {entry.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="app-navbar__actions" aria-label="Acciones rápidas">
            {domainConfig.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`app-navbar__action${action.variant === 'primary' ? ' app-navbar__action--primary' : ''}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="app-shell__content">
        <div className="app-layout">
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
              <div className="app-sidebar__controls">
                <button
                  type="button"
                  className="app-sidebar__toggle app-toggle-button"
                  onClick={toggleSidebar}
                  aria-expanded={isSidebarOpen}
                  aria-controls="app-sidebar"
                  aria-label={toggleLabel}
                  title={toggleLabel}
                  data-open={isSidebarOpen}
                >
                  <span className="sr-only">{toggleLabel}</span>
                  <span className="app-toggle-button__icon" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>
              <nav className="app-sidebar__nav" aria-label="Secciones principales">
                <ul>
                  {navigationItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="app-sidebar__nav-item"
                        aria-label={item.label}
                        tabIndex={0}
                        onClick={item.onSelect}
                        data-active={item.isActive ?? false}
                        aria-pressed={item.isActive ?? undefined}
                        aria-current={item.isActive ? 'page' : undefined}
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
                  <p className="app-sidebar__description">{domainConfig.overview.description}</p>
                  <ul className="app-sidebar__stats">
                    {domainConfig.overview.stats.map((stat) => (
                      <li key={stat.label} className="app-sidebar__stat">
                        <span className="app-sidebar__stat-value">{stat.value}</span>
                        <span className="app-sidebar__stat-label">{stat.label}</span>
                      </li>
                    ))}
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
                    {domainConfig.shortcuts.map((shortcut) => (
                      <li key={shortcut}>
                        <button type="button" className="app-sidebar__link">
                          {shortcut}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </aside>

          <main className="app-main">
            {activeDomain === 'configuracion' ? (
              <ConfiguracionModule />
            ) : (
              <OperacionModule initialModulo={operacionModulo} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
