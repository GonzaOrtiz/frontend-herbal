import ConfiguracionModule from './modules/configuracion';
import './App.css';

function App() {
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
          <aside className="app-sidebar" aria-label="Panel contextual de configuración">
          <section className="app-sidebar__section">
            <h2 className="app-sidebar__title">Resumen del panel</h2>
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
          </section>

          <section className="app-sidebar__section">
            <h3 className="app-sidebar__subtitle">Atajos recomendados</h3>
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
