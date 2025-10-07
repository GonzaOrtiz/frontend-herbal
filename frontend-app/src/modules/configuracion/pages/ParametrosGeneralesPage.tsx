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
import { useParametrosGenerales } from '../hooks/useParametrosGenerales';
import { useForm } from '../hooks/useForm';
import type { CatalogFilterState } from '../types';
import {
  defaultParametrosValues,
  parametrosGeneralesValidator,
} from '../schemas/parametrosGeneralesSchema';
import type { ParametrosGeneralesFormValues } from '../schemas/parametrosGeneralesSchema';

const ParametrosGeneralesPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const catalog = useParametrosGenerales();
  const [filters, setFilters] = useState<CatalogFilterState>({ search: '', status: 'todos' });
  const form = useForm<ParametrosGeneralesFormValues>({
    defaultValues: defaultParametrosValues,
    validator: parametrosGeneralesValidator,
  });
  const { showToast } = useToast();

  const filteredItems = useMemo(() => {
    return catalog.items.filter((parametro) => {
      const matchesSearch = `${parametro.nombre ?? ''} ${parametro.politicaCosteo ?? ''}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'todos' || parametro.estado === filters.status;
      const matchesUser = !filters.updatedBy || parametro.audit.updatedBy?.includes(filters.updatedBy);
      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [catalog.items, filters]);

  const columns: CatalogTableColumn<(typeof filteredItems)[number]>[] = [
    { key: 'fechaCalculo', label: 'Fecha de cálculo' },
    { key: 'politicaCosteo', label: 'Política de costeo' },
    {
      key: 'estado',
      label: 'Estado',
      render: (parametro) => <EntityStatusBadge status={parametro.estado} reason={parametro.audit.changeReason} />,
    },
    {
      key: 'audit',
      label: 'Última modificación',
      render: (parametro) => (
        <span className="audit-meta">
          {parametro.audit.updatedAt} — {parametro.audit.updatedBy ?? parametro.audit.createdBy}
        </span>
      ),
    },
  ];

  const handleSubmit = form.handleSubmit(async (values: ParametrosGeneralesFormValues) => {
    try {
      await catalog.create({
        id: '',
        nombre: 'Parámetros globales',
        fechaCalculo: values.fechaCalculo,
        politicaCosteo: values.politicaCosteo,
        estado: 'activo',
        audit: {
          createdAt: new Date().toISOString(),
          createdBy: values.aprobador,
          updatedAt: new Date().toISOString(),
          updatedBy: values.aprobador,
          changeReason: 'Actualización manual de parámetros',
        },
      });
      form.reset();
      showToast('Parámetros actualizados.', 'success');
    } catch (error) {
      showToast('No se pudieron actualizar los parámetros.', 'error');
    }
  });

  return (
    <div>
      <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
        <FormSection
          title="Actualizar parámetros generales"
          description="Modifica la fecha de cálculo y la política de costeo utilizada como base para los reportes."
        >
          <form onSubmit={handleSubmit} noValidate className="config-form">
            <div className="config-form-field">
              <label htmlFor="parametros-fecha" className="config-field-label">
                Fecha de cálculo
              </label>
              <input id="parametros-fecha" className="config-input" type="date" {...form.register('fechaCalculo')} />
              {form.formState.errors.fechaCalculo && (
                <p className="config-field-error">{form.formState.errors.fechaCalculo}</p>
              )}
            </div>

            <div className="config-form-field">
              <label htmlFor="parametros-politica" className="config-field-label">
                Política de costeo
              </label>
              <select
                id="parametros-politica"
                className="config-select"
                value={form.formState.values.politicaCosteo}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  form.setValue('politicaCosteo', event.target.value as ParametrosGeneralesFormValues['politicaCosteo'])
                }
              >
                <option value="promedio">Promedio ponderado</option>
                <option value="peps">PEPS</option>
                <option value="ueps">UEPS</option>
              </select>
            </div>

            <div className="config-form-field">
              <label htmlFor="parametros-aprobador" className="config-field-label">
                Aprobador responsable
              </label>
              <input id="parametros-aprobador" className="config-input" {...form.register('aprobador')} />
              {form.formState.errors.aprobador && (
                <p className="config-field-error">{form.formState.errors.aprobador}</p>
              )}
            </div>

            <FormActions
              isSubmitting={form.formState.isSubmitting}
              onCancel={() => form.reset()}
              submitLabel="Guardar"
            />
          </form>
        </FormSection>
      </ProtectedRoute>

      <CatalogFilterBar value={filters} onChange={setFilters} disabled={catalog.isLoading} />

      <CatalogTable
        rows={filteredItems}
        columns={columns}
        loading={catalog.isLoading}
        emptyMessage="No hay parámetros registrados."
      />
    </div>
  );
};

export default ParametrosGeneralesPage;
