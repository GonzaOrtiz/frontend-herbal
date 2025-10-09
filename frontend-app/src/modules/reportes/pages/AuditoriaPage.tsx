import React from 'react';
import ReportSection from '../components/ReportSection';
import DownloadLogTable from '../components/DownloadLogTable';
import ReportSkeleton from '../components/ReportSkeleton';
import { useReportQuery } from '../hooks/useReportQuery';
import { fetchDownloadLog } from '../api/reportesApi';

const AuditoriaPage: React.FC = () => {
  const downloadLogQuery = useReportQuery({ reportId: 'descargas', fetcher: fetchDownloadLog });

  return (
    <ReportSection
      title="Bitácora de descargas"
      description="Registra cada exportación con filtros utilizados, formato y usuario solicitante."
    >
      {downloadLogQuery.status === 'loading' && <ReportSkeleton />}
      {downloadLogQuery.status === 'error' && (
        <div role="alert" className="reportes-empty-state">
          <h4>No fue posible obtener la bitácora</h4>
          <p>Intenta nuevamente o verifica la configuración de auditoría.</p>
        </div>
      )}
      {downloadLogQuery.data && <DownloadLogTable logs={downloadLogQuery.data} />}
    </ReportSection>
  );
};

export default AuditoriaPage;
