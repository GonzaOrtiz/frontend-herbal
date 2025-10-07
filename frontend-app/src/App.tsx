import { useEffect, useState } from 'react';
import ConfiguracionModule from './modules/configuracion';
import './App.css';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [openSections, setOpenSections] = useState({ overview: true, shortcuts: false });

  useEffect(() => {
    const handleResize = () => {
      setIsDrawerOpen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            onClick={() => setIsDrawerOpen((open) => !open)}
            aria-expanded={isDrawerOpen}
            aria-controls="app-sidebar"
          >
            {isDrawerOpen ? 'Ocultar panel' : 'Mostrar panel'}
          </button>

          <aside
            id="app-sidebar"
            className="app-sidebar"
            aria-label="Panel contextual de configuración"
            data-open={isDrawerOpen}
          >
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
                  Consulta el estado general de los catálogos y mantén visibles las dependencias clave antes de publicar
                  cambios.
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
