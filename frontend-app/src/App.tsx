import ConfiguracionModule from './modules/configuracion';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1>Configuración y catálogos</h1>
        <p className="app-shell__subtitle">
          Administra los catálogos maestros y parámetros generales utilizados por los módulos operativos.
        </p>
      </header>
      <section className="app-shell__content">
        <ConfiguracionModule />
      </section>
    </div>
  );
}

export default App;
