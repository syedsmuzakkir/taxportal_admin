import React, { useEffect, useState } from "react";
import { Plus, Shield, CheckCircle, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react";

import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePermissions } from "../contexts/PermissionsContext.jsx";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import Modal from "../components/Modal.jsx";
import { BASE_URL } from "../api/BaseUrl.js";

// -------------------------------
// Component: UsersManagement
// -------------------------------
export default function UsersManagement() {
  // ---------- Context ----------
  const { user } = useAuth();
  const { users, updateUsers, addActivity } = useData();
  const [usersError, setUsersError] = useState(null);

  const { permissions, getRolePermissions, setRolePermissions } = usePermissions();
  const { addNotification } = useNotifications();

  // ---------- State ----------
  const [allRoles, setAllRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [newRole, setNewRole] = useState({ role_name: "", description: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", phone: "", role: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  const [showAddPermissions, setShowAddPermissions] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [tempPermissions, setTempPermissions] = useState({});
  const [showAddRoleInputs, setShowAddRoleInputs] = useState(false);

  // Permissions Modal State
  const [permissionForm, setPermissionForm] = useState({
    role: "",
    role_id: "",
    view: true,
    update: false,
    delete: false,
    access_to: [],
    can_delete: false
  });

  // Available permission modules (will be dynamically extracted from API)
  const [availableModules, setAvailableModules] = useState([]);

  // ---------- Auth Storage ----------
  const userToken = localStorage.getItem("token");
  const loginId = localStorage.getItem("loginId");
  const role = localStorage.getItem("role");

  // =====================================================
  // API CALLS
  // =====================================================
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/allUsers`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      updateUsers(data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/allRoles`);
      const data = await res.json();
      setAllRoles(data || []);
    } catch (err) {
      console.error("Error fetching roles", err);
    }
  };

  // Extract unique modules from all permissions
  const extractAvailableModules = (permissionsData) => {
    const modules = new Set();
    permissionsData.forEach(permission => {
      if (permission.access_to && Array.isArray(permission.access_to)) {
        permission.access_to.forEach(module => modules.add(module));
      }
    });
    return Array.from(modules);
  };

  const getAllPermissions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/allPermissions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      const permissionsData = await response.json();
      setAllPermissions(permissionsData || []);
      
      // Extract available modules dynamically from API data
      const modules = extractAvailableModules(permissionsData);
      setAvailableModules(modules);
    } catch (err) {
      console.error("Error fetching permissions", err);
    }
  };

const createPermission = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Find the role_id for the selected role
    const selectedRole = allRoles.find(r => r.role_name === permissionForm.role);
    if (!selectedRole) {
      throw new Error("Selected role not found");
    }

    // Check if we're updating an existing permission or creating a new one
    const existingPermission = allPermissions.find(p => p.role === permissionForm.role);
    console.log('Existing permission:', existingPermission);

    let payload;
    let url;
    let method;

    if (existingPermission) {
      // UPDATE payload - according to your API spec
      payload = {
        view: permissionForm.view,
        update: permissionForm.update,
        delete: permissionForm.delete,
        access_to: permissionForm.access_to,
        can_delete: permissionForm.can_delete
        // Note: For update, we don't send role, role_id, createdby_id, createdby_type
        // as they should remain the same
      };
      url = `${BASE_URL}/api/updatePermissions/${existingPermission.id}`;
      method = "PUT";
    } else {
      // CREATE payload - according to your API spec
      payload = {
        role: permissionForm.role,
        role_id: selectedRole.id,
        view: permissionForm.view,
        update: permissionForm.update,
        delete: permissionForm.delete,
        access_to: permissionForm.access_to,
        createdby_id: parseInt(loginId),
        createdby_type: role,
        can_delete: permissionForm.can_delete
      };
      url = `${BASE_URL}/api/addPermission`;
      method = "POST";
    }

    console.log('Sending payload:', payload);
    console.log('URL:', url);
    console.log('Method:', method);

    const res = await fetch(url, {
      method: method,
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${userToken}` 
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Failed to ${existingPermission ? 'update' : 'create'} permission`);
    }

    const data = await res.json();
    console.log('Response data:', data);
    
    // Refresh permissions list
    await getAllPermissions();

    // Log activity
    addActivity({
      user: user.name,
      action: `${existingPermission ? 'Updated' : 'Created'} permissions for role: ${permissionForm.role}`,
      entityType: "permission",
    });

    await addNotification({
      title: `Permissions ${existingPermission ? 'Updated' : 'Created'}`,
      body: `Permissions for ${permissionForm.role} ${existingPermission ? 'updated' : 'created'} successfully.`,
      level: "success",
    });

    // Reset form
    setPermissionForm({
      role: "",
      role_id: "",
      view: true,
      update: false,
      delete: false,
      access_to: [],
      can_delete: false
    });
    
    setShowAddPermissions(false);
  } catch (err) {
    console.error("Error creating/updating permission:", err);
    alert(err.message || `Failed to create/update permission. Try again.`);
  } finally {
    setIsLoading(false);
  }
};

