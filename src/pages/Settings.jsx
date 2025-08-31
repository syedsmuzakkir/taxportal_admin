import React, { useState } from 'react';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { resetData } from '../seedData.js';
import { Settings as SettingsIcon, Shield, RefreshCw, Bell, Key } from 'lucide-react';

const allRoles = ['admin', 'user', 'client', 'reviewer'];

export default function Settings() {
  const { permissions, resetToDefaults } = usePermissions();
  const { addNotification } = useNotifications();
  const [require2FA, setRequire2FA] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  const handleResetPermissions = () => {
    if (window.confirm('Are you sure you want to reset all permissions to defaults?')) {
      resetToDefaults();
      addNotification({
        title: 'Permissions Reset',
        body: 'All permissions have been reset to default values',
        level: 'warning',
        relatedEntity: { type: 'settings', id: 'permissions' }
      });
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all demo data? This cannot be undone.')) {
      resetData();
      window.location.reload();
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Require 2FA</label>
                <p className="text-sm text-gray-500">Force two-factor authentication for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={require2FA}
                  onChange={(e) => setRequire2FA(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Enable Notifications</label>
                <p className="text-sm text-gray-500">Show in-app notifications and toasts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableNotifications}
                  onChange={(e) => setEnableNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Demo Mode</label>
                <p className="text-sm text-gray-500">Auto-generate demo activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <RefreshCw className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleResetPermissions}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center"
              >
                <Shield className="w-4 h-4 mr-2" />
                Reset Permissions to Defaults
              </button>
              <p className="text-sm text-gray-500 mt-1">Restore all role permissions to default settings</p>
            </div>

            <div>
              <button
                onClick={handleResetData}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All Demo Data
              </button>
              <p className="text-sm text-gray-500 mt-1">Reset all customers, invoices, and activities to defaults</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Key className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Permission Overview</h2>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, keys]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                {category} Permissions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                        Permission Key
                      </th>
                      {allRoles.map(role => (
                        <th key={role} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 capitalize">
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr key={key} className="border-t border-gray-100">
                        <td className="py-2 text-sm text-gray-900">{key}</td>
                        {allRoles.map(role => (
                          <td key={role} className="py-2 text-center">
                            {permissions[key]?.includes(role) ? (
                              <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
                            ) : (
                              <span className="inline-block w-4 h-4 bg-gray-300 rounded-full"></span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}