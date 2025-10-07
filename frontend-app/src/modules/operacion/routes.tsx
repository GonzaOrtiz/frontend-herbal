import React from 'react';
import OperacionModule from './index';
import type { OperacionModulo } from './types';

export interface OperacionRoute {
  id: OperacionModulo;
  path: string;
  title: string;
  description: string;
  permissions: string[];
  element: React.ReactNode;
}

export function buildOperacionRoutes(): OperacionRoute[] {
  return [
    {
      id: 'consumos',
      path: 'consumos',
      title: 'Consumos',
      description: 'Captura y valida consumos diarios según documentación funcional.',
      permissions: ['operacion.consumos'],
      element: <OperacionModule />,
    },
    {
      id: 'producciones',
      path: 'producciones',
      title: 'Producciones',
      description: 'Gestiona órdenes de producción y sincronización con existencias.',
      permissions: ['operacion.producciones'],
      element: <OperacionModule />,
    },
    {
      id: 'litros',
      path: 'litros',
      title: 'Litros de crema',
      description: 'Monitoreo de litros de crema por lote y turno.',
      permissions: ['operacion.litros'],
      element: <OperacionModule />,
    },
    {
      id: 'perdidas',
      path: 'perdidas',
      title: 'Pérdidas',
      description: 'Registro y auditoría de pérdidas y mermas.',
      permissions: ['operacion.perdidas'],
      element: <OperacionModule />,
    },
    {
      id: 'sobrantes',
      path: 'sobrantes',
      title: 'Sobrantes',
      description: 'Control de sobrantes y destino final.',
      permissions: ['operacion.sobrantes'],
      element: <OperacionModule />,
    },
  ];
}
