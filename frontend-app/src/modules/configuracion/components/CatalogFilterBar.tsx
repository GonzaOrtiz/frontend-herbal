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
    <div className="config-filter-bar__field">
      <label htmlFor="catalog-search" className="config-field-label">
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
    </div>
    <div className="config-filter-bar__field">
      <label htmlFor="catalog-status" className="config-field-label">
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
    </div>
    <div className="config-filter-bar__field">
      <label htmlFor="catalog-updated-by" className="config-field-label">
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
  </div>
);

export default CatalogFilterBar;
