import React from 'react';
import CostosModule from './index';
import type { CostosSubModulo } from './types';

export interface CostosRoute {
  id: CostosSubModulo;
  path: string;
  title: string;
  description: string;
  permissions: string[];
  element: React.ReactNode;
}

export function buildCostosRoutes(): CostosRoute[] {
  return [
    {
      id: 'gastos',
      path: 'gastos',
      title: 'Gastos por centro',
      description: 'Gestiona gastos operativos, valida balances y controla el prorrateo base.',
      permissions: ['costos.gastos'],
      element: <CostosModule initialSubmodule="gastos" />,
    },
    {
      id: 'depreciaciones',
      path: 'depreciaciones',
      title: 'Depreciaciones',
      description: 'Distribuye depreciaciones mensuales y revisa la vida útil de activos.',
      permissions: ['costos.depreciaciones'],
      element: <CostosModule initialSubmodule="depreciaciones" />,
    },
    {
      id: 'sueldos',
      path: 'sueldos',
      title: 'Sueldos y mano de obra',
      description: 'Controla sueldos registrados y sincronízalos con asignaciones y CIF.',
      permissions: ['costos.sueldos'],
      element: <CostosModule initialSubmodule="sueldos" />,
    }
    // , TODO: PRORRATEO AUTOMATICO DESHABILITADO POR AHORA, REVISAR FUNCIONALIDAD
    // {
    //   id: 'prorrateo',
    //   path: 'prorrateo',
    //   title: 'Prorrateo automático',
    //   description: 'Monitorea la bitácora del proceso automático y sus balances resultantes.',
    //   permissions: ['costos.prorrateo'],
    //   element: <CostosModule initialSubmodule="prorrateo" />,
    // },
  ];
}
