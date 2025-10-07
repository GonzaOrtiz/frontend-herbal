import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

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
    meta: { title: 'Inicio', icon: <RouteIcon name="home" /> },
  },
  {
    path: '/configuracion',
    element: <ConfigPage />,
    meta: { title: 'Configuración', icon: <RouteIcon name="settings" /> },
  },
  {
    path: '/reportes',
    element: <ReportsPage />,
    meta: { title: 'Reportes', icon: <RouteIcon name="reports" /> },
  },
  // Agregar más rutas y dominios según system-overview
];

function RouteIcon({ name }: { name: 'home' | 'settings' | 'reports' }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
          <path
            d="M4 10.5 12 4l8 6.5V21h-6v-5h-4v5H4z"
            fill="currentColor"
          />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
          <path
            d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7 7 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 14.9 2h-3.8a.5.5 0 0 0-.5.42l-.36 2.54a7 7 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.7 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.82 13.6a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .5.42h3.8a.5.5 0 0 0 .5-.42l.36-2.54c.58-.22 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zm-7.14 1.56a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
            fill="currentColor"
          />
        </svg>
      );
    case 'reports':
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
          <path
            d="M5 3h14a2 2 0 0 1 2 2v14l-4-3-4 3-4-3-4 3V5a2 2 0 0 1 2-2zm2 4v4h2V7zm4 3v3h2v-3zm4-5v8h2V5z"
            fill="currentColor"
          />
        </svg>
      );
    default:
      return null;
  }
}
