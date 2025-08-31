import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';

export default function ProtectedRoute({ children, permission, context = {} }) {
  const { isAuthenticated, twoFAValidated, requires2FA, isLoading } = useAuth();
  const { can } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requires2FA && !twoFAValidated) {
    return <Navigate to="/2fa" replace />;
  }

  if (permission && !can(permission, context)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
}