import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import TableChartIcon from '@mui/icons-material/TableChart';

// Ejemplo de lazy loading de páginas
const HomePage = lazy(() => import('@/modules/home/HomePage'));
const ConfigPage = lazy(() => import('@/modules/config/ConfigPage'));
const ReportsPage = lazy(() => import('@/modules/reports/ReportsPage'));

export interface AppRouteMeta {
  title: string;
  icon: JSX.Element;
  permissions?: string[];
}

export interface AppRouteObject extends RouteObject {
  meta?: AppRouteMeta;
  children?: AppRouteObject[];
}

export const appRoutes: AppRouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
    meta: { title: 'Inicio', icon: <HomeIcon /> },
  },
  {
    path: '/configuracion',
    element: <ConfigPage />,
    meta: { title: 'Configuración', icon: <SettingsIcon /> },
  },
  {
    path: '/reportes',
    element: <ReportsPage />,
    meta: { title: 'Reportes', icon: <TableChartIcon /> },
  },
  // Agregar más rutas y dominios según system-overview
];
