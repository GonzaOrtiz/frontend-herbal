import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@/lib/query/QueryClient';
import type { ExportProgress, ReportFilters, ReportFormat, ReportId } from '../types';
import { exportReport, logDownload } from '../api/reportesApi';
import { useReportesContext } from '../context/ReportesContext';

interface UseReportExportResult {
  progress: ExportProgress;
  exportAsCsv: () => Promise<void>;
  exportAsXlsx: () => Promise<void>;
  reset: () => void;
}

const initialProgress: ExportProgress = { status: 'idle', percentage: 0 };

export function useReportExport(reportId: ReportId): UseReportExportResult {
  const queryClient = useQueryClient();
  const { filters } = useReportesContext();
  const [progress, setProgress] = useState<ExportProgress>(initialProgress);

  const performExport = useCallback(
    async (format: Exclude<ReportFormat, 'json'>) => {
      setProgress({ status: 'preparing', percentage: 10, message: 'Generando archivo…' });
      try {
        const result = await exportReport(reportId, filters, format);
        if (result.status === 'error') {
          setProgress(result);
          await logDownload(reportId, filters, format, 'failed', 0);
          return;
        }

        setProgress({
          ...result,
          status: 'completed',
          message: result.message ?? 'Descarga lista.',
          percentage: 100,
        });

        await logDownload(reportId, filters, format, 'completed', result.rowCount ?? 0);

        if (result.downloadUrl && typeof window !== 'undefined') {
          window.open(result.downloadUrl, '_blank', 'noopener');
        }
      } catch (error) {
        setProgress({
          status: 'error',
          percentage: 100,
          error: 'No fue posible completar la exportación. Intenta nuevamente.',
        });
        await logDownload(reportId, filters, format, 'failed', 0);
      } finally {
        queryClient.invalidateQueries(['reportes', 'descargas']);
      }
    },
    [filters, queryClient, reportId],
  );

  const exportAsCsv = useCallback(() => performExport('csv'), [performExport]);
  const exportAsXlsx = useCallback(() => performExport('xlsx'), [performExport]);

  const reset = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  return useMemo(
    () => ({
      progress,
      exportAsCsv,
      exportAsXlsx,
      reset,
    }),
    [progress, exportAsCsv, exportAsXlsx, reset],
  );
}
