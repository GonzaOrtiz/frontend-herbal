import React, { useEffect, useMemo, useState } from 'react';
import { useCentros } from '../../configuracion/hooks/useCentros';
import { useCostosContext } from '../context/CostosContext';
import { useCuadrosProducts } from '../hooks/useCuadrosProducts';
import '../costos.css';

const CostosFilterBar: React.FC = () => {
  const { submodule, filters, updateFilters, resetFilters } = useCostosContext();
  const catalog = useCentros();
  const shouldLoadProducts = submodule === 'gastos';
  const { products: cuadroProducts, isLoading: productsLoading, error: productsError } =
    useCuadrosProducts({ enabled: shouldLoadProducts });
  const [productInput, setProductInput] = useState(filters.producto ?? '');

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

  useEffect(() => {
    if (!shouldLoadProducts) {
      return;
    }
    setProductInput(filters.producto ?? '');
  }, [filters.producto, shouldLoadProducts]);

  const normalizedProducts = useMemo(
    () => cuadroProducts.map((product) => product.trim()).filter((product) => product.length > 0),
    [cuadroProducts],
  );

  const findProductMatch = (value: string) => {
    const normalizedValue = value.trim().toLocaleLowerCase('es');
    return normalizedProducts.find(
      (product) => product.toLocaleLowerCase('es') === normalizedValue,
    );
  };

  const handleProductChange = (value: string) => {
    if (!value) {
      setProductInput('');
      updateFilters({ producto: undefined });
      return;
    }

    const match = findProductMatch(value);
    setProductInput(value);

    if (match) {
      setProductInput(match);
      if (match !== filters.producto) {
        updateFilters({ producto: match });
      }
    }
  };

  const handleProductBlur = () => {
    if (!productInput) {
      return;
    }
    const match = findProductMatch(productInput);
    if (!match) {
      setProductInput(filters.producto ?? '');
      return;
    }
    if (match !== productInput) {
      setProductInput(match);
    }
  };

  const productListId = 'costos-producto-options';
  const productPlaceholder = productsLoading
    ? 'Cargando productos…'
    : normalizedProducts.length === 0
      ? 'Sin productos disponibles'
      : 'Selecciona un producto';

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
            type="search"
            value={filters.empleadoQuery ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              updateFilters({ empleadoQuery: value });
            }}
            placeholder="Buscar por código o nombre"
            autoComplete="off"
            inputMode="search"
          />
        </div>
      )}

      {submodule === 'gastos' && (
        <div className="costos-filter-field">
          <label htmlFor="costos-producto">Producto</label>
          <input
            id="costos-producto"
            list={productListId}
            value={productInput}
            onChange={(event) => handleProductChange(event.target.value)}
            onBlur={handleProductBlur}
            placeholder={productPlaceholder}
            autoComplete="off"
            inputMode="search"
            title={productsError ? 'No se pudieron cargar los productos. Intenta nuevamente.' : undefined}
          />
          <datalist id={productListId}>
            {normalizedProducts.map((product) => (
              <option key={product} value={product} />
            ))}
          </datalist>
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
