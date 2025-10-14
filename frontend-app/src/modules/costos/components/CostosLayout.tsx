import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/http/apiClient';
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
import ConfirmDialog from '../../configuracion/components/ConfirmDialog';
import { costosConfigs } from '../pages/config';
import { useCostosContext } from '../context/CostosContext';
import { useCostosData } from '../hooks/useCostosData';
import { useProcessRunner } from '../hooks/useProcessRunner';
import type { BaseCostRecord, CostosRecordMap, CostosSubModulo, SueldoRecord } from '../types';
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
  const [pendingDelete, setPendingDelete] = useState<SueldoRecord | null>(null);
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
    setPendingDelete(null);
    setDeleteError(null);
    setIsDeleting(false);
  }, [effectiveSubmodule]);

  const records = useMemo(
    () => (query.data?.items ?? []) as CostosRecordMap[Exclude<CostosSubModulo, 'prorrateo'>][],
    [query.data],
  );

  const headerDescription =
    'Calcula, distribuye y consolida costos operativos asegurando trazabilidad entre centros, existencias y asientos.';

  const navigationDisabledMessage =
    'Disponible cuando se habilite la navegación directa hacia Existencias y Asientos.';

  const handleAction = useCallback(
    (actionId: string) => {
      if (effectiveSubmodule === 'sueldos' && actionId === 'registrar') {
        setRegisterDialogMode('create');
        setEditingSalary(null);
        setRegisterDialogOpen(true);
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
    setPendingDelete(salary);
    setDeleteError(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await apiClient.delete(`/api/costos/sueldo/${pendingDelete.id}`);
      if (selected?.id === pendingDelete.id) {
        setSelected(null);
      }
      await query.refetch();
      setPendingDelete(null);
    } catch (error) {
      setDeleteError('No se pudo eliminar el sueldo. Intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, pendingDelete, query, selected]);

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
            <section className="costos-card">
              <h2>Prorrateo automático</h2>
              <p className="costos-metadata">
                El backend ejecuta el prorrateo al cerrar importaciones o sincronizaciones. Este panel muestra el balance más
                reciente y permite monitorear la bitácora del proceso.
              </p>
              <div className="costos-summary-grid">
                <div className="costos-summary-item">
                  <span>{formattedSummary.total}</span>
                  <span>Total costos base</span>
                </div>
                <div className="costos-summary-item">
                  <span>{formattedSummary.balance}</span>
                  <span>Balance consolidado</span>
                </div>
                {formattedSummary.variation && (
                  <div className="costos-summary-item">
                    <span>{formattedSummary.variation}</span>
                    <span>Variación vs periodo previo</span>
                  </div>
                )}
              </div>
              {formattedSummary.warning && <p className="costos-warning">{formattedSummary.warning}</p>}
            </section>
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
              rowActions={
                effectiveSubmodule === 'sueldos'
                  ? {
                      header: 'Acciones',
                      width: '180px',
                      render: (record) => {
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
                    }
                  : undefined
              }
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
          <TrendChart points={trend} />
          <AuditTimeline record={selected} />
          <ProcessLog logs={processState.logs} />
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
      {pendingDelete && (
        <ConfirmDialog
          open
          title="Eliminar sueldo"
          description={`${deleteError ? `${deleteError} ` : ''}¿Deseas eliminar el sueldo del empleado ${pendingDelete.empleadoNombre ?? pendingDelete.nroEmpleado}?`}
          confirmLabel={isDeleting ? 'Eliminando…' : 'Eliminar'}
          cancelLabel="Cancelar"
          onCancel={() => {
            if (isDeleting) {
              return;
            }
            setPendingDelete(null);
            setDeleteError(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
};

export default CostosLayout;
