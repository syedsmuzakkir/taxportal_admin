import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { Plus, Edit, Trash2, Shield, CheckCircle, X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils.js';
import Modal from '../components/Modal.jsx';

const allRoles = ['admin', 'user', 'client', 'reviewer'];

export default function UsersManagement() {
  const { user } = useAuth();
  const { users, updateUsers, addActivity } = useData();
  const { permissions, getRolePermissions, setRolePermissions } = usePermissions();
  const { addNotification } = useNotifications();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  const [tempPermissions, setTempPermissions] = useState({});
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    const userToCreate = {
      ...newUser,
      id: Date.now().toString(),
      password: 'Password123', // Default password
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, userToCreate];
    updateUsers(updatedUsers);

    // Add activity
    addActivity({
      user: user.name,
      action: `Created new user account for ${userToCreate.name}`,
      entityType: 'user',
      entityId: userToCreate.id
    });

    await addNotification({
      title: 'New User Created',
      body: `${userToCreate.name} account has been created`,
      level: 'success',
      relatedEntity: { type: 'user', id: userToCreate.id }
    });

    setNewUser({ name: '', email: '', role: 'user' });
    setShowCreateUser(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      const updatedUsers = users.filter(u => u.id !== userId);
      updateUsers(updatedUsers);

      // Add activity
      addActivity({
        user: user.name,
        action: `Deleted user account for ${userName}`,
        entityType: 'user',
        entityId: userId
      });

      await addNotification({
        title: 'User Deleted',
        body: `${userName} account has been removed`,
        level: 'warning',
        relatedEntity: { type: 'user', id: userId }
      });
    }
  };

  const handleToggleActive = async (userId, userName, currentStatus) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    updateUsers(updatedUsers);

    // Add activity
    addActivity({
      user: user.name,
      action: `${currentStatus ? 'Deactivated' : 'Activated'} user ${userName}`,
      entityType: 'user',
      entityId: userId
    });

    await addNotification({
      title: 'User Status Updated',
      body: `${userName} has been ${currentStatus ? 'deactivated' : 'activated'}`,
      level: 'info',
      relatedEntity: { type: 'user', id: userId }
    });
  };

  const openPermissionsEditor = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditingRole(userToEdit.role);
    
    // Load current permissions for this role
    const currentPermissions = {};
    Object.keys(permissions).forEach(key => {
      currentPermissions[key] = permissions[key].includes(userToEdit.role);
    });
    setTempPermissions(currentPermissions);
    setShowEditPermissions(true);
  };

  const handlePermissionToggle = (permissionKey, checked) => {
    setTempPermissions({
      ...tempPermissions,
      [permissionKey]: checked
    });
  };

  const handleSavePermissions = async () => {
    // Get all permission keys that should be enabled for this role
    const enabledPermissions = Object.keys(tempPermissions).filter(key => tempPermissions[key]);
    
    // Update the permissions
    setRolePermissions(editingRole, enabledPermissions);

    // Add activity
    addActivity({
      user: user.name,
      action: `Updated permissions for ${editingRole} role`,
      entityType: 'user',
      entityId: selectedUser.id
    });

    await addNotification({
      title: 'Permissions Updated',
      body: `Permissions updated for ${editingRole} role`,
      level: 'info',
      relatedEntity: { type: 'user', id: selectedUser.id }
    });

    setShowEditPermissions(false);
    setSelectedUser(null);
  };

  const groupedPermissions = Object.keys(permissions).reduce((acc, key) => {
    const category = key.split(':')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(key);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users & Roles Management</h1>
        <button
          onClick={() => setShowCreateUser(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                      <div className="text-sm text-gray-500">{userItem.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                      {userItem.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(userItem.id, userItem.name, userItem.isActive)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                        userItem.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {userItem.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userItem.lastLogin ? formatDate(userItem.lastLogin) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openPermissionsEditor(userItem)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit Permissions"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      {/* <button 
                        className="text-gray-600 hover:text-gray-700 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {allRoles.map(role => (
                <option key={role} value={role} className="capitalize">{role}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={() => setShowCreateUser(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Permissions Modal */}
      <Modal
        isOpen={showEditPermissions}
        onClose={() => setShowEditPermissions(false)}
        title={`Edit Permissions for ${editingRole} Role`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <label className="text-sm font-medium text-gray-700">Role:</label>
            <select
              value={editingRole}
              onChange={(e) => {
                setEditingRole(e.target.value);
                // Load permissions for the new role
                const currentPermissions = {};
                Object.keys(permissions).forEach(key => {
                  currentPermissions[key] = permissions[key].includes(e.target.value);
                });
                setTempPermissions(currentPermissions);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {allRoles.map(role => (
                <option key={role} value={role} className="capitalize">{role}</option>
              ))}
            </select>
          </div>

          {Object.entries(groupedPermissions).map(([category, keys]) => (
            <div key={category} className="border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                {category} Permissions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {keys.map((key) => {
                  const hasPermission = tempPermissions[key] || false;
                  
                  return (
                    <label key={key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        onChange={(e) => handlePermissionToggle(key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{key}</span>
                      {hasPermission && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSavePermissions}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setShowEditPermissions(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}