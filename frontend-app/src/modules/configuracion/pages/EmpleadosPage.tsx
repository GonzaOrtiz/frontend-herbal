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
import { useEmpleados } from '../hooks/useEmpleados';
import { useForm } from '../hooks/useForm';
import type { CatalogFilterState } from '../types';
import { defaultEmpleadoValues, empleadoValidator } from '../schemas/empleadoSchema';
import type { EmpleadoFormValues } from '../schemas/empleadoSchema';

const EmpleadosPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const catalog = useEmpleados();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<CatalogFilterState>({ search: '', status: 'todos' });
  const form = useForm<EmpleadoFormValues>({ defaultValues: defaultEmpleadoValues, validator: empleadoValidator });

  const filteredItems = useMemo(() => {
    return catalog.items.filter((empleado) => {
      const matchesSearch = `${empleado.nombre} ${empleado.correo}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'todos' || empleado.estado === filters.status;
      const matchesUser = !filters.updatedBy || empleado.audit.updatedBy?.includes(filters.updatedBy);
      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [catalog.items, filters]);

  const columns: CatalogTableColumn<(typeof filteredItems)[number]>[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'correo', label: 'Correo electrónico' },
    { key: 'centroAsignado', label: 'Centro asignado' },
    {
      key: 'estado',
      label: 'Estado',
      render: (empleado) => <EntityStatusBadge status={empleado.estado} reason={empleado.audit.changeReason} />,
    },
    {
      key: 'audit',
      label: 'Última modificación',
      render: (empleado) => (
        <span className="audit-meta">
          {empleado.audit.updatedAt} — {empleado.audit.updatedBy ?? empleado.audit.createdBy}
        </span>
      ),
    },
  ];

  const handleSubmit = form.handleSubmit(async (values: EmpleadoFormValues) => {
    try {
      await catalog.create({
        id: '',
        nombre: values.nombre,
        correo: values.correo,
        centroAsignado: values.centroAsignado,
        estado: values.activo ? 'activo' : 'inactivo',
        audit: {
          createdAt: new Date().toISOString(),
          createdBy: 'usuario.actual',
          updatedAt: new Date().toISOString(),
          updatedBy: 'usuario.actual',
          changeReason: values.activo ? 'Alta de empleado' : 'Ingreso inactivo',
        },
      });
      form.reset();
      showToast('Empleado registrado correctamente.', 'success');
    } catch (error) {
      showToast('No se pudo registrar el empleado.', 'error');
    }
  });

  return (
    <div>
      <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
        <FormSection
          title="Agregar empleado"
          description="Este formulario sincroniza empleados y sus centros asignados con los módulos de planeación."
        >
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="empleado-identificador" className="audit-meta">
              Identificador interno
            </label>
            <input id="empleado-identificador" className="config-input" {...form.register('identificador')} />
            {form.formState.errors.identificador && <p className="config-alert">{form.formState.errors.identificador}</p>}

            <label htmlFor="empleado-nombre" className="audit-meta">
              Nombre completo
            </label>
            <input id="empleado-nombre" className="config-input" {...form.register('nombre')} />
            {form.formState.errors.nombre && <p className="config-alert">{form.formState.errors.nombre}</p>}

            <label htmlFor="empleado-correo" className="audit-meta">
              Correo electrónico
            </label>
            <input id="empleado-correo" className="config-input" type="email" {...form.register('correo')} />
            {form.formState.errors.correo && <p className="config-alert">{form.formState.errors.correo}</p>}

            <label htmlFor="empleado-centro" className="audit-meta">
              Centro asignado
            </label>
            <input id="empleado-centro" className="config-input" {...form.register('centroAsignado')} />
            {form.formState.errors.centroAsignado && <p className="config-alert">{form.formState.errors.centroAsignado}</p>}

            <label htmlFor="empleado-activo" className="audit-meta">
              Activo
            </label>
            <input
              id="empleado-activo"
              type="checkbox"
              checked={form.formState.values.activo}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('activo', event.target.checked)
              }
            />

            <FormActions isSubmitting={form.formState.isSubmitting} onCancel={() => form.reset()} />
          </form>
        </FormSection>
      </ProtectedRoute>

      <CatalogFilterBar value={filters} onChange={setFilters} disabled={catalog.isLoading} />

      <CatalogTable
        rows={filteredItems}
        columns={columns}
        loading={catalog.isLoading}
        emptyMessage="No hay empleados registrados."
      />
    </div>
  );
};

export default EmpleadosPage;
