// const defaultPermissions = {
//   permissions: {
//     "page:overview": ["admin", "user", "client", "reviewer"],
//     "page:customers": ["admin", "user"],
//     "page:users_management": ["admin"],
//     "page:tax_returns": ["admin", "user", "reviewer"],
//     "page:invoices": ["admin", "user"],
//     "page:payments": ["admin", "user"],
//     "page:settings": ["admin"],
//     "component:invoice.create": ["admin", "user"],
//     "component:invoice.export": ["admin", "user"],
//     "action:return.update_status": ["admin", "reviewer"],
//     "action:return.edit": ["admin", "user"],
//     "action:document.download": ["admin"],
//     "action:comment.add": ["admin", "user", "reviewer"],
//     "action:customer.edit": ["admin", "user"],
//     "action:customer.create": ["admin", "user"],
//     "action:customer.delete": ["admin"],
//     "action:user.create": ["admin"],
//     "action:user.edit": ["admin"],
//     "action:user.delete": ["admin"],
//     "action:payment.refund": ["admin"],
//      "view:all_returns": ["admin", "reviewer"],
//     "view:assigned_returns": ["user"],
//     "view:own_returns": ["client"],
//     "edit:return": ["admin", "user"],
//     "update_status:return": ["admin", "reviewer"],
//     "create:return": ["admin", "user"],
//     "view:status:initial_request": ["admin", "user", "reviewer", "client"],
//     "view:status:document_verified": ["admin", "user", "reviewer"],
//     "view:status:in_preparation": ["admin", "user", "reviewer"],
//     "view:status:in_review": ["admin", "reviewer"],
//     "view:status:ready_to_file": ["admin", "reviewer"],
//     "view:status:filed_return": ["admin", "user", "reviewer", "client"],
//     "update:status:initial_request": ["admin", "user"],
//     "update:status:document_verified": ["admin", "reviewer"],
//     "update:status:in_preparation": ["admin", "user"],
//     "update:status:in_review": ["admin", "reviewer"],
//     "update:status:ready_to_file": ["admin", "reviewer"],
//     "update:status:filed_return": ["admin"]

//   },
//   roleOverrides: {
//     "client": {
//       "page:customers": ["own"]
//     }
//   }
// };

// class PermissionsManager {
//   constructor() {
//     this.listeners = new Set();
//     this.permissions = this.loadPermissions();
//   }

//   loadPermissions() {
//     const stored = localStorage.getItem('permissions');
//     return stored ? JSON.parse(stored) : defaultPermissions;
//   }

//   savePermissions() {
//     localStorage.setItem('permissions', JSON.stringify(this.permissions));
//     this.notifyListeners();
//   }

//   can(role, permissionKey, context = {}) {
//     if (!role || !permissionKey) return false;

//     const allowedRoles = this.permissions.permissions[permissionKey] || [];
    
//     // Check if role has general access
//     if (allowedRoles.includes(role)) {
//       return true;
//     }

//     // Check role overrides
//     const overrides = this.permissions.roleOverrides[role];
//     if (overrides && overrides[permissionKey]) {
//       const overrideRules = overrides[permissionKey];
      
//       if (overrideRules.includes('own') && context.userId && context.ownerId) {
//         return context.userId === context.ownerId;
//       }
//     }

//     return false;
//   }

//   setRolePermissions(role, permissionKeys) {
//     // Update permissions for a specific role
//     Object.keys(this.permissions.permissions).forEach(key => {
//       const currentRoles = this.permissions.permissions[key];
//       this.permissions.permissions[key] = currentRoles.filter(r => r !== role);
      
//       if (permissionKeys.includes(key)) {
//         this.permissions.permissions[key].push(role);
//       }
//     });
    
//     this.savePermissions();
//   }

//   updatePermission(permissionKey, allowedRoles) {
//     this.permissions.permissions[permissionKey] = allowedRoles;
//     this.savePermissions();
//   }

//   getAllPermissions() {
//     return this.permissions.permissions;
//   }

//   getRolePermissions(role) {
//     const rolePermissions = [];
//     Object.entries(this.permissions.permissions).forEach(([key, roles]) => {
//       if (roles.includes(role)) {
//         rolePermissions.push(key);
//       }
//     });
//     return rolePermissions;
//   }

//   subscribe(callback) {
//     this.listeners.add(callback);
//     return () => this.listeners.delete(callback);
//   }

//   notifyListeners() {
//     this.listeners.forEach(callback => callback());
//   }

