import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/http/apiClient';
import { getCurrencySymbol } from '@/lib/formatters';
import CostosTabs from './CostosTabs';
import CostosFilterBar from './CostosFilterBar';
import CostosDataTable from './CostosDataTable';
import BalanceSummary from './BalanceSummary';
import AllocationBreakdown from './AllocationBreakdown';
import TrendChart from './TrendChart';
import AuditTimeline from './AuditTimeline';
import ProcessLog from './ProcessLog';
import ProcessRunnerDialog from './ProcessRunnerDialog';
import RegisterSalaryDialog from './RegisterSalaryDialog';
import RegisterDepreciationDialog from './RegisterDepreciationDialog';
import ConfirmDialog from '../../configuracion/components/ConfirmDialog';
import { costosConfigs } from '../pages/config';
import { useCostosContext } from '../context/CostosContext';
import { useCostosData } from '../hooks/useCostosData';
import { useProcessRunner } from '../hooks/useProcessRunner';
import type {
  BaseCostRecord,
  CostosRecordMap,
  CostosSubModulo,
  DepreciacionRecord,
  SueldoRecord,
} from '../types';
import '../costos.css';

const CostosLayout: React.FC = () => {
  const { submodule, lastSummary } = useCostosContext();
  const effectiveSubmodule = (submodule === 'prorrateo' ? 'gastos' : submodule) as Exclude<CostosSubModulo, 'prorrateo'>;
  const config = costosConfigs[effectiveSubmodule];
  const { query, summary, allocation, trend, formattedSummary } =
    useCostosData<Exclude<CostosSubModulo, 'prorrateo'>>();
  const { processState, start, cancel, retry } = useProcessRunner();
  const [selected, setSelected] = useState<BaseCostRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registerDialogMode, setRegisterDialogMode] = useState<'create' | 'edit'>('create');
  const [editingSalary, setEditingSalary] = useState<SueldoRecord | null>(null);
  const [registerDepreciationOpen, setRegisterDepreciationOpen] = useState(false);
  const [registerDepreciationMode, setRegisterDepreciationMode] = useState<'create' | 'edit'>('create');
  const [editingDepreciation, setEditingDepreciation] = useState<DepreciacionRecord | null>(null);
  const [pendingSalaryDelete, setPendingSalaryDelete] = useState<SueldoRecord | null>(null);
  const [pendingDepreciationDelete, setPendingDepreciationDelete] = useState<DepreciacionRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (query.data && query.data.items.length > 0) {
      setSelected(query.data.items[0]);
    } else {
      setSelected(null);
    }
  }, [query.data, submodule]);

  useEffect(() => {
    setRegisterDialogOpen(false);
    setRegisterDialogMode('create');
    setEditingSalary(null);
    setRegisterDepreciationOpen(false);
    setRegisterDepreciationMode('create');
    setEditingDepreciation(null);
    setPendingSalaryDelete(null);
    setPendingDepreciationDelete(null);
    setDeleteError(null);
    setIsDeleting(false);
  }, [effectiveSubmodule]);

  const records = useMemo(
    () => (query.data?.items ?? []) as CostosRecordMap[Exclude<CostosSubModulo, 'prorrateo'>][],
    [query.data],
  );

  const headerDescription =
    'Calcula, distribuye y consolida costos operativos asegurando trazabilidad entre centros, existencias y asientos.';
  const baseCurrencySymbol = useMemo(() => getCurrencySymbol(summary.currency), [summary.currency]);

  const navigationDisabledMessage =
    'Disponible cuando se habilite la navegación directa hacia Existencias y Asientos.';

  const handleAction = useCallback(
    (actionId: string) => {
      if (effectiveSubmodule === 'sueldos' && actionId === 'registrar') {
        setRegisterDialogMode('create');
        setEditingSalary(null);
        setRegisterDialogOpen(true);
      }
      if (effectiveSubmodule === 'depreciaciones' && actionId === 'registrar') {
        setRegisterDepreciationMode('create');
        setEditingDepreciation(null);
        setRegisterDepreciationOpen(true);
      }
    },
    [effectiveSubmodule],
  );

  const handleEditSalary = useCallback((salary: SueldoRecord) => {
    setRegisterDialogMode('edit');
    setEditingSalary(salary);
    setRegisterDialogOpen(true);
  }, []);

  const handleDeleteSalary = useCallback((salary: SueldoRecord) => {
    setPendingDepreciationDelete(null);
    setPendingSalaryDelete(salary);
    setDeleteError(null);
  }, []);

  const handleEditDepreciation = useCallback((depreciation: DepreciacionRecord) => {
    setRegisterDepreciationMode('edit');
    setEditingDepreciation(depreciation);
    setRegisterDepreciationOpen(true);
  }, []);

  const handleDeleteDepreciation = useCallback((depreciation: DepreciacionRecord) => {
    setPendingSalaryDelete(null);
    setPendingDepreciationDelete(depreciation);
    setDeleteError(null);
  }, []);

  const confirmDeleteSalary = useCallback(async () => {
    if (!pendingSalaryDelete || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await apiClient.delete(`/api/costos/sueldo/${pendingSalaryDelete.id}`);
      if (selected?.id === pendingSalaryDelete.id) {
        setSelected(null);
      }
      await query.refetch();
      setPendingSalaryDelete(null);
    } catch (error) {
      setDeleteError('No se pudo eliminar el sueldo. Intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, pendingSalaryDelete, query, selected]);

  const confirmDeleteDepreciation = useCallback(async () => {
    if (!pendingDepreciationDelete || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await apiClient.delete(`/api/costos/depreciacion/${pendingDepreciationDelete.id}`);
      if (selected?.id === pendingDepreciationDelete.id) {
        setSelected(null);
      }
      await query.refetch();
      setPendingDepreciationDelete(null);
    } catch (error) {
      setDeleteError('No se pudo eliminar la depreciación. Intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, pendingDepreciationDelete, query, selected]);

  return (
    <div className="costos-module">
      <header className="costos-header">
        <div>
          <h1>Costos y consolidaciones</h1>
          <p>{headerDescription}</p>
        </div>
        <div className="costos-actions">
          <button type="button" className="primary" onClick={() => setDialogOpen(true)}>
            Seguimiento de consolidación
          </button>
          <button type="button" disabled title={navigationDisabledMessage}>
            Ver existencias
          </button>
          <button type="button" disabled title={navigationDisabledMessage}>
            Ir a asientos
          </button>
        </div>
      </header>

      <CostosTabs />

      {submodule !== 'prorrateo' && <CostosFilterBar />}

      <div className="costos-layout">
        <div className="costos-main">
          {submodule === 'prorrateo' ? (
            // <section className="costos-card">
            //   <h2>Prorrateo automático</h2>
            //   <p className="costos-metadata">
            //     El backend ejecuta el prorrateo al cerrar importaciones o sincronizaciones. Este panel muestra el balance más
            //     reciente y permite monitorear la bitácora del proceso.
            //   </p>
            //   <div className="costos-summary-grid">
            //     <div className="costos-summary-item">
            //       <span>{formattedSummary.total}</span>
            //       <span>Total costos base</span>
            //     </div>
            //     <div className="costos-summary-item">
            //       <span>{formattedSummary.balance}</span>
            //       <span>Balance consolidado</span>
            //     </div>
            //     {formattedSummary.variation && (
            //       <div className="costos-summary-item">
            //         <span>{formattedSummary.variation}</span>
            //         <span>Variación vs periodo previo</span>
            //       </div>
            //     )}
            //   </div>
            //   {formattedSummary.warning && <p className="costos-warning">{formattedSummary.warning}</p>}
            // </section>
            // TODO: Prorrate automatico automático
            <div></div>
          ) : (
            <CostosDataTable
              config={config}
              records={records as CostosRecordMap[Exclude<CostosSubModulo, 'prorrateo'>][]}
              currency={summary.currency}
              loading={query.status === 'loading'}
              error={query.error}
              onRetry={query.refetch}
              onSelect={(record) => setSelected(record as BaseCostRecord)}
              selectedId={selected?.id ?? null}
              onAction={handleAction}
              rowActions={(() => {
                if (effectiveSubmodule === 'sueldos') {
                  return {
                    header: 'Acciones',
                    width: '180px',
                    render: (record: CostosRecordMap['sueldos']) => {
                      const sueldoRecord = record as SueldoRecord;
                      return (
                        <div className="costos-row-actions">
                          <button
                            type="button"
                            className="costos-row-actions__edit"
                            onClick={() => handleEditSalary(sueldoRecord)}
                          >
                            <span className="costos-row-actions__icon" aria-hidden="true">
                              ✏️
                            </span>
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className="costos-row-actions__delete"
                            onClick={() => handleDeleteSalary(sueldoRecord)}
                          >
                            <span className="costos-row-actions__icon" aria-hidden="true">
                              🗑️
                            </span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      );
                    },
                  };
                }

                if (effectiveSubmodule === 'depreciaciones') {
                  return {
                    header: 'Acciones',
                    width: '180px',
                    render: (record: CostosRecordMap['depreciaciones']) => {
                      const depreciationRecord = record as DepreciacionRecord;
                      return (
                        <div className="costos-row-actions">
                          <button
                            type="button"
                            className="costos-row-actions__edit"
                            onClick={() => handleEditDepreciation(depreciationRecord)}
                          >
                            <span className="costos-row-actions__icon" aria-hidden="true">
                              ✏️
                            </span>
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className="costos-row-actions__delete"
                            onClick={() => handleDeleteDepreciation(depreciationRecord)}
                          >
                            <span className="costos-row-actions__icon" aria-hidden="true">
                              🗑️
                            </span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      );
                    },
                  };
                }

                return undefined;
              })()}
            />
          )}
        </div>
        <div className="costos-sidebar">
          <BalanceSummary
            summary={summary}
            formatted={formattedSummary}
            onRefresh={() => {
              void query.refetch();
            }}
            isLoading={query.status === 'loading'}
          />
          <AllocationBreakdown items={allocation} currency={summary.currency} />
          <TrendChart points={trend} currency={summary.currency} />
        </div>
      </div>

      <ProcessRunnerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStart={() => start()}
        onCancel={() => cancel()}
        onRetry={() => retry()}
        onRefresh={() => query.refetch()}
        process={processState}
        latestSummary={lastSummary}
      />
      {effectiveSubmodule === 'sueldos' && (
        <RegisterSalaryDialog
          open={registerDialogOpen}
          onClose={() => {
            setRegisterDialogOpen(false);
            setRegisterDialogMode('create');
            setEditingSalary(null);
          }}
          onSuccess={async () => {
            setRegisterDialogOpen(false);
            setRegisterDialogMode('create');
            setEditingSalary(null);
            await query.refetch();
          }}
          mode={registerDialogMode}
          salary={editingSalary}
        />
      )}
      {effectiveSubmodule === 'depreciaciones' && (
        <RegisterDepreciationDialog
          open={registerDepreciationOpen}
          onClose={() => {
            setRegisterDepreciationOpen(false);
            setRegisterDepreciationMode('create');
            setEditingDepreciation(null);
          }}
          onSuccess={async () => {
            setRegisterDepreciationOpen(false);
            setRegisterDepreciationMode('create');
            setEditingDepreciation(null);
            await query.refetch();
          }}
          mode={registerDepreciationMode}
          depreciation={editingDepreciation}
        />
      )}
      {pendingSalaryDelete && (
        <ConfirmDialog
          open
          title="Eliminar sueldo"
          description={`${deleteError ? `${deleteError} ` : ''}¿Deseas eliminar el sueldo del empleado ${pendingSalaryDelete.empleadoNombre ?? pendingSalaryDelete.nroEmpleado}?`}
          confirmLabel={isDeleting ? 'Eliminando…' : 'Eliminar'}
          cancelLabel="Cancelar"
          onCancel={() => {
            if (isDeleting) {
              return;
            }
            setPendingSalaryDelete(null);
            setDeleteError(null);
          }}
          onConfirm={() => {
            void confirmDeleteSalary();
          }}
        />
      )}
      {pendingDepreciationDelete && (
        <ConfirmDialog
          open
          title="Eliminar depreciación"
          description={`${
            deleteError ? `${deleteError} ` : ''
          }¿Deseas eliminar la depreciación de la máquina ${pendingDepreciationDelete.maquina}?`}
          confirmLabel={isDeleting ? 'Eliminando…' : 'Eliminar'}
          cancelLabel="Cancelar"
          onCancel={() => {
            if (isDeleting) {
              return;
            }
            setPendingDepreciationDelete(null);
            setDeleteError(null);
          }}
          onConfirm={() => {
            void confirmDeleteDepreciation();
          }}
        />
      )}
    </div>
  );
};

export default CostosLayout;
