import React, { useCallback, useMemo, useState } from 'react';
import CatalogFilterBar from '../components/CatalogFilterBar';
import CatalogTable from '../components/CatalogTable';
import type { CatalogTableColumn } from '../components/CatalogTable';
import EntityStatusBadge from '../components/EntityStatusBadge';
import FormActions from '../components/FormActions';
import FormSection from '../components/FormSection';
import ProtectedRoute from '../components/ProtectedRoute';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfigContext } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useParametrosGenerales, type ParametroGeneral } from '../hooks/useParametrosGenerales';
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
  const [selectedParametro, setSelectedParametro] = useState<ParametroGeneral | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ParametroGeneral | null>(null);

  const filteredItems = useMemo<ParametroGeneral[]>(() => {
    return catalog.items.filter((parametro) => {
      const matchesSearch = `${parametro.nombre ?? ''} ${parametro.politicaCosteo ?? ''}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'todos' || parametro.estado === filters.status;
      const matchesUser = !filters.updatedBy || parametro.audit.updatedBy?.includes(filters.updatedBy);
      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [catalog.items, filters]);

  const handleEdit = useCallback(
    (parametro: ParametroGeneral) => {
      setSelectedParametro(parametro);
      form.reset({
        fechaCalculo: parametro.fechaCalculo?.slice(0, 10) ?? '',
        politicaCosteo: parametro.politicaCosteo,
        aprobador: parametro.audit.updatedBy ?? parametro.audit.createdBy,
      });
      showToast('Parámetro seleccionado para edición.', 'info');
    },
    [form, showToast],
  );

  const requestDelete = useCallback((parametro: ParametroGeneral) => {
    setPendingDelete(parametro);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await catalog.remove(pendingDelete.id);
      showToast('Parámetro eliminado.', 'success');
      if (selectedParametro?.id === pendingDelete.id) {
        setSelectedParametro(null);
        form.reset();
      }
      await catalog.refetch();
    } catch (error) {
      showToast('No se pudo eliminar el parámetro.', 'error');
    } finally {
      setPendingDelete(null);
    }
  }, [catalog, form, pendingDelete, selectedParametro, showToast]);

  const columns: CatalogTableColumn<ParametroGeneral>[] = useMemo(
    () => [
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
      {
        key: 'acciones',
        label: 'Acciones',
        width: '200px',
        render: (parametro) => (
          <div className="catalog-row-actions">
            <button type="button" className="catalog-row-actions__edit" onClick={() => handleEdit(parametro)}>
              <span className="catalog-row-actions__icon" aria-hidden="true">
                ✏️
              </span>
              <span>Editar</span>
            </button>
            <button type="button" className="catalog-row-actions__delete" onClick={() => requestDelete(parametro)}>
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

  const handleSubmit = form.handleSubmit(async (values: ParametrosGeneralesFormValues) => {
    try {
      const payload = {
        id: selectedParametro?.id ?? '',
        nombre: 'Parámetros globales',
        fechaCalculo: values.fechaCalculo,
        politicaCosteo: values.politicaCosteo,
        estado: 'activo' as const,
        audit: {
          createdAt: selectedParametro?.audit.createdAt ?? new Date().toISOString(),
          createdBy: selectedParametro?.audit.createdBy ?? values.aprobador,
          updatedAt: new Date().toISOString(),
          updatedBy: values.aprobador,
          changeReason: 'Actualización manual de parámetros',
        },
      };

      if (selectedParametro) {
        await catalog.update(selectedParametro.id, payload);
        showToast('Parámetros actualizados.', 'success');
      } else {
        await catalog.create(payload);
        showToast('Parámetros registrados.', 'success');
      }
      form.reset();
      setSelectedParametro(null);
      await catalog.refetch();
    } catch (error) {
      showToast('No se pudieron actualizar los parámetros.', 'error');
    }
  });

  return (
    <div className="catalog-view">
      <ProtectedRoute permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}>
        <FormSection
          title={selectedParametro ? 'Editar parámetros generales' : 'Actualizar parámetros generales'}
          description={
            selectedParametro
              ? 'Estás editando un registro existente. Cambia los valores y guarda para actualizarlo.'
              : 'Modifica la fecha de cálculo y la política de costeo utilizada como base para los reportes.'
          }
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
              onCancel={() => {
                form.reset();
                setSelectedParametro(null);
              }}
              submitLabel={selectedParametro ? 'Guardar cambios' : 'Guardar'}
            />
          </form>
        </FormSection>
      </ProtectedRoute>

      <div className="catalog-card">
        <CatalogFilterBar value={filters} onChange={setFilters} disabled={catalog.isLoading} />

        {catalog.error && (
          <div className="config-alert" role="alert">
            <span>No pudimos cargar los parámetros. Intenta nuevamente.</span>
            <button type="button" className="config-alert__action" onClick={() => catalog.refetch()}>
              Reintentar
            </button>
          </div>
        )}

        <CatalogTable
          rows={filteredItems}
          columns={columns}
          loading={catalog.isLoading}
          emptyMessage="No hay parámetros registrados."
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar parámetros generales"
        description={`¿Deseas eliminar el registro seleccionado con política "${pendingDelete?.politicaCosteo ?? ''}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ParametrosGeneralesPage;