//   resetToDefaults() {
//     this.permissions = JSON.parse(JSON.stringify(defaultPermissions));
//     this.savePermissions();
//   }
// }

// export const permissionsManager = new PermissionsManager();


// PermissionsManager.js
const defaultPermissions = {
  permissions: {
    "page:overview": ["admin", "user", "client", "reviewer"],
    "page:customers": ["admin", "user"],
    "page:users_management": ["admin"],
    "page:tax_returns": ["admin", "user", "reviewer"],
    "page:invoices": ["admin", "user"],
    "page:payments": ["admin", "user"],
    "page:settings": ["admin"],
    "component:invoice.create": ["admin", "user"],
    "component:invoice.export": ["admin", "user"],
    "action:return.update_status": ["admin", "reviewer"],
    "action:return.edit": ["admin", "user"],
    "action:document.download": ["admin"],
    "action:comment.add": ["admin", "user", "reviewer"],
    "action:customer.edit": ["admin", "user"],
    "action:customer.create": ["admin", "user"],
    "action:customer.delete": ["admin"],
    "action:user.create": ["admin"],
    "action:user.edit": ["admin"],
    "action:user.delete": ["admin"],
    "action:payment.refund": ["admin"],
    "view:all_returns": ["admin", "reviewer"],
    // "view:assigned_returns": ["user"],
    // "view:own_returns": ["client"],
    "edit:return": ["admin", "user"],
    "update_status:return": ["admin", "reviewer"],
    "create:return": ["admin", "user"],
    // "view:status:initial_request": ["admin", "user", "reviewer", "client"],
    // "view:status:document_verified": ["admin", "user", "reviewer"],
    // "view:status:in_preparation": ["admin", "user", "reviewer"],
    // "view:status:in_review": ["admin", "reviewer"],
    // "view:status:ready_to_file": ["admin", "reviewer"],
    // "view:status:filed_return": ["admin", "user", "reviewer", "client"],
    // "update:status:initial_request": ["admin", "user"],
    // "update:status:document_verified": ["admin", "reviewer"],
    // "update:status:in_preparation": ["admin", "user"],
    // "update:status:in_review": ["admin", "reviewer"],
    // "update:status:ready_to_file": ["admin", "reviewer"],
    // "update:status:filed_return": ["admin"]
  },
  roleOverrides: {
    "client": {
      "page:customers": ["own"]
    }
  }
};

class PermissionsManager {
  constructor() {
    this.listeners = new Set();
    this.permissions = this.loadPermissions();
  }

  loadPermissions() {
    const stored = localStorage.getItem('permissions');
    return stored ? JSON.parse(stored) : defaultPermissions;
  }

  savePermissions() {
    localStorage.setItem('permissions', JSON.stringify(this.permissions));
    this.notifyListeners();
  }

  can(role, permissionKey, context = {}) {
    if (!role || !permissionKey) return false;

    const allowedRoles = this.permissions.permissions[permissionKey] || [];
    
    // Check if role has general access
    if (allowedRoles.includes(role)) {
      return true;
    }

    // Check role overrides
    const overrides = this.permissions.roleOverrides[role];
    if (overrides && overrides[permissionKey]) {
      const overrideRules = overrides[permissionKey];
      
      if (overrideRules.includes('own') && context.userId && context.ownerId) {
        return context.userId === context.ownerId;
      }
    }

    return false;
  }

  setRolePermissions(role, permissionKeys) {
    // Update permissions for a specific role
    Object.keys(this.permissions.permissions).forEach(key => {
      const currentRoles = this.permissions.permissions[key];
      this.permissions.permissions[key] = currentRoles.filter(r => r !== role);
      
      if (permissionKeys.includes(key)) {
        this.permissions.permissions[key].push(role);
      }
    });
    
    this.savePermissions();
  }

  updatePermission(permissionKey, allowedRoles) {
    this.permissions.permissions[permissionKey] = allowedRoles;
    this.savePermissions();
  }

  getAllPermissions() {
    return this.permissions.permissions;
  }

  getRolePermissions(role) {
    const rolePermissions = [];
    Object.entries(this.permissions.permissions).forEach(([key, roles]) => {
      if (roles.includes(role)) {
        rolePermissions.push(key);
      }
    });
    return rolePermissions;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  resetToDefaults() {
    this.permissions = JSON.parse(JSON.stringify(defaultPermissions));
    this.savePermissions();
  }
}

export const permissionsManager = new PermissionsManager();