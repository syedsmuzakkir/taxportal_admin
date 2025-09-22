import React, { createContext, useContext, useState, useEffect } from 'react';
import { permissionsManager } from '../utils/permissionsManager.js';
import { useAuth } from './AuthContext.jsx';

const PermissionsContext = createContext();

export function PermissionsProvider({ children }) {
  const { user, permissions: authPermissions } = useAuth();
  const [permissions, setPermissions] = useState(authPermissions || {});

  useEffect(() => {
    if (authPermissions) {
      setPermissions(authPermissions);
    }
  }, [authPermissions]);

 const can = (permissionKey) => {
  if (!user) return false;

  const role = user?.role;

  // Optional: Keep super-admin bypass
  if (role === "admin") return true;

  // ✅ From here only check dynamic flags
  if (!permissions) return false;

  if (["view", "update", "delete"].includes(permissionKey)) {
    return !!permissions[permissionKey];
  }

  if (permissions?.access_to?.includes(permissionKey)) {
    return true;
  }

  return false;
};


  return (
    <PermissionsContext.Provider value={{ permissions, can }}>
      {children}
    </PermissionsContext.Provider>
  );
}


export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}