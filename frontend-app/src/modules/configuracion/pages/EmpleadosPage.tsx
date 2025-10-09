import React, { useCallback, useMemo, useState } from 'react';
import CatalogFilterBar from '../components/CatalogFilterBar';
import CatalogTable from '../components/CatalogTable';
import type { CatalogTableColumn } from '../components/CatalogTable';
import FormActions from '../components/FormActions';
import FormSection from '../components/FormSection';
import ProtectedRoute from '../components/ProtectedRoute';
import ConfirmDialog from '../components/ConfirmDialog';
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
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Empleado | null>(null);
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

  const handleFiltersChange = (next: CatalogFilterState) =>
    setFilters({ search: next.search, status: 'todos', updatedBy: undefined });

  const handleSubmit = form.handleSubmit(async (values: EmpleadoFormValues) => {
    try {
      if (editingEmpleado) {
        await catalog.update(editingEmpleado.id, { nombre: values.nombre.trim() });
        showToast('Empleado actualizado correctamente.', 'success');
      } else {
        await catalog.create({ nombre: values.nombre.trim() });
        showToast('Empleado registrado correctamente.', 'success');
      }
      form.reset();
      setEditingEmpleado(null);
      setIsFormOpen(false);
      await catalog.refetch();
    } catch (error) {
      showToast('No se pudo guardar el empleado.', 'error');
    }
  });

  const openCreateForm = useCallback(() => {
    setEditingEmpleado(null);
    form.reset();
    setIsFormOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (empleado: Empleado) => {
      setEditingEmpleado(empleado);
      form.reset({ nombre: empleado.nombre });
      setIsFormOpen(true);
    },
    [form],
  );

  const requestDelete = useCallback((empleado: Empleado) => {
    setPendingDelete(empleado);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await catalog.remove(pendingDelete.id);
      showToast('Empleado eliminado.', 'success');
      await catalog.refetch();
    } catch (error) {
      showToast('No se pudo eliminar al empleado.', 'error');
    } finally {
      setPendingDelete(null);
    }
  }, [catalog, pendingDelete, showToast]);

  const closeForm = useCallback(() => {
    form.reset();
    setEditingEmpleado(null);
    setIsFormOpen(false);
  }, [form]);

  const toggleButtonClassName = isFormOpen ? 'ghost' : 'primary';

  const toggleButtonLabel = isFormOpen
    ? editingEmpleado
      ? 'Cancelar edición'
      : 'Cerrar formulario'
    : 'Nuevo empleado';

  const columns: CatalogTableColumn<Empleado>[] = useMemo(
    () => [
      {
        key: 'nroEmpleado',
        label: 'N° de empleado',
        width: '160px',
        render: (empleado) => empleado.nroEmpleado.toString().padStart(3, '0'),
      },
      { key: 'nombre', label: 'Nombre' },
      {
        key: 'acciones',
        label: 'Acciones',
        width: '180px',
        render: (empleado) => (
          <div className="catalog-row-actions">
            <button type="button" className="catalog-row-actions__edit" onClick={() => handleEdit(empleado)}>
              <span className="catalog-row-actions__icon" aria-hidden="true">
                ✏️
              </span>
              <span>Editar</span>
            </button>
            <button type="button" className="catalog-row-actions__delete" onClick={() => requestDelete(empleado)}>
              <span className="catalog-row-actions__icon" aria-hidden="true">
                🗑️
              </span>
              <span>Eliminar</span>
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, requestDelete],
  );

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
              onClick={() => {
                if (isFormOpen) {
                  closeForm();
                } else {
                  openCreateForm();
                }
              }}
              aria-expanded={isFormOpen}
              aria-controls="empleado-form"
            >
              {toggleButtonLabel}
            </button>
          </div>
        </header>

        {!isFormOpen && (
          <div className="catalog-card">
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
                <button type="button" className="ghost config-alert__action" onClick={() => catalog.refetch()}>
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
          </div>
        )}
      </section>

      {isFormOpen && (
        <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
          <FormSection
            title={editingEmpleado ? 'Editar empleado' : 'Registrar empleado'}
            description={
              editingEmpleado
                ? 'Actualiza el nombre del colaborador y guarda para registrar los cambios.'
                : 'El número de empleado se asigna automáticamente por el sistema.'
            }
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
                onCancel={closeForm}
                submitLabel={editingEmpleado ? 'Guardar cambios' : undefined}
              />
            </form>
          </FormSection>
        </ProtectedRoute>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar empleado"
        description={`¿Deseas eliminar al colaborador "${pendingDelete?.nombre ?? ''}"? Perderás el historial asociado.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default EmpleadosPage;
