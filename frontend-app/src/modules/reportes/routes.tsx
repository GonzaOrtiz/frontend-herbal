import type { ReportRoute } from './types';

export function buildReportesRoutes(): ReportRoute[] {
  return [
    {
      id: 'financieros',
      path: 'financieros',
      title: 'Reportes financieros',
      description: 'Consolida costos, CIF y comparativos de egresos vs insumos.',
      permissions: ['reportes.financieros'],
    },
    {
      id: 'operativos',
      path: 'operativos',
      title: 'Reportes operativos',
      description: 'Monitorea consumos, asignaciones y mano de obra diaria.',
      permissions: ['reportes.operativos'],
    },
    {
      id: 'auditoria',
      path: 'auditoria',
      title: 'Auditoría y bitácoras',
      description: 'Da seguimiento a exportaciones y parámetros utilizados.',
      permissions: ['reportes.auditoria'],
    },
  ];
}
