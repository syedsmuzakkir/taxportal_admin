import React, { createContext, useContext, useState, useEffect } from 'react';
import { permissionsManager } from '../utils/permissionsManager.js';
import { useAuth } from './AuthContext.jsx';

const PermissionsContext = createContext();

export function PermissionsProvider({ children }) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState(permissionsManager.getAllPermissions());

  useEffect(() => {
    const unsubscribe = permissionsManager.subscribe(() => {
      setPermissions(permissionsManager.getAllPermissions());
    });

    return unsubscribe;
  }, []);

  const can = (permissionKey, context = {}) => {
    if (!user) return false;
    return permissionsManager.can(user.role, permissionKey, {
      ...context,
      userId: user.id,
      ownerId: context.ownerId || context.userId
    });
  };

  const updatePermissions = (permissionKey, allowedRoles) => {
    permissionsManager.updatePermission(permissionKey, allowedRoles);
  };

  const setRolePermissions = (role, permissionKeys) => {
    permissionsManager.setRolePermissions(role, permissionKeys);
  };

  const getRolePermissions = (role) => {
    return permissionsManager.getRolePermissions(role);
  };

  const resetToDefaults = () => {
    permissionsManager.resetToDefaults();
  };

  const value = {
    permissions,
    can,
    updatePermissions,
    setRolePermissions,
    getRolePermissions,
    resetToDefaults
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}