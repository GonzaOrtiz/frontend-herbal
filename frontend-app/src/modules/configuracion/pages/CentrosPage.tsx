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
import { useCentros } from '../hooks/useCentros';
import { useForm } from '../hooks/useForm';
import type { CatalogFilterState } from '../types';
import { centroValidator, defaultCentroValues } from '../schemas/centroSchema';
import type { CentroFormValues } from '../schemas/centroSchema';

const CentrosPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const catalog = useCentros();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<CatalogFilterState>({ search: '', status: 'todos' });
  const form = useForm<CentroFormValues>({ defaultValues: defaultCentroValues, validator: centroValidator });

  const filteredItems = useMemo(() => {
    return catalog.items.filter((centro) => {
      const matchesSearch = `${centro.codigo} ${centro.nombre}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'todos' || centro.estado === filters.status;
      const matchesUser = !filters.updatedBy || centro.audit.updatedBy?.includes(filters.updatedBy);
      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [catalog.items, filters]);

  const columns: CatalogTableColumn<(typeof filteredItems)[number]>[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'tipo', label: 'Tipo' },
    {
      key: 'estado',
      label: 'Estado',
      render: (centro) => <EntityStatusBadge status={centro.estado} reason={centro.audit.changeReason} />,
    },
    {
      key: 'audit',
      label: 'Última modificación',
      render: (centro) => (
        <span className="audit-meta">
          {centro.audit.updatedAt} — {centro.audit.updatedBy ?? centro.audit.createdBy}
        </span>
      ),
    },
  ];

  const handleSubmit = form.handleSubmit(async (values: CentroFormValues) => {
    try {
      await catalog.create({
        id: '',
        codigo: values.codigo,
        nombre: values.nombre,
        tipo: values.tipo,
        estado: 'activo',
        audit: {
          createdAt: new Date().toISOString(),
          createdBy: 'usuario.actual',
          updatedAt: new Date().toISOString(),
          updatedBy: 'usuario.actual',
          changeReason: 'Nuevo centro registrado',
        },
      });
      form.reset();
      showToast('Centro creado correctamente.', 'success');
    } catch (error) {
      showToast('No se pudo crear el centro.', 'error');
    }
  });

  return (
    <div>
      <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
        <FormSection
          title="Crear centro"
          description="Los centros impactan directamente en el costeo y producción. Valida con finanzas antes de crear uno nuevo."
        >
          <form onSubmit={handleSubmit} noValidate className="config-form">
            <div className="config-form-field">
              <label htmlFor="centro-codigo" className="config-field-label">
                Código
              </label>
              <input id="centro-codigo" className="config-input" {...form.register('codigo')} />
              {form.formState.errors.codigo && <p className="config-field-error">{form.formState.errors.codigo}</p>}
            </div>

            <div className="config-form-field">
              <label htmlFor="centro-nombre" className="config-field-label">
                Nombre
              </label>
              <input id="centro-nombre" className="config-input" {...form.register('nombre')} />
              {form.formState.errors.nombre && <p className="config-field-error">{form.formState.errors.nombre}</p>}
            </div>

            <div className="config-form-field">
              <label htmlFor="centro-tipo" className="config-field-label">
                Tipo de centro
              </label>
              <select
                id="centro-tipo"
                className="config-select"
                value={form.formState.values.tipo}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  form.setValue('tipo', event.target.value as CentroFormValues['tipo'])
                }
              >
                <option value="produccion">Producción</option>
                <option value="apoyo">Apoyo</option>
              </select>
            </div>

            <div className="config-form-field">
              <label htmlFor="centro-responsable" className="config-field-label">
                Responsable
              </label>
              <input id="centro-responsable" className="config-input" {...form.register('responsable')} />
              {form.formState.errors.responsable && (
                <p className="config-field-error">{form.formState.errors.responsable}</p>
              )}
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
        emptyMessage="No hay centros registrados."
      />
    </div>
  );
};

export default CentrosPage;
