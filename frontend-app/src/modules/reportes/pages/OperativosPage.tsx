import React from 'react';
import ReportSection from '../components/ReportSection';
import ReportTable from '../components/ReportTable';
import ReportSkeleton from '../components/ReportSkeleton';
import ExportToolbar from '../components/ExportToolbar';
import { useReportQuery } from '../hooks/useReportQuery';
import { fetchAsignacionesReport, fetchConsumosReport, fetchManoObraReport } from '../api/reportesApi';

const OperativosPage: React.FC = () => {
  const consumosQuery = useReportQuery({ reportId: 'consumos', fetcher: fetchConsumosReport });
  const asignacionesQuery = useReportQuery({ reportId: 'asignaciones', fetcher: fetchAsignacionesReport });
  const manoObraQuery = useReportQuery({ reportId: 'mano-obra', fetcher: fetchManoObraReport });

  return (
    <>
      <ReportSection
        title="Consumos consolidados"
        description="Revisa consumos por producto y unidad con totales acumulados."
        actions={<ExportToolbar reportId="consumos" disabled={consumosQuery.status === 'error'} />}
      >
        {consumosQuery.status === 'loading' && <ReportSkeleton />}
        {consumosQuery.status === 'error' && (
          <div role="alert" className="reportes-empty-state">
            <h4>Error al cargar consumos</h4>
            <p>Intenta nuevamente o ajusta tus filtros.</p>
          </div>
        )}
        {consumosQuery.data && <ReportTable descriptor={consumosQuery.data} />}
      </ReportSection>

      <ReportSection
        title="Asignaciones por centro"
        description="Horas y porcentajes aplicados por actividad y centro de producción."
        actions={<ExportToolbar reportId="asignaciones" disabled={asignacionesQuery.status === 'error'} />}
      >
        {asignacionesQuery.status === 'loading' && <ReportSkeleton />}
        {asignacionesQuery.status === 'error' && (
          <div role="alert" className="reportes-empty-state">
            <h4>No fue posible cargar las asignaciones</h4>
            <p>Revisa tu conexión o cambia los filtros.</p>
          </div>
        )}
        {asignacionesQuery.data && <ReportTable descriptor={asignacionesQuery.data} />}
      </ReportSection>

      <ReportSection
        title="Mano de obra por actividad"
        description="Detalle de horas y monto asignado por actividad operativa."
        actions={<ExportToolbar reportId="mano-obra" disabled={manoObraQuery.status === 'error'} />}
      >
        {manoObraQuery.status === 'loading' && <ReportSkeleton />}
        {manoObraQuery.status === 'error' && (
          <div role="alert" className="reportes-empty-state">
            <h4>No se pudo recuperar la información de mano de obra</h4>
            <p>Vuelve a ejecutar la consulta más tarde.</p>
          </div>
        )}
        {manoObraQuery.data && <ReportTable descriptor={manoObraQuery.data} />}
      </ReportSection>
    </>
  );
};

export default OperativosPage;
