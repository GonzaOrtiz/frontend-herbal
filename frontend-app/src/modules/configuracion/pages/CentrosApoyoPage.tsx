import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '../context/ToastContext';
import { useConfigContext } from '../context/ConfigContext';
import CatalogTable, { type CatalogTableColumn } from '../components/CatalogTable';
import FormSection from '../components/FormSection';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  actualizarCentroApoyo,
  fetchCentroApoyoDetalle,
  listCentroApoyoGastos,
  useCentrosApoyoCatalog,
  type CentroApoyo,
  type CentroApoyoExpense,
  type CentroApoyoExpenseFilters,
} from '../hooks/useCentrosApoyo';
import { useForm } from '../hooks/useForm';
import {
  centroApoyoValidator,
  defaultCentroApoyoValues,
  type CentroApoyoFormValues,
} from '../schemas/centroApoyoSchema';
import { buildCentrosApoyoSummary } from '../utils/centrosApoyo';
import type { CentroApoyoExpenseSummary } from '../utils/centrosApoyo';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const FILTER_STORAGE_KEY = 'configuracion.centrosApoyo.filtros';
const CHART_COLORS = ['#145ea8', '#0f766e', '#f97316', '#9333ea', '#ef4444', '#0ea5e9'];

const defaultFilters: CentroApoyoExpenseFilters = {
  fechaCalculo: '',
  esGastoDelPeriodo: undefined,
};

function loadStoredFilters(): CentroApoyoExpenseFilters {
  if (typeof window === 'undefined') {
    return defaultFilters;
  }
  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return defaultFilters;
    const parsed = JSON.parse(raw) as Partial<CentroApoyoExpenseFilters>;
    return {
      fechaCalculo: typeof parsed.fechaCalculo === 'string' ? parsed.fechaCalculo : '',
      esGastoDelPeriodo:
        typeof parsed.esGastoDelPeriodo === 'boolean' ? parsed.esGastoDelPeriodo : undefined,
    };
  } catch (error) {
    console.warn('[centros-apoyo] No se pudieron cargar filtros guardados', error);
    return defaultFilters;
  }
}

