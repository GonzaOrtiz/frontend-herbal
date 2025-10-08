import React, { useEffect, useMemo, useState } from 'react';
import CostosTabs from './CostosTabs';
import CostosFilterBar from './CostosFilterBar';
import CostosDataTable from './CostosDataTable';
import BalanceSummary from './BalanceSummary';
import AllocationBreakdown from './AllocationBreakdown';
import TrendChart from './TrendChart';
import AuditTimeline from './AuditTimeline';
import ProcessLog from './ProcessLog';
import ProcessRunnerDialog from './ProcessRunnerDialog';
import { costosConfigs } from '../pages/config';
import { useCostosContext } from '../context/CostosContext';
import { useCostosData } from '../hooks/useCostosData';
import { useProcessRunner } from '../hooks/useProcessRunner';
import type { BaseCostRecord, CostosRecordMap, CostosSubModulo } from '../types';
import '../costos.css';

const CostosLayout: React.FC = () => {
  const { submodule } = useCostosContext();
  const effectiveSubmodule = (submodule === 'prorrateo' ? 'gastos' : submodule) as Exclude<CostosSubModulo, 'prorrateo'>;
  const config = costosConfigs[effectiveSubmodule];
  const { query, summary, allocation, trend, formattedSummary } =
    useCostosData<Exclude<CostosSubModulo, 'prorrateo'>>();
  const { processState, start, cancel, retry } = useProcessRunner();
  const [selected, setSelected] = useState<BaseCostRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (query.data && query.data.items.length > 0) {
      setSelected(query.data.items[0]);
    } else {
      setSelected(null);
    }
  }, [query.data, submodule]);

  const records = useMemo(
    () => (query.data?.items ?? []) as CostosRecordMap[Exclude<CostosSubModulo, 'prorrateo'>][],
    [query.data],
  );

  const headerDescription =
    'Calcula, distribuye y consolida costos operativos asegurando trazabilidad entre centros, existencias y asientos.';

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
          <button type="button">Ver existencias</button>
          <button type="button">Ir a asientos</button>
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
        process={processState}
      />
    </div>
  );
};

export default CostosLayout;
