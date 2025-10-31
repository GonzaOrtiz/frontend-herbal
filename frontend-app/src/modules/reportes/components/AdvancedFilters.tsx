import React, { useMemo, useState } from 'react';
import { useReportesContext } from '../context/ReportesContext';
import type { ReportFilters } from '../types';
import { normalizeCentro, normalizePeriodo, normalizeProducto } from '../utils/filters';

interface AdvancedFiltersProps {
  descriptors: Array<{ id: keyof ReportFilters; label: string; helper?: string }>;
}

const formatOptions = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
];

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ descriptors }) => {
  const { filters, updateFilters, resetFilters, isValidCombination, shareableLink } = useReportesContext();
  const [copied, setCopied] = useState(false);

  const descriptorMap = useMemo(() => {
    const map = new Map<keyof ReportFilters, { label: string; helper?: string }>();
    descriptors.forEach((descriptor) => map.set(descriptor.id, descriptor));
    return map;
  }, [descriptors]);

  const handlePeriodoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizePeriodo(event.target.value);
    updateFilters({ periodo: value });
  };

  const handleProductoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizeProducto(event.target.value);
    updateFilters({ producto: value });
  };

  const handleCentroChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizeCentro(event.target.value);
    updateFilters({ centro: value });
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ format: event.target.value as ReportFilters['format'] });
  };

  const handleCopyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('No fue posible copiar el enlace', error);
    }
  };

  return (
    <aside className="reportes-module__filters">
      <header className="reportes-filters__header">
        <h2>Filtros avanzados</h2>
        <p>Configura los criterios de consulta y comparte la vista con tu equipo.</p>
      </header>

      <div className="reportes-filter-fields" role="group" aria-label="Filtros principales">
        <label className="reportes-filter-field">
          <span className="reportes-filter-label">{descriptorMap.get('periodo')?.label ?? 'Periodo (fecha)'}</span>
          <input
            className="reportes-filter-input"
            type="date"
            value={filters.periodo ?? ''}
            onChange={handlePeriodoChange}
            aria-describedby="periodo-helper"
          />
          {descriptorMap.get('periodo')?.helper && (
            <small id="periodo-helper" className="reportes-filter-helper">
              {descriptorMap.get('periodo')?.helper}
            </small>
          )}
        </label>

        <label className="reportes-filter-field">
          <span className="reportes-filter-label">{descriptorMap.get('producto')?.label ?? 'Producto'}</span>
          <input
            className="reportes-filter-input"
            type="text"
            value={filters.producto ?? ''}
            onChange={handleProductoChange}
            placeholder="Nombre o clave de producto"
          />
        </label>

        <label className="reportes-filter-field">
          <span className="reportes-filter-label">{descriptorMap.get('centro')?.label ?? 'Centro'}</span>
          <input
            className="reportes-filter-input"
            type="number"
            min={0}
            value={filters.centro ?? ''}
            onChange={handleCentroChange}
            placeholder="ID de centro"
          />
        </label>

        <label className="reportes-filter-field">
          <span className="reportes-filter-label">Formato preferido</span>
          <select
            className="reportes-filter-input reportes-filter-select"
            value={filters.format ?? 'json'}
            onChange={handleFormatChange}
          >
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="reportes-export-bar" role="group" aria-label="Acciones de filtros">
        <button type="button" onClick={resetFilters}>
          Limpiar filtros
        </button>
        <button type="button" onClick={handleCopyLink} disabled={!isValidCombination}>
          {copied ? 'Enlace copiado' : 'Compartir vista'}
        </button>
        {!isValidCombination && (
          <span role="alert" className="reportes-export-bar__status">
            Selecciona un periodo para filtrar por centro.
          </span>
        )}
      </div>

    </aside>
  );
};

export default AdvancedFilters;
