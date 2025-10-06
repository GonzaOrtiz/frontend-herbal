import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  permissions: string[];
  userPermissions: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permissions, userPermissions, children }) => {
  const hasAccess = permissions.every(p => userPermissions.includes(p));
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
