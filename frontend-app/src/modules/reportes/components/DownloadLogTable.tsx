import React from 'react';
import type { ReportDownloadLog } from '../types';

interface DownloadLogTableProps {
  logs: ReportDownloadLog[];
}

const DownloadLogTable: React.FC<DownloadLogTableProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="reportes-empty-state" role="status" aria-live="polite">
        <h4>Sin descargas registradas</h4>
        <p>Aún no se han registrado descargas con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="reportes-table-wrapper">
      <table className="reportes-table" aria-label="Bitácora de descargas">
        <thead>
          <tr>
            <th scope="col">Reporte</th>
            <th scope="col">Formato</th>
            <th scope="col">Filtrado</th>
            <th scope="col">Solicitado por</th>
            <th scope="col">Solicitado</th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.reportId}</td>
              <td>{log.format.toUpperCase()}</td>
              <td>
                {Object.entries(log.filters).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value ?? '—'}
                  </div>
                ))}
              </td>
              <td>{log.createdBy}</td>
              <td>{new Date(log.requestedAt).toLocaleString('es-MX')}</td>
              <td>{log.status === 'completed' ? 'Completado' : log.status === 'failed' ? 'Fallido' : 'Pendiente'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DownloadLogTable;
