import React from 'react';
import { useOperacionFilters } from '../hooks/useOperacionFilters';
import type { VistaModuloConfig } from '../types';

interface Props {
  config: VistaModuloConfig;
}

const OperacionFilterBar: React.FC<Props> = ({ config }) => {
  const { modulo, setModulo, filtros, updateFiltros } = useOperacionFilters();

  const handleChange = (field: keyof typeof filtros) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFiltros({ [field]: event.target.value } as never);
  };

  const handleDate = (field: 'desde' | 'hasta') => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFiltros({ rango: { ...(filtros.rango ?? { desde: filtros.calculationDate, hasta: filtros.calculationDate }), [field]: event.target.value } });
  };

  return (
    <section className="operacion-filtros">
      <label>
        Módulo
        <select value={modulo} onChange={(event) => setModulo(event.target.value as typeof modulo)}>
          <option value="consumos">Consumos</option>
          <option value="producciones">Producciones</option>
          <option value="litros">Litros</option>
          <option value="perdidas">Pérdidas</option>
          <option value="sobrantes">Sobrantes</option>
        </select>
      </label>
      <label>
        Fecha cálculo
        <input type="date" value={filtros.calculationDate} onChange={handleChange('calculationDate')} />
      </label>
      {config.filtrosDisponibles.includes('centro') && (
        <label>
          Centro
          <input value={filtros.centro ?? ''} onChange={handleChange('centro')} />
        </label>
      )}
      {config.filtrosDisponibles.includes('producto') && (
        <label>
          Producto
          <input value={filtros.producto ?? ''} onChange={handleChange('producto')} />
        </label>
      )}
      {config.filtrosDisponibles.includes('actividad') && (
        <label>
          Actividad
          <input value={filtros.actividad ?? ''} onChange={handleChange('actividad')} />
        </label>
      )}
      {config.filtrosDisponibles.includes('orden') && (
        <label>
          Orden
          <input value={filtros.orden ?? ''} onChange={handleChange('orden')} />
        </label>
      )}
      {config.filtrosDisponibles.includes('lote') && (
        <label>
          Lote
          <input value={filtros.lote ?? ''} onChange={handleChange('lote')} />
        </label>
      )}
      {config.filtrosDisponibles.includes('turno') && (
        <label>
          Turno
          <input value={filtros.turno ?? ''} onChange={handleChange('turno')} />
        </label>
      )}
      {config.filtrosDisponibles.includes('rango') && filtros.rango && (
        <label>
          Desde
          <input type="date" value={filtros.rango.desde} onChange={handleDate('desde')} />
        </label>
      )}
      {config.filtrosDisponibles.includes('rango') && filtros.rango && (
        <label>
          Hasta
          <input type="date" value={filtros.rango.hasta} onChange={handleDate('hasta')} />
        </label>
      )}
    </section>
  );
};

export default OperacionFilterBar;