function persistFilters(filters: CentroApoyoExpenseFilters) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('[centros-apoyo] No se pudieron guardar los filtros', error);
  }
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function exportToCsv(records: CentroApoyoExpense[], centro?: CentroApoyo) {
  if (records.length === 0) {
    return;
  }
  const header = ['Concepto', 'Monto', 'Del periodo', 'Fecha cálculo'];
  const rows = records.map((record) => [
    record.concepto,
    record.monto.toString(),
    record.esGastoDelPeriodo ? 'Sí' : 'No',
    record.fechaCalculo ?? '',
  ]);
  const csvContent = [header, ...rows]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const centroLabel = centro ? `centro-${centro.nroCentro.toString().padStart(3, '0')}` : 'centro';
  link.download = `gastos-${centroLabel}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const CentrosApoyoPage: React.FC = () => {
  const { activeRoute } = useConfigContext();
  const { showToast } = useToast();
  const catalog = useCentrosApoyoCatalog();
  const [selectedCentroId, setSelectedCentroId] = useState<string | null>(null);
  const [filters, setFilters] = useState<CentroApoyoExpenseFilters>(() => loadStoredFilters());
  const [gastos, setGastos] = useState<CentroApoyoExpense[]>([]);
  const [gastosSummary, setGastosSummary] = useState<CentroApoyoExpenseSummary>(() =>
    buildCentrosApoyoSummary([]),
  );
  const [gastosCurrency, setGastosCurrency] = useState('MXN');
  const [gastosLoading, setGastosLoading] = useState(false);
  const [gastosError, setGastosError] = useState<string | null>(null);
  const [gastosWarning, setGastosWarning] = useState<string | null>(null);
  const [gastosCount, setGastosCount] = useState(0);
  const checkboxRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroApoyo | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const form = useForm<CentroApoyoFormValues>({
    defaultValues: defaultCentroApoyoValues,
    validator: centroApoyoValidator,
  });

  useEffect(() => {
    checkboxRef.current && (checkboxRef.current.indeterminate = filters.esGastoDelPeriodo === undefined);
  }, [filters.esGastoDelPeriodo]);

  const selectedCentro = useMemo(
    () => catalog.items.find((centro) => centro.id === selectedCentroId) ?? null,
    [catalog.items, selectedCentroId],
  );

  useEffect(() => {
    if (!selectedCentroId && catalog.items.length > 0) {
      setSelectedCentroId(catalog.items[0].id);
    }
  }, [catalog.items, selectedCentroId]);

  useEffect(() => {
    persistFilters(filters);
  }, [filters]);

  const fetchGastos = useCallback(
    async (options: { signal?: AbortSignal; silent?: boolean } = {}, centroId?: string | null) => {
      const targetCentroId = centroId ?? selectedCentroId;

      if (!targetCentroId) {
        setGastos([]);
        setGastosSummary(buildCentrosApoyoSummary([]));
        setGastosCount(0);
        return;
      }

      if (!filters.fechaCalculo) {
        setGastos([]);
        setGastosSummary(buildCentrosApoyoSummary([]));
        setGastosWarning('Selecciona una fecha de cálculo para consultar los gastos del centro.');
        setGastosError(null);
        setGastosCount(0);
        return;
      }

      if (!options.silent) {
        setGastosLoading(true);
      }
      setGastosWarning(null);
      setGastosError(null);

      try {
        const response = await listCentroApoyoGastos(targetCentroId, filters, { signal: options.signal });
        if (options.signal?.aborted) {
          return;
        }
        setGastos(response.items);
        setGastosSummary(buildCentrosApoyoSummary(response.items));
        setGastosCurrency(response.currency);
        setGastosCount(response.count);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setGastosError('No se pudieron cargar los gastos del centro seleccionado.');
      } finally {
        if (!options.silent) {
          setGastosLoading(false);
        }
      }
    },
    [filters, selectedCentroId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchGastos({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchGastos]);

  const handleSelectCentro = useCallback(
    (centro: CentroApoyo) => {
      setSelectedCentroId(centro.id);
      setIsEditing(false);
      setEditingCentro(null);
      form.reset();
      void fetchGastos({}, centro.id);
    },
    [fetchGastos, form],
  );

  const handleEditCentro = useCallback(
    async (centro: CentroApoyo) => {
      setIsEditing(true);
      setLoadingDetalle(true);
      try {
        const detalle = await fetchCentroApoyoDetalle(centro.id);
        setEditingCentro(detalle);
        form.reset({
          nombre: detalle.nombre,
          nroCentro: detalle.nroCentro.toString(),
        });
      } catch (error) {
        showToast('No se pudo cargar el centro seleccionado.', 'error');
        setIsEditing(false);
      } finally {
        setLoadingDetalle(false);
      }
    },
    [form, showToast],
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!editingCentro) {
      return;
    }
    try {
      await actualizarCentroApoyo(editingCentro.id, { nombre: values.nombre.trim() });
      showToast('Centro actualizado correctamente.', 'success');
      setIsEditing(false);
      setEditingCentro(null);
      form.reset();
      await catalog.refetch();
      await fetchGastos({ silent: true });
    } catch (error) {
      showToast('No se pudo actualizar el centro. Verifica que exista e inténtalo nuevamente.', 'error');
    }
  });

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCentro(null);
    form.reset();
  };

  const handleFiltersChange = (updater: (current: CentroApoyoExpenseFilters) => CentroApoyoExpenseFilters) => {
    setFilters((current) => updater(current));
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleExport = () => {
    if (!selectedCentro) {
      showToast('Selecciona un centro para exportar sus gastos.', 'warning');
      return;
    }
    if (gastos.length === 0) {
      showToast('No hay gastos para exportar con los filtros seleccionados.', 'warning');
      return;
    }
    exportToCsv(gastos, selectedCentro);
    showToast('Exportación generada correctamente.', 'success');
  };

  const columns: CatalogTableColumn<CentroApoyo>[] = useMemo(
    () => [
      {
        key: 'nroCentro',
        label: 'N° centro',
        width: '120px',
        render: (centro) => centro.nroCentro.toString().padStart(3, '0'),
      },
      { key: 'nombre', label: 'Nombre del centro' },
      {
        key: 'fechaActualizacion',
        label: 'Última actualización',
        width: '180px',
        render: (centro) => formatDateTime(centro.fechaActualizacion),
      },
      {
        key: 'acciones',
        label: 'Acciones',
        width: '220px',
        render: (centro) => (
          <div className="catalog-row-actions">
            <button type="button" className="catalog-row-actions__edit" onClick={() => handleSelectCentro(centro)}>
              <span aria-hidden="true">👁️</span>
              Ver gastos
            </button>
            <ProtectedRoute
              permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}
              fallback={null}
            >
              <button type="button" className="catalog-row-actions__edit" onClick={() => handleEditCentro(centro)}>
                <span className="catalog-row-actions__icon" aria-hidden="true">
                  ✏️
                </span>
                Editar
              </button>
            </ProtectedRoute>
          </div>
        ),
      },
    ],
    [activeRoute?.meta.permissions.write, handleEditCentro, handleSelectCentro],
  );

  const isSaveDisabled = useMemo(() => {
    if (!editingCentro) {
      return true;
    }
    const currentNombre = form.formState.values.nombre.trim();
    return currentNombre.length === 0 || currentNombre === editingCentro.nombre;
  }, [editingCentro, form.formState.values.nombre]);

  const chartData = useMemo(
    () =>
      gastosSummary.categories.map((item) => ({
        name: item.category,
        value: Number(item.amount.toFixed(2)),
      })),
    [gastosSummary.categories],
  );

  return (
    <div className="catalog-view centros-apoyo">
      <section className="catalog-view__panel">
        <header className="catalog-view__header">
          <div className="catalog-view__header-text">
            <h2 className="catalog-view__title">Centros de apoyo</h2>
            <p className="catalog-view__subtitle">
              Administra la información de los centros y consulta los gastos consolidados por periodo.
            </p>
          </div>
          <div className="catalog-view__actions">
            <span className="catalog-view__meta">{catalog.items.length} centros registrados</span>
            <button type="button" className="secondary" onClick={() => catalog.refetch()} disabled={catalog.isLoading}>
              Actualizar catálogo
            </button>
          </div>
        </header>

        <div className="catalog-card">
          {catalog.error && (
            <div className="config-alert" role="alert">
              <span>No pudimos cargar los centros de apoyo.</span>
              <button type="button" className="ghost config-alert__action" onClick={() => catalog.refetch()}>
                Reintentar
              </button>
            </div>
          )}

          {isEditing ? (
            <div className="centros-apoyo__edicion">
              <header className="centros-apoyo__section-header">
                <div>
                  <h3>Editar centro</h3>
                  <p>Actualiza únicamente el nombre del centro de apoyo seleccionado.</p>
                </div>
              </header>

              {loadingDetalle ? (
                <div className="table-empty">Cargando detalles…</div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="config-form">
                  <FormSection title="Datos del centro">
                    <div className="config-form-field">
                      <label htmlFor="centro-apoyo-nro" className="config-field-label">
                        Número de centro
                      </label>
                      <input
                        id="centro-apoyo-nro"
                        className="config-input"
                        {...form.register('nroCentro')}
                        readOnly
                        disabled
                      />
                      {form.formState.errors.nroCentro && (
                        <p className="config-field-error">{form.formState.errors.nroCentro}</p>
                      )}
                    </div>
                    <div className="config-form-field">
                      <label htmlFor="centro-apoyo-nombre" className="config-field-label">
                        Nombre del centro
                      </label>
                      <input
                        id="centro-apoyo-nombre"
                        className="config-input"
                        placeholder="Ingresa el nombre"
                        {...form.register('nombre')}
                      />
                      {form.formState.errors.nombre && (
                        <p className="config-field-error">{form.formState.errors.nombre}</p>
                      )}
                    </div>
                  </FormSection>

                  <div className="config-form-actions">
                    <button type="button" className="ghost" onClick={handleCancelEdit}>
                      Cancelar
                    </button>
                    <ProtectedRoute
                      permissions={[activeRoute?.meta.permissions.write ?? 'catalogos.write']}
                      fallback={null}
                    >
                      <button type="submit" className="primary" disabled={isSaveDisabled || form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    </ProtectedRoute>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <CatalogTable
              rows={catalog.items}
              columns={columns}
              loading={catalog.isLoading}
              emptyMessage="No hay centros de apoyo registrados."
            />
          )}
        </div>
      </section>

      <section className="catalog-card centros-apoyo__gastos">
        <header className="centros-apoyo__section-header">
          <div>
            <h3>Gastos consolidados</h3>
            <p>
              {selectedCentro
                ? `Mostrando información de ${selectedCentro.nombre} (centro ${selectedCentro.nroCentro.toString().padStart(3, '0')}).`
                : 'Selecciona un centro para visualizar sus gastos asociados.'}
            </p>
          </div>
          <div className="centros-apoyo__actions">
            <button type="button" className="secondary" onClick={() => fetchGastos()} disabled={gastosLoading}>
              Refrescar
            </button>
            <button type="button" className="secondary" onClick={handleExport}>
              Exportar CSV
            </button>
          </div>
        </header>

          <div className="centros-apoyo__filters">
            <label className="config-form-field">
              <span className="config-field-label">Fecha de cálculo</span>
              <input
                type="date"
                className="config-input"
                value={filters.fechaCalculo}
                onChange={(event) =>
                  handleFiltersChange((current) => ({ ...current, fechaCalculo: event.target.value }))
                }
              />
            </label>
            <div className="config-form-field config-form-field--inline">
              <span className="config-field-label">Gastos del periodo</span>
              <label className="config-checkbox">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  checked={filters.esGastoDelPeriodo ?? false}
                  onChange={(event) =>
                    handleFiltersChange((current) => ({
                      ...current,
                      esGastoDelPeriodo: event.target.checked,
                    }))
                  }
                />
                Solo del periodo
              </label>
              <button
                type="button"
                className="ghost"
                onClick={() => handleFiltersChange((current) => ({ ...current, esGastoDelPeriodo: undefined }))}
              >
                Limpiar estado
              </button>
            </div>
            <div className="centros-apoyo__filters-actions">
              <button type="button" className="ghost" onClick={handleClearFilters}>
                Limpiar filtros
              </button>
            </div>
          </div>

          {gastosWarning && <div className="centros-apoyo__warning">{gastosWarning}</div>}
          {gastosError && !gastosWarning && <div className="config-alert">{gastosError}</div>}

          {gastosLoading ? (
            <div className="table-empty">Cargando gastos…</div>
          ) : gastos.length === 0 ? (
            <div className="table-empty">
              {gastosWarning
                ? 'Selecciona una fecha de cálculo para comenzar.'
                : 'No se encontraron gastos con los filtros seleccionados.'}
            </div>
          ) : (
            <>
              <div className="centros-apoyo__summary">
                <div className="centros-apoyo__summary-card">
                  <span className="centros-apoyo__summary-label">Total de gastos</span>
                  <span className="centros-apoyo__summary-value">
                    {formatCurrency(gastosSummary.total, { currency: gastosCurrency })}
                  </span>
                </div>
                <div className="centros-apoyo__summary-card">
                  <span className="centros-apoyo__summary-label">Del periodo</span>
                  <span className="centros-apoyo__summary-value">
                    {formatCurrency(gastosSummary.periodTotal, { currency: gastosCurrency })}
                  </span>
                </div>
                <div className="centros-apoyo__summary-card">
                  <span className="centros-apoyo__summary-label">Fuera del periodo</span>
                  <span className="centros-apoyo__summary-value">
                    {formatCurrency(gastosSummary.outOfPeriodTotal, { currency: gastosCurrency })}
                  </span>
                </div>
                <div className="centros-apoyo__summary-card">
                  <span className="centros-apoyo__summary-label">Registros</span>
                  <span className="centros-apoyo__summary-value">{gastosCount}</span>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="centros-apoyo__chart" role="img" aria-label="Distribución de gastos por categoría">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value, { currency: gastosCurrency })} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="config-table__scroll">
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Del periodo</th>
                      <th>Fecha cálculo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map((gasto) => (
                      <tr key={gasto.id}>
                        <td>{gasto.concepto}</td>
                        <td className="centros-apoyo__cell-right">
                          {formatCurrency(gasto.monto, { currency: gastosCurrency })}
                        </td>
                        <td>
                          <span className={`badge ${gasto.esGastoDelPeriodo ? 'badge--activo' : 'badge--inactivo'}`}>
                            {gasto.esGastoDelPeriodo ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td>{formatDate(gasto.fechaCalculo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    );
  };


export default CentrosApoyoPage;
