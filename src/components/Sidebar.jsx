import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { 
  Home, 
  Users, 
  UserCheck, 
  FileText, 
  Receipt, 
  CreditCard, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const taxReturnStatuses = [
  'Initial Request',
  'Document Verified',
  'In Preparation',
  'In Review', 
  'Ready to File',
  'Filed Return'
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const { can } = usePermissions();
  const [taxReturnsExpanded, setTaxReturnsExpanded] = useState(false);

  const navigationItems = [
    {
      name: 'Overview',
      path: '/overview',
      icon: Home,
      permission: 'page:overview'
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: Users,
      permission: 'page:customers'
    },
    {
      name: 'Users & Roles',
      path: '/users-management',
      icon: UserCheck,
      permission: 'page:users_management'
    },
    {
      name: 'Tax Returns',
      path: '/tax-returns',
      icon: FileText,
      permission: 'page:tax_returns',
      expandable: true,
      expanded: taxReturnsExpanded,
      onToggle: () => setTaxReturnsExpanded(!taxReturnsExpanded),
      subItems: taxReturnStatuses
    },
    {
      name: 'Invoices',
      path: '/invoices',
      icon: Receipt,
      permission: 'page:invoices'
    },
    {
      name: 'Payments',
      path: '/payments',
      icon: CreditCard,
      permission: 'page:payments'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      permission: 'page:settings'
    }
  ];

  const visibleItems = navigationItems.filter(item => can(item.permission));

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-10 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">TaxPortal</h1>
              <p className="text-xs text-gray-500">Demo</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-6">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <div key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={item.onToggle}
              >
                <Icon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                {!collapsed && (
                  <span className="flex-1">{item.name}</span>
                )}
                {!collapsed && item.expandable && (
                  <div 
                    className="ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      item.onToggle();
                    }}
                  >
                    {item.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </Link>
              
              {!collapsed && item.expandable && item.expanded && (
                <div className="bg-gray-50 border-l-2 border-gray-200 ml-4">
                  {item.subItems.map((subItem, index) => (
                    <div key={index} className="px-8 py-2 text-xs text-gray-600">
                      {subItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <div className="font-medium">{user?.name}</div>
            <div className="capitalize">{user?.role}</div>
          </div>
        </div>
      )}
    </div>
  );
}