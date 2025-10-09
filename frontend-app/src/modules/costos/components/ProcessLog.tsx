import React from 'react';
import type { ProcessLogEntry } from '../types';
import '../costos.css';

interface ProcessLogProps {
  logs: ProcessLogEntry[];
}

const levelLabel: Record<ProcessLogEntry['level'], string> = {
  info: 'Información',
  warning: 'Advertencia',
  error: 'Error',
};

const ProcessLog: React.FC<ProcessLogProps> = ({ logs }) => (
  <section className="costos-card costos-card--highlight">
    <h2>Bitácora del proceso</h2>
    {logs.length === 0 ? (
      <p className="costos-empty-state">Aún no se registran eventos para el proceso en curso.</p>
    ) : (
      <div className="costos-log-list">
        {logs.map((log) => (
          <article key={log.id} className="costos-log-entry" data-level={log.level}>
            <header>
              <strong>{levelLabel[log.level]}</strong>
              <span> · {new Date(log.timestamp).toLocaleString('es-MX')}</span>
            </header>
            <p>{log.message}</p>
            {log.actor && <p className="costos-metadata">Responsable: {log.actor}</p>}
          </article>
        ))}
      </div>
    )}
  </section>
);

export default ProcessLog;
