import React from 'react';
import '@/App.css';

const HomePage: React.FC = () => {
  return (
    <div className="app-home" style={{ padding: '2rem' }}>
      <h1>Suite Herbal ERP</h1>
      <p>
        Selecciona un dominio desde la navegación principal para comenzar a trabajar con los módulos de
        configuración, operación, costos e informes.
      </p>
      <p>
        Esta vista inicial actúa como placeholder para el dashboard principal y asegura que la aplicación pueda
        cargarse correctamente en entornos de despliegue como Netlify.
      </p>
    </div>
  );
};

export default HomePage;
