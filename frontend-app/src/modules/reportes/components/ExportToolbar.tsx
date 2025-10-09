import React from 'react';
import type { ExportProgress, ReportFormat, ReportId } from '../types';
import { useReportExport } from '../hooks/useReportExport';

interface ExportToolbarProps {
  reportId: ReportId;
  disabled?: boolean;
}

const statusMessageMap: Record<ExportProgress['status'], string> = {
  idle: 'Listo para exportar',
  preparing: 'Preparando exportación…',
  downloading: 'Descargando…',
  completed: 'Exportación completada',
  error: 'Error en la exportación',
};

const ExportToolbar: React.FC<ExportToolbarProps> = ({ reportId, disabled }) => {
  const { progress, exportAsCsv, exportAsXlsx } = useReportExport(reportId);

  const isBusy = progress.status === 'preparing' || progress.status === 'downloading';
  const canExport = !disabled && progress.status !== 'error';

  const handleExport = (format: Exclude<ReportFormat, 'json'>) => {
    if (format === 'csv') {
      void exportAsCsv();
    } else {
      void exportAsXlsx();
    }
  };

  return (
    <div className="reportes-export-bar" role="group" aria-label="Exportar resultados">
      <button type="button" onClick={() => handleExport('csv')} disabled={!canExport || isBusy}>
        Descargar CSV
      </button>
      <button type="button" onClick={() => handleExport('xlsx')} disabled={!canExport || isBusy}>
        Descargar Excel
      </button>
      <span className="reportes-export-bar__status" role="status" aria-live="polite">
        {statusMessageMap[progress.status]}
        {progress.status === 'error' && progress.error ? ` · ${progress.error}` : ''}
      </span>
    </div>
  );
};

export default ExportToolbar;
