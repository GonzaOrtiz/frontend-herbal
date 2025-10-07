import React, { useMemo, useState } from 'react';
import CatalogFilterBar from '../components/CatalogFilterBar';
import CatalogTable from '../components/CatalogTable';
import type { CatalogTableColumn } from '../components/CatalogTable';
import FormActions from '../components/FormActions';
import FormSection from '../components/FormSection';
import ProtectedRoute from '../components/ProtectedRoute';
import { useConfigContext } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useEmpleados, type Empleado } from '../hooks/useEmpleados';
import { useForm } from '../hooks/useForm';
import type { CatalogFilterState } from '../types';
import { defaultEmpleadoValues, empleadoValidator } from '../schemas/empleadoSchema';
import type { EmpleadoFormValues } from '../schemas/empleadoSchema';

const EmpleadosPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const catalog = useEmpleados();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<CatalogFilterState>({ search: '', status: 'todos' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const form = useForm<EmpleadoFormValues>({ defaultValues: defaultEmpleadoValues, validator: empleadoValidator });

  const empleados = useMemo<Empleado[]>(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const ordered = [...catalog.items].sort((a, b) => a.nroEmpleado - b.nroEmpleado);

    if (!searchTerm) {
      return ordered;
    }

    return ordered.filter((empleado) =>
      `${empleado.nroEmpleado} ${empleado.nombre}`.toLowerCase().includes(searchTerm),
    );
  }, [catalog.items, filters.search]);

  const columns: CatalogTableColumn<Empleado>[] = [
    {
      key: 'nroEmpleado',
      label: 'N° de empleado',
      width: '160px',
      render: (empleado) => empleado.nroEmpleado.toString().padStart(3, '0'),
    },
    { key: 'nombre', label: 'Nombre' },
  ];

  const handleFiltersChange = (next: CatalogFilterState) =>
    setFilters({ search: next.search, status: 'todos', updatedBy: undefined });

  const handleSubmit = form.handleSubmit(async (values: EmpleadoFormValues) => {
    try {
      await catalog.create({ nombre: values.nombre.trim() });
      showToast('Empleado registrado correctamente.', 'success');
      form.reset();
      setIsFormOpen(false);
    } catch (error) {
      showToast('No se pudo registrar el empleado.', 'error');
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
            <h2 className="catalog-view__title">Colaboradores registrados</h2>
            <p className="catalog-view__subtitle">
              Mantén actualizado el catálogo de empleados que se utilizan en asignaciones y sueldos.
            </p>
          </div>
          <div className="catalog-view__actions">
            <span className="catalog-view__meta">{catalog.items.length} en total</span>
            <button
              type="button"
              className={toggleButtonClassName}
              onClick={() => setIsFormOpen((open) => !open)}
              aria-expanded={isFormOpen}
              aria-controls="empleado-form"
            >
              {isFormOpen ? 'Cerrar formulario' : 'Nuevo empleado'}
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
            <span>No pudimos cargar los empleados. Intenta nuevamente.</span>
            <button type="button" className="config-alert__action" onClick={() => catalog.refetch()}>
              Reintentar
            </button>
          </div>
        )}

        <CatalogTable
          rows={empleados}
          columns={columns}
          loading={catalog.isLoading}
          emptyMessage="No hay empleados registrados."
        />
      </section>

      {isFormOpen && (
        <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
          <FormSection
            title="Registrar empleado"
            description="El número de empleado se asigna automáticamente por el sistema."
          >
            <form id="empleado-form" onSubmit={handleSubmit} noValidate className="config-form">
              <div className="config-form-field">
                <label htmlFor="empleado-nombre" className="config-field-label">
                  Nombre completo
                </label>
                <input
                  id="empleado-nombre"
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

export default EmpleadosPage;
