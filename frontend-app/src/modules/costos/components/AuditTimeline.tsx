import React from 'react';
import type { BaseCostRecord } from '../types';
import '../costos.css';

interface AuditTimelineProps {
  record: BaseCostRecord | null;
}

const AuditTimeline: React.FC<AuditTimelineProps> = ({ record }) => {
  if (!record) {
    return (
      <section className="costos-card costos-card--highlight">
        <h2>Auditoría</h2>
        <p className="costos-empty-state">Selecciona un registro para visualizar su historial de auditoría.</p>
      </section>
    );
  }

  return (
    <section className="costos-card costos-card--highlight">
      <h2>Auditoría</h2>
      <div className="costos-audit-timeline">
        <div className="costos-audit-entry">
          <strong>Creado por {record.createdBy ?? 'N/D'}</strong>
          <span>{record.createdAt ? new Date(record.createdAt).toLocaleString('es-MX') : 'Fecha no disponible'}</span>
        </div>
        {record.updatedAt && (
          <div className="costos-audit-entry">
            <strong>Actualizado por {record.updatedBy ?? 'N/D'}</strong>
            <span>{new Date(record.updatedAt).toLocaleString('es-MX')}</span>
          </div>
        )}
        {record.accessId && (
          <div className="costos-audit-entry">
            <strong>Referencia Access</strong>
            <span>{record.accessId}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default AuditTimeline;
