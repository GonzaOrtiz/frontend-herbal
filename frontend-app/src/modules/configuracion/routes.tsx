import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import ProtectedRoute from './components/ProtectedRoute';

const ActividadesPage = lazy(() => import('./pages/ActividadesPage'));
const EmpleadosPage = lazy(() => import('./pages/EmpleadosPage'));
const CentrosPage = lazy(() => import('./pages/CentrosPage'));

// Simulación de permisos del usuario (en la práctica, obtén esto de contexto o props)
const userPermissions = ['catalogos.read'];

export const configRoutes: RouteObject[] = [
  {
    path: 'actividades',
    element: (
      <ProtectedRoute permissions={['catalogos.read', 'catalogos.write']} userPermissions={userPermissions}>
        <ActividadesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'empleados',
    element: (
      <ProtectedRoute permissions={['catalogos.read', 'catalogos.write']} userPermissions={userPermissions}>
        <EmpleadosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'centros',
    element: (
      <ProtectedRoute permissions={['catalogos.read', 'catalogos.write']} userPermissions={userPermissions}>
        <CentrosPage />
      </ProtectedRoute>
    ),
  },
  // Agregar más rutas según catálogos prioritarios
];
