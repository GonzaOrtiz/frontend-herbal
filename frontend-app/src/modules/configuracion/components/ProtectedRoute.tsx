import React from 'react';
import { hasPermission } from '../stores/permissions';
import '../configuracion.css';

interface ProtectedRouteProps {
  permissions: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permissions, fallback, children }) => {
  const hasAccess = permissions.every((permission) => hasPermission(permission));

  if (!hasAccess) {
    return (
      <div className="config-alert" role="alert">
        {fallback ?? 'Tu usuario no cuenta con permisos para editar este catálogo. Contacta a tu administrador.'}
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
