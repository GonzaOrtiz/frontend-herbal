import React, { useMemo, useState } from 'react';
import CatalogFilterBar from '../components/CatalogFilterBar';
import CatalogTable from '../components/CatalogTable';
import type { CatalogTableColumn } from '../components/CatalogTable';
import EntityStatusBadge from '../components/EntityStatusBadge';
import FormActions from '../components/FormActions';
import FormSection from '../components/FormSection';
import ProtectedRoute from '../components/ProtectedRoute';
import { useConfigContext } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useActividades } from '../hooks/useActividades';
import { useForm } from '../hooks/useForm';
import type { CatalogFilterState } from '../types';
import {
  actividadValidator,
  defaultActividadValues,
} from '../schemas/actividadSchema';
import type { ActividadFormValues } from '../schemas/actividadSchema';

const ActividadesPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const catalog = useActividades();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<CatalogFilterState>({ search: '', status: 'todos' });
  const form = useForm<ActividadFormValues>({ defaultValues: defaultActividadValues, validator: actividadValidator });

  const filteredItems = useMemo(() => {
    return catalog.items.filter((item) => {
      const matchesSearch = `${item.nombre} ${item.descripcion}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'todos' || item.estado === filters.status;
      const matchesUser = !filters.updatedBy || item.audit.updatedBy?.includes(filters.updatedBy);
      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [catalog.items, filters]);

  const columns: CatalogTableColumn<(typeof filteredItems)[number]>[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'estado',
      label: 'Estado',
      render: (actividad) => <EntityStatusBadge status={actividad.estado} reason={actividad.audit.changeReason} />,
    },
    {
      key: 'audit',
      label: 'Última modificación',
      render: (actividad) => (
        <span className="audit-meta">
          {actividad.audit.updatedAt} — {actividad.audit.updatedBy ?? actividad.audit.createdBy}
        </span>
      ),
    },
  ];

  const handleSubmit = form.handleSubmit(async (values: ActividadFormValues) => {
    try {
      await catalog.create({
        nombre: values.nombre,
        descripcion: values.descripcion,
        estado: values.estado,
        responsable: values.responsable,
        audit: {
          createdAt: new Date().toISOString(),
          createdBy: 'usuario.actual',
          updatedAt: new Date().toISOString(),
          updatedBy: 'usuario.actual',
          changeReason: 'Alta manual',
        },
        id: '',
      });
      form.reset();
      showToast('Actividad creada correctamente.', 'success');
    } catch (error) {
      showToast('No se pudo crear la actividad. Intenta nuevamente.', 'error');
    }
  });

  return (
    <div>
      <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
        <FormSection
          title="Registrar nueva actividad"
          description="Completa los campos obligatorios para sincronizar la actividad con producción y consumos."
        >
          <form onSubmit={handleSubmit} noValidate className="config-form">
            <div className="config-form-field">
              <label htmlFor="actividad-nombre" className="config-field-label">
                Nombre de la actividad
              </label>
              <input id="actividad-nombre" className="config-input" {...form.register('nombre')} />
              {form.formState.errors.nombre && <p className="config-field-error">{form.formState.errors.nombre}</p>}
            </div>

            <div className="config-form-field config-form-field--full">
              <label htmlFor="actividad-descripcion" className="config-field-label">
                Descripción operativa
              </label>
              <textarea
                id="actividad-descripcion"
                className="config-input"
                rows={3}
                value={form.formState.values.descripcion}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  form.setValue('descripcion', event.target.value)
                }
              />
              {form.formState.errors.descripcion && (
                <p className="config-field-error">{form.formState.errors.descripcion}</p>
              )}
            </div>

            <div className="config-form-field">
              <label htmlFor="actividad-responsable" className="config-field-label">
                Responsable
              </label>
              <input id="actividad-responsable" className="config-input" {...form.register('responsable')} />
              {form.formState.errors.responsable && (
                <p className="config-field-error">{form.formState.errors.responsable}</p>
              )}
            </div>

            <div className="config-form-field">
              <label htmlFor="actividad-estado" className="config-field-label">
                Estado
              </label>
              <select
                id="actividad-estado"
                className="config-select"
                value={form.formState.values.estado}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  form.setValue('estado', event.target.value as ActividadFormValues['estado'])
                }
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="sincronizando">Sincronizando</option>
              </select>
            </div>

            <FormActions isSubmitting={form.formState.isSubmitting} onCancel={() => form.reset()} />
          </form>
        </FormSection>
      </ProtectedRoute>

      <CatalogFilterBar value={filters} onChange={setFilters} disabled={catalog.isLoading} />

      <CatalogTable
        rows={filteredItems}
        columns={columns}
        loading={catalog.isLoading}
        emptyMessage="No hay actividades registradas."
      />
    </div>
  );
};

export default ActividadesPage;
