import React, { useMemo, useState } from 'react';
import CatalogFilterBar from '../components/CatalogFilterBar';
import CatalogTable from '../components/CatalogTable';
import type { CatalogTableColumn } from '../components/CatalogTable';
import FormActions from '../components/FormActions';
import FormSection from '../components/FormSection';
import ProtectedRoute from '../components/ProtectedRoute';
import { useConfigContext } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useCentros, type Centro } from '../hooks/useCentros';
import { useForm } from '../hooks/useForm';
import type { CatalogFilterState } from '../types';
import { centroValidator, defaultCentroValues } from '../schemas/centroSchema';
import type { CentroFormValues } from '../schemas/centroSchema';

const CentrosPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const catalog = useCentros();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<CatalogFilterState>({ search: '', status: 'todos' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const form = useForm<CentroFormValues>({ defaultValues: defaultCentroValues, validator: centroValidator });

  const centros = useMemo<Centro[]>(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const ordered = [...catalog.items].sort((a, b) => a.nroCentro - b.nroCentro);

    if (!searchTerm) {
      return ordered;
    }

    return ordered.filter((centro) =>
      `${centro.nroCentro} ${centro.nombre}`.toLowerCase().includes(searchTerm),
    );
  }, [catalog.items, filters.search]);

  const columns: CatalogTableColumn<Centro>[] = [
    {
      key: 'nroCentro',
      label: 'N° de centro',
      width: '160px',
      render: (centro) => centro.nroCentro.toString().padStart(3, '0'),
    },
    { key: 'nombre', label: 'Nombre' },
  ];

  const handleFiltersChange = (next: CatalogFilterState) =>
    setFilters({ search: next.search, status: 'todos', updatedBy: undefined });

  const handleSubmit = form.handleSubmit(async (values: CentroFormValues) => {
    try {
      await catalog.create({
        nombre: values.nombre.trim(),
        nroCentro: Number(values.nroCentro),
      });
      showToast('Centro creado correctamente.', 'success');
      form.reset();
      setIsFormOpen(false);
    } catch (error) {
      showToast('No se pudo crear el centro.', 'error');
    }
  });

  const toggleButtonClassName = `config-button ${
    isFormOpen ? 'config-button--ghost' : 'config-button--primary'
  }`;

  return (
    <div className="catalog-view">
      <section className="catalog-view__panel">
        <header className="catalog-view__header">
          <div className="catalog-view__header-text">
            <h2 className="catalog-view__title">Centros de producción</h2>
            <p className="catalog-view__subtitle">
              Gestiona los centros que intervienen en los prorrateos y cálculos de costos.
            </p>
          </div>
          <div className="catalog-view__actions">
            <span className="catalog-view__meta">{catalog.items.length} en total</span>
            <button
              type="button"
              className={toggleButtonClassName}
              onClick={() => setIsFormOpen((open) => !open)}
              aria-expanded={isFormOpen}
              aria-controls="centro-form"
            >
              {isFormOpen ? 'Cerrar formulario' : 'Nuevo centro'}
            </button>
          </div>
        </header>

        <CatalogFilterBar
          value={filters}
          onChange={handleFiltersChange}
          disabled={catalog.isLoading}
          hideStatus
          hideUpdatedBy
          searchPlaceholder="Buscar por número o nombre"
        />

        {catalog.error && (
          <div className="config-alert" role="alert">
            <span>No pudimos cargar los centros. Intenta nuevamente.</span>
            <button type="button" className="config-alert__action" onClick={() => catalog.refetch()}>
              Reintentar
            </button>
          </div>
        )}

        <CatalogTable
          rows={centros}
          columns={columns}
          loading={catalog.isLoading}
          emptyMessage="No hay centros registrados."
        />
      </section>

      {isFormOpen && (
        <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
          <FormSection
            title="Registrar centro de producción"
            description="El número de centro debe ser único y mayor a cero."
          >
            <form id="centro-form" onSubmit={handleSubmit} noValidate className="config-form">
              <div className="config-form-field">
                <label htmlFor="centro-numero" className="config-field-label">
                  Número de centro
                </label>
                <input
                  id="centro-numero"
                  className="config-input"
                  inputMode="numeric"
                  {...form.register('nroCentro')}
                />
                {form.formState.errors.nroCentro && (
                  <p className="config-field-error">{form.formState.errors.nroCentro}</p>
                )}
              </div>

              <div className="config-form-field">
                <label htmlFor="centro-nombre" className="config-field-label">
                  Nombre del centro
                </label>
                <input
                  id="centro-nombre"
                  className="config-input"
                  maxLength={120}
                  {...form.register('nombre')}
                />
                {form.formState.errors.nombre && (
                  <p className="config-field-error">{form.formState.errors.nombre}</p>
                )}
              </div>

              <FormActions
                isSubmitting={form.formState.isSubmitting}
                onCancel={() => {
                  form.reset();
                  setIsFormOpen(false);
                }}
              />
            </form>
          </FormSection>
        </ProtectedRoute>
      )}
    </div>
  );
};

export default CentrosPage;
