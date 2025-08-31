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
    "action:payment.refund": ["admin"]
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