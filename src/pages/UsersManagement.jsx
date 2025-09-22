
import React, { useEffect, useState } from "react";
import { Plus, Shield, CheckCircle } from "lucide-react";

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
  const [newRole, setNewRole] = useState({ role_name: "", description: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", phone: "", role: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditPermissions, setShowEditPermissions] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [tempPermissions, setTempPermissions] = useState({});
  const [showAddRoleInputs, setShowAddRoleInputs] = useState(false);

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

      CreatePermission(data)
    } catch (err) {
      console.error("Error fetching roles", err);
    }
  };

  const CreatePermission =(data)=>{

    console.log('data', data)
        
  }

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

      // Log activity
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

  // =====================================================
  // LIFECYCLE
  // =====================================================
  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const groupedPermissions = Object.keys(permissions).reduce((acc, key) => {
    const category = key.split(":")[0];
    acc[category] = acc[category] || [];
    acc[category].push(key);
    return acc;
  }, {});

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="space-y-6 ml-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users & Roles Management</h1>

         <button
          onClick={() => CreatePermission()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Permissions
        </button>
        <button
          onClick={() => setShowCreateUser(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Updated At</th>
                <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
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
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.last_login).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.modified_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openPermissionsEditor(u)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit Permissions"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    {usersError || "No data found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User + Role Modal */}
      <Modal isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} title="Create New User">
        {/* Create User Form */}
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
                    setShowAddRoleInputs(false); // ✅ hide inputs when selecting an existing role

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

      {/* Edit Permissions Modal */}
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
