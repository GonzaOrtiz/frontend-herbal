import React, { useMemo } from 'react';
import { useCentros } from '../../configuracion/hooks/useCentros';
import { useCostosContext } from '../context/CostosContext';
import '../costos.css';

const CostosFilterBar: React.FC = () => {
  const { submodule, filters, updateFilters, resetFilters } = useCostosContext();
  const catalog = useCentros();

  const centros = useMemo(
    () =>
      [...catalog.items]
        .map((centro) => ({
          id: centro.id,
          nombre: centro.nombre,
          value: centro.nroCentro.toString(),
          label: `${centro.nroCentro.toString().padStart(3, '0')} · ${centro.nombre}`.trim(),
        }))
        .sort((a, b) => Number(a.value) - Number(b.value)),
    [catalog.items],
  );

  return (
    <form
      className="costos-filter-bar"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="costos-filter-field">
        <label htmlFor="costos-centro">Centro</label>
        <select
          id="costos-centro"
          value={filters.centro ?? ''}
          onChange={(event) => updateFilters({ centro: event.target.value || undefined })}
        >
          <option value="">Todos</option>
          {centros.map((centro) => (
            <option key={centro.id} value={centro.value}>
              {centro.label}
            </option>
          ))}
        </select>
      </div>

      <div className="costos-filter-field">
        <label htmlFor="costos-fecha">Fecha cálculo</label>
        <input
          id="costos-fecha"
          type="date"
          value={filters.calculationDate}
          onChange={(event) => updateFilters({ calculationDate: event.target.value })}
          required
        />
      </div>

      {(submodule === 'gastos' || submodule === 'sueldos') && (
        <div className="costos-filter-field">
          <label htmlFor="costos-periodo">Gasto del periodo</label>
          <select
            id="costos-periodo"
            value={filters.esGastoDelPeriodo === undefined ? '' : filters.esGastoDelPeriodo ? 'true' : 'false'}
            onChange={(event) => {
              const value = event.target.value;
              updateFilters({
                esGastoDelPeriodo: value === '' ? undefined : value === 'true',
              });
            }}
          >
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      )}

      {submodule === 'sueldos' && (
        <div className="costos-filter-field">
          <label htmlFor="costos-empleado">Empleado</label>
          <input
            id="costos-empleado"
            type="number"
            min={0}
            value={filters.nroEmpleado ?? ''}
            onChange={(event) =>
              updateFilters({ nroEmpleado: event.target.value ? Number(event.target.value) : null })
            }
            placeholder="Nro empleado"
          />
        </div>
      )}

      {submodule === 'gastos' && (
        <div className="costos-filter-field">
          <label htmlFor="costos-concepto">Concepto</label>
          <input
            id="costos-concepto"
            value={filters.concepto ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              const trimmed = value.trim();
              updateFilters({ concepto: trimmed.length > 0 ? trimmed : undefined });
            }}
            placeholder="Buscar por centro o concepto"
            autoComplete="off"
            inputMode="search"
          />
        </div>
      )}

      <div className="costos-filter-actions">
        <button type="submit" className="primary">
          Aplicar filtros
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => {
            resetFilters();
          }}
        >
          Restablecer
        </button>
      </div>
    </form>
  );
};

export default CostosFilterBar;
