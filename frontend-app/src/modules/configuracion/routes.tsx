import React from 'react';
import ActividadesPage from './pages/ActividadesPage';
import CentrosPage from './pages/CentrosPage';
import EmpleadosPage from './pages/EmpleadosPage';
import ParametrosGeneralesPage from './pages/ParametrosGeneralesPage';
import type { ConfigRoute } from './types';

export function buildConfigRoutes(): ConfigRoute[] {
  return [
    {
      id: 'actividades',
      path: 'actividades',
      meta: {
        title: 'Actividades',
        description: 'Gestiona las actividades operativas que se sincronizan con los módulos de consumo y producción.',
        breadcrumb: ['Configuración', 'Catálogos', 'Actividades'],
        permissions: { read: 'catalogos.read', write: 'catalogos.write' },
        featureFlag: 'catalogoActividades',
        dependencies: ['consumos', 'producción'],
        secondaryNavLabel: 'Actividades',
      },
      element: <ActividadesPage />,
    },
    {
      id: 'empleados',
      path: 'empleados',
      meta: {
        title: 'Empleados',
        description: 'Administra credenciales y asignaciones de personal incluyendo turnos y roles aprobadores.',
        breadcrumb: ['Configuración', 'Catálogos', 'Empleados'],
        permissions: { read: 'catalogos.read', write: 'catalogos.write' },
        featureFlag: 'catalogoEmpleados',
        dependencies: ['centros', 'asignaciones'],
        secondaryNavLabel: 'Empleados',
      },
      element: <EmpleadosPage />,
    },
    {
      id: 'centros',
      path: 'centros',
      meta: {
        title: 'Centros de costo',
        description: 'Catálogo maestro de centros de producción y apoyo con sus responsables y jerarquías.',
        breadcrumb: ['Configuración', 'Catálogos', 'Centros'],
        permissions: { read: 'catalogos.read', write: 'catalogos.write' },
        featureFlag: 'catalogoCentros',
        dependencies: ['producción'],
        secondaryNavLabel: 'Centros',
      },
      element: <CentrosPage />,
    },
    {
      id: 'parametros-generales',
      path: 'parametros-generales',
      meta: {
        title: 'Parámetros generales',
        description: 'Define parámetros transversales como fecha de cálculo y reglas contables predeterminadas.',
        breadcrumb: ['Configuración', 'Parámetros', 'Generales'],
        permissions: { read: 'catalogos.read', write: 'catalogos.write' },
        featureFlag: 'parametrosGenerales',
        dependencies: ['planificación', 'reportes'],
        secondaryNavLabel: 'Parámetros',
      },
      element: <ParametrosGeneralesPage />,
    },
  ];
}