const updatePermission = async (permissionId, updatedData) => {
  try {
    // Make sure we include role_id in the updated data
    const permissionToUpdate = allPermissions.find(p => p.id === permissionId);
    if (!permissionToUpdate) {
      throw new Error("Permission not found");
    }

    // UPDATE payload - according to your API spec
    const payload = {
      view: updatedData.view,
      update: updatedData.update,
      delete: updatedData.delete,
      access_to: updatedData.access_to,
      can_delete: updatedData.can_delete
      // Note: For update, we don't send role, role_id, createdby_id, createdby_type
    };

    console.log("Updating permission with payload:", payload);

    const res = await fetch(`${BASE_URL}/api/updatePermissions/${permissionId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${userToken}` 
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update permission");
    }
    
    await getAllPermissions();
    
    addNotification({
      title: "Permission Updated",
      body: `Permission updated successfully.`,
      level: "success",
    });
  } catch (err) {
    console.error("Error updating permission:", err);
    alert(err.message || "Failed to update permission. Try again.");
  }
};

  const deletePermission = async (permissionId) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/deletePermission/${permissionId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${userToken}` 
        },
      });

      if (!res.ok) throw new Error("Failed to delete permission");
      
      await getAllPermissions();
      
      addNotification({
        title: "Permission Deleted",
        body: `Permission deleted successfully.`,
        level: "info",
      });
    } catch (err) {
      console.error("Error deleting permission:", err);
      alert("Failed to delete permission. Try again.");
    }
  };

  const createRole = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/addRole`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ ...newRole, createdby_id: loginId }),
      });
      if (!res.ok) throw new Error("Failed to create role");
      const created = await res.json();

      setAllRoles((prev) => [...prev, created]);
      setNewRole({ role_name: "", description: "" });
      setShowAddRoleInputs(false);
      
      // Refresh permissions to include new role
      await getAllPermissions();
    } catch (err) {
      console.error("Error creating role", err);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { ...newUser, createdby_id: loginId, createdby_type: role };

      const res = await fetch(`${BASE_URL}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create user");

      const data = await res.json();
      updateUsers([...users, data.user || payload]);

      addActivity({
        user: user.name,
        action: `Created new user: ${payload.name}`,
        entityType: "user",
        entityId: data.user?.id,
      });

      await addNotification({
        title: "New User Created",
        body: `${payload.name} account created successfully.`,
        level: "success",
        relatedEntity: { type: "user", id: data.user?.id },
      });

      setNewUser({ name: "", email: "", password: "", phone: "", role: "" });
      setShowCreateUser(false);
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/changeUserStatus/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ isactive: !currentStatus }),
      });

      await res.json();
      fetchUsers();
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };

  // =====================================================
  // PERMISSIONS HANDLING
  // =====================================================
  const openPermissionsEditor = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditingRole(userToEdit.role);

    const current = {};
    Object.keys(permissions).forEach((key) => {
      current[key] = permissions[key].includes(userToEdit.role);
    });
    setTempPermissions(current);
    setShowEditPermissions(true);
  };

  const handlePermissionToggle = (key, checked) => {
    setTempPermissions({ ...tempPermissions, [key]: checked });
  };

  const savePermissions = async () => {
    const enabled = Object.keys(tempPermissions).filter((key) => tempPermissions[key]);
    setRolePermissions(editingRole, enabled);

    addActivity({
      user: user.name,
      action: `Updated permissions for role: ${editingRole}`,
      entityType: "user",
      entityId: selectedUser.id,
    });

    await addNotification({
      title: "Permissions Updated",
      body: `Permissions updated for role: ${editingRole}`,
      level: "info",
      relatedEntity: { type: "user", id: selectedUser.id },
    });

    setShowEditPermissions(false);
    setSelectedUser(null);
  };

  const openAddPermissionsModal = () => {
    setShowAddPermissions(true);
  };

  const handleRoleChange = (roleName) => {
    const selectedRole = allRoles.find(role => role.role_name === roleName);
    if (selectedRole) {
      setPermissionForm(prev => ({
        ...prev,
        role: roleName,
        role_id: selectedRole.id
      }));

      // Check if permissions already exist for this role
      const existingPermission = allPermissions.find(p => p.role === roleName);
      if (existingPermission) {
        // Pre-fill form with existing permissions for editing
        setPermissionForm({
          role: existingPermission.role,
          role_id: existingPermission.role_id,
          view: existingPermission.view,
          update: existingPermission.update,
          delete: existingPermission.delete,
          access_to: existingPermission.access_to || [],
          can_delete: existingPermission.can_delete || false
        });
      }
    }
  };

  const handleModuleToggle = (module) => {
    setPermissionForm(prev => ({
      ...prev,
      access_to: prev.access_to.includes(module)
        ? prev.access_to.filter(m => m !== module)
        : [...prev.access_to, module]
    }));
  };

  const openEditPermissionModal = (permission) => {
    setPermissionForm({
      role: permission.role,
      role_id: permission.role_id,
      view: permission.view,
      update: permission.update,
      delete: permission.delete,
      access_to: permission.access_to || [],
      can_delete: permission.can_delete || false
    });
    setShowAddPermissions(true);
  };

  // Get roles that don't have permissions assigned yet
  const getRolesWithoutPermissions = () => {
    const rolesWithPermissions = allPermissions.map(p => p.role);
    return allRoles.filter(role => !rolesWithPermissions.includes(role.role_name));
  };

  // =====================================================
  // LIFECYCLE
  // =====================================================
  useEffect(() => {
    fetchRoles();
    fetchUsers();
    getAllPermissions();
  }, []);

  const groupedPermissions = Object.keys(permissions).reduce((acc, key) => {
    const category = key.split(":")[0];
    acc[category] = acc[category] || [];
    acc[category].push(key);
    return acc;
  }, {});

  // =====================================================
  // UI COMPONENTS
  // =====================================================

  // Permission Status Badge Component
  const PermissionStatus = ({ value }) => (
    <span className={`px-2 py-1 text-xs rounded-full ${
      value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {value ? 'Yes' : 'No'}
    </span>
  );

  // Module Tags Component
  const ModuleTags = ({ modules }) => (
    <div className="flex flex-wrap gap-1">
      {modules.map((module) => (
        <span key={module} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded capitalize">
          {module.replace(/-/g, ' ')}
        </span>
      ))}
    </div>
  );

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="space-y-6 ml-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users & Roles Management</h1>

        <div className="flex space-x-3">
          <button
            onClick={openAddPermissionsModal}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" /> Manage Permissions
          </button>
          <button
            onClick={() => setShowCreateUser(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Create User
          </button>
        </div>
      </div>

      {/* Existing Permissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
          <p className="text-sm text-gray-600">Dynamically loaded from API</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Modules</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allPermissions.length > 0 ? (
                allPermissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {perm.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PermissionStatus value={perm.view} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PermissionStatus value={perm.update} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PermissionStatus value={perm.delete} />
                    </td>
                    <td className="px-6 py-4">
                      <ModuleTags modules={perm.access_to || []} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditPermissionModal(perm)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {perm.can_delete && (
                          <button
                            onClick={() => deletePermission(perm.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Permissions"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No permissions configured yet</p>
                      <button
                        onClick={openAddPermissionsModal}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Add your first permission
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.isactive ? "active" : "inactive"}
                        onChange={() => changeStatus(u.id, u.isactive)}
                        className={`px-2 py-1 text-xs rounded-md border ${
                          u.isactive
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.modified_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    {usersError || "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Permissions Modal */}
      <Modal 
        isOpen={showAddPermissions} 
        onClose={() => {
          setShowAddPermissions(false);
          setPermissionForm({
            role: "",
            role_id: "",
            view: true,
            update: false,
            delete: false,
            access_to: [],
            can_delete: false
          });
        }} 
        title="Manage Role Permissions" 
        size="lg"
      >
        <form onSubmit={createPermission} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role {getRolesWithoutPermissions().length > 0 && 
                <span className="text-green-600 text-xs ml-2">
                  ({getRolesWithoutPermissions().length} roles without permissions)
                </span>
              }
            </label>
            <select
              required
              value={permissionForm.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              {allRoles.map((role) => (
                <option key={role.id} value={role.role_name} className="capitalize">
                  {role.role_name}
                  {allPermissions.find(p => p.role === role.role_name) && '(configured)'}
                </option>
              ))}
            </select>
          </div>

          {/* Basic Permissions */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={permissionForm.view}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, view: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">View Access</span>
                  <div className="text-xs text-gray-500">Can view data</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={permissionForm.update}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, update: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Update Access</span>
                  <div className="text-xs text-gray-500">Can modify data</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={permissionForm.delete}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, delete: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Delete Access</span>
                  <div className="text-xs text-gray-500">Can delete data</div>
                </div>
              </label>
            </div>
          </div>

          {/* Module Access */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Module Access ({permissionForm.access_to.length} selected)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {availableModules.map((module) => (
                <label key={module} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={permissionForm.access_to.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize flex-1">
                    {module.replace(/-/g, ' ')}
                  </span>
                  {permissionForm.access_to.includes(module) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </label>
              ))}
            </div>
            {availableModules.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No modules available. Permissions will be created with empty module access.
              </p>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={permissionForm.can_delete}
                onChange={(e) => setPermissionForm(prev => ({ ...prev, can_delete: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Allow Permission Deletion</span>
                <div className="text-xs text-gray-500">Users with this permission can delete it later</div>
              </div>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            {/* <button 
              type="submit" 
              disabled={isLoading || !permissionForm.role}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {allPermissions.find(p => p.role === permissionForm.role) ? 'Update' : 'Create'} Permissions
                </>
              )}
            </button> */}
            {/* // In the modal form, update the submit button text dynamically: */}
<button 
  type="submit" 
  disabled={isLoading || !permissionForm.role}
  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
>
  {isLoading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Saving...
    </>
  ) : (
    <>
      <Save className="w-4 h-4 mr-2" />
      {allPermissions.find(p => p.role === permissionForm.role && p.role_id === permissionForm.role_id) 
        ? 'Update Permissions' 
        : 'Create Permissions'
      }
    </>
  )}
</button>
            <button 
              type="button" 
              onClick={() => {
                setShowAddPermissions(false);
                setPermissionForm({
                  role: "",
                  role_id: "",
                  view: true,
                  update: false,
                  delete: false,
                  access_to: [],
                  can_delete: false
                });
              }}
              className="flex-1 bg-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Existing Create User Modal */}
      <Modal isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} title="Create New User">
        <form onSubmit={createUser} className="space-y-4">
          {["name", "email", "password", "phone"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
              <input
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                required
                value={newUser[field]}
                onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              required
              value={newUser.role}
              onChange={(e) => {
                if (e.target.value === "__add_new_role__") {
                  setShowAddRoleInputs(true);
                  setNewUser({ ...newUser, role: "" });
                } else {
                  setNewUser({ ...newUser, role: e.target.value });
                  setShowAddRoleInputs(false);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              <option value="__add_new_role__">➕ Add New Role</option>
              {allRoles.map((r) => (
                <option key={r.id} value={r.role_name} className="capitalize">
                  {r.role_name}
                </option>
              ))}
            </select>
          </div>

          {showAddRoleInputs && (
            <div className="border rounded-md p-4 mt-3 space-y-3 bg-gray-50">
              <h3 className="text-sm font-medium">Add New Role</h3>
              <input
                type="text"
                placeholder="Role Name"
                value={newRole.role_name}
                onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={createRole}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md"
                >
                  Save Role
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRoleInputs(false)}
                  className="flex-1 bg-gray-300 py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md">
              {isLoading ? "Creating..." : "Create User"}
            </button>
            <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 bg-gray-300 py-2 px-4 rounded-md">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Existing Edit Permissions Modal */}
      <Modal isOpen={showEditPermissions} onClose={() => setShowEditPermissions(false)} title={`Edit Permissions: ${editingRole}`} size="lg">
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, keys]) => (
            <div key={category} className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3 capitalize">{category} Permissions</h3>
              {keys.map((key) => (
                <label key={key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={tempPermissions[key] || false}
                    onChange={(e) => handlePermissionToggle(key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 flex-1">{key}</span>
                  {tempPermissions[key] && <CheckCircle className="w-4 h-4 text-green-500" />}
                </label>
              ))}
            </div>
          ))}

          <div className="flex space-x-3 pt-4">
            <button onClick={savePermissions} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md">
              Save Changes
            </button>
            <button onClick={() => setShowEditPermissions(false)} className="flex-1 bg-gray-300 py-2 px-4 rounded-md">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}