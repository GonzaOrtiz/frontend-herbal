import React, { useMemo, useState } from 'react';
import CatalogFilterBar from '../components/CatalogFilterBar';
import CatalogTable from '../components/CatalogTable';
import type { CatalogTableColumn } from '../components/CatalogTable';
import FormActions from '../components/FormActions';
import FormSection from '../components/FormSection';
import ProtectedRoute from '../components/ProtectedRoute';
import { useConfigContext } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useActividades, type Actividad } from '../hooks/useActividades';
import { useForm } from '../hooks/useForm';
import type { CatalogFilterState } from '../types';
import { actividadValidator, defaultActividadValues } from '../schemas/actividadSchema';
import type { ActividadFormValues } from '../schemas/actividadSchema';

const ActividadesPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const catalog = useActividades();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<CatalogFilterState>({ search: '', status: 'todos' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const form = useForm<ActividadFormValues>({ defaultValues: defaultActividadValues, validator: actividadValidator });

  const actividades = useMemo<Actividad[]>(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const ordered = [...catalog.items].sort((a, b) => a.nroAct - b.nroAct);

    if (!searchTerm) {
      return ordered;
    }

    return ordered.filter((actividad) =>
      `${actividad.nroAct} ${actividad.nombre}`.toLowerCase().includes(searchTerm),
    );
  }, [catalog.items, filters.search]);

  const columns: CatalogTableColumn<Actividad>[] = [
    {
      key: 'nroAct',
      label: 'N° de actividad',
      width: '160px',
      render: (actividad) => actividad.nroAct.toString().padStart(3, '0'),
    },
    { key: 'nombre', label: 'Nombre' },
  ];

  const handleFiltersChange = (next: CatalogFilterState) =>
    setFilters({ search: next.search, status: 'todos', updatedBy: undefined });

  const handleSubmit = form.handleSubmit(async (values: ActividadFormValues) => {
    try {
      await catalog.create({ nombre: values.nombre.trim() });
      showToast('Actividad creada correctamente.', 'success');
      form.reset();
      setIsFormOpen(false);
      await catalog.refetch();
    } catch (error) {
      showToast('No se pudo crear la actividad. Intenta nuevamente.', 'error');
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
            <h2 className="catalog-view__title">Actividades registradas</h2>
            <p className="catalog-view__subtitle">
              Administra las actividades productivas que participan en los prorrateos.
            </p>
          </div>
          <div className="catalog-view__actions">
            <span className="catalog-view__meta">{catalog.items.length} en total</span>
            <button
              type="button"
              className={toggleButtonClassName}
              onClick={() => setIsFormOpen((open) => !open)}
              aria-expanded={isFormOpen}
              aria-controls="actividad-form"
            >
              {isFormOpen ? 'Cerrar formulario' : 'Nueva actividad'}
            </button>
          </div>
        </header>

        {!isFormOpen && (
          <>
            <CatalogFilterBar
              value={filters}
              onChange={handleFiltersChange}
              disabled={catalog.isLoading}
              hideStatus
              hideUpdatedBy
              searchPlaceholder="Buscar por nombre o número"
            />

            {catalog.error && (
              <div className="config-alert" role="alert">
                <span>No pudimos cargar las actividades. Intenta nuevamente.</span>
                <button type="button" className="config-alert__action" onClick={() => catalog.refetch()}>
                  Reintentar
                </button>
              </div>
            )}

            <CatalogTable
              rows={actividades}
              columns={columns}
              loading={catalog.isLoading}
              emptyMessage="No hay actividades registradas."
            />
          </>
        )}
      </section>

      {isFormOpen && (
        <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
          <FormSection
            title="Crear actividad"
            description="El número de actividad se asigna automáticamente al guardar."
          >
            <form id="actividad-form" onSubmit={handleSubmit} noValidate className="config-form">
              <div className="config-form-field">
                <label htmlFor="actividad-nombre" className="config-field-label">
                  Nombre de la actividad
                </label>
                <input
                  id="actividad-nombre"
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

export default ActividadesPage;
