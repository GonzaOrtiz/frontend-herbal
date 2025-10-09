import React from 'react';
import ReportSection from '../components/ReportSection';
import ReportSummaryCards from '../components/ReportSummaryCards';
import ReportTable from '../components/ReportTable';
import ExportToolbar from '../components/ExportToolbar';
import ReportSkeleton from '../components/ReportSkeleton';
import ComparisonChart from '../components/ComparisonChart';
import { useReportQuery } from '../hooks/useReportQuery';
import { fetchComparativoReport, fetchCostosReport } from '../api/reportesApi';

const FinancierosPage: React.FC = () => {
  const costosQuery = useReportQuery({ reportId: 'costos', fetcher: fetchCostosReport });
  const comparativoQuery = useReportQuery({ reportId: 'comparativo', fetcher: fetchComparativoReport });

  const isLoading = costosQuery.status === 'loading';
  const hasError = costosQuery.status === 'error';

  return (
    <>
      <ReportSection
        title="Costos consolidados"
        description="Consulta costos, consumos y CIF consolidados con totales y tendencias clave."
        actions={<ExportToolbar reportId="costos" disabled={hasError} />}
      >
        {isLoading && <ReportSkeleton />}
        {hasError && (
          <div role="alert" className="reportes-empty-state">
            <h4>No fue posible cargar la información</h4>
            <p>Vuelve a intentarlo o ajusta los filtros seleccionados.</p>
          </div>
        )}
        {costosQuery.data && !hasError && (
          <>
            <ReportSummaryCards cards={costosQuery.data.cards} />
            {costosQuery.data.tables.map((table) => (
              <ReportTable key={table.id} descriptor={table} />
            ))}
          </>
        )}
      </ReportSection>

      <ReportSection
        title="Comparativo egresos vs insumos"
        description="Visualiza la diferencia entre egresos e insumos para validar la consistencia del periodo."
        actions={<ExportToolbar reportId="comparativo" disabled={comparativoQuery.status === 'error'} />}
      >
        {comparativoQuery.status === 'loading' && <ReportSkeleton />}
        {comparativoQuery.status === 'error' && (
          <div role="alert" className="reportes-empty-state">
            <h4>No fue posible obtener el comparativo</h4>
            <p>Verifica la conexión o intenta con un periodo distinto.</p>
          </div>
        )}
        {comparativoQuery.data && comparativoQuery.data.points.length > 0 && (
          <ComparisonChart data={comparativoQuery.data.points} insight={comparativoQuery.data.insight} />
        )}
      </ReportSection>
    </>
  );
};

export default FinancierosPage;
