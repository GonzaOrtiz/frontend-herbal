import React from 'react';
import type { CatalogFilterState } from '../types';
import '../configuracion.css';

interface CatalogFilterBarProps {
  value: CatalogFilterState;
  onChange: (value: CatalogFilterState) => void;
  disabled?: boolean;
}

const statusOptions: Array<{ value: CatalogFilterState['status']; label: string }> = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
  { value: 'sincronizando', label: 'Sincronizando' },
];

const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({ value, onChange, disabled }) => (
  <div className="config-filter-bar" role="search">
    <label htmlFor="catalog-search" className="audit-meta">
      Búsqueda
    </label>
    <input
      id="catalog-search"
      className="config-input"
      placeholder="Buscar por nombre o código"
      value={value.search}
      onChange={(event) => onChange({ ...value, search: event.target.value })}
      disabled={disabled}
    />
    <label htmlFor="catalog-status" className="audit-meta">
      Estado
    </label>
    <select
      id="catalog-status"
      className="config-select"
      value={value.status}
      onChange={(event) => onChange({ ...value, status: event.target.value as CatalogFilterState['status'] })}
      disabled={disabled}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <label htmlFor="catalog-updated-by" className="audit-meta">
      Último cambio por
    </label>
    <input
      id="catalog-updated-by"
      className="config-input"
      placeholder="Usuario"
      value={value.updatedBy ?? ''}
      onChange={(event) => onChange({ ...value, updatedBy: event.target.value || undefined })}
      disabled={disabled}
    />
  </div>
);

export default CatalogFilterBar;
