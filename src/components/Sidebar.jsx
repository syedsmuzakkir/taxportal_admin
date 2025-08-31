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

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { Bell, LogOut, Menu, User } from 'lucide-react';
import NotificationCenter from './NotificationCenter.jsx';

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


const navigate = useNavigate();
const { unreadCount } = useNotifications();
const [showNotifications, setShowNotifications] = useState(false);
const [showUserMenu, setShowUserMenu] = useState(false);
const notificationRef = useRef(null);
const userMenuRef = useRef(null);



// Close dropdowns when clicking outside
useEffect(() => {
  function handleClickOutside(event) {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const handleStatusClick = (status) => {
  const params = new URLSearchParams();
  if (status !== 'All') {
    params.set('status', status);
  }
  navigate(`/tax-returns?${params.toString()}`);
};

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
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-10 flex flex-col ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 flex items-center justify-between">
  <div className="flex items-center space-x-3">
    {!collapsed && (
      <div className="flex items-center space-x-3">
        <div className="w-6 h-8 bg-blue-600 rounded flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">TaxPortal</h1>
          {/* <p className="text-xs text-gray-500">Demo</p> */}
        </div>
      </div>
    )}
  </div>
  <button
    onClick={onToggle}
    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
  >
    <Menu className="w-5 h-5 text-gray-600" />
  </button>
</div>

      <nav className="mt-6 flex-1">
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
      <div 
        key={index} 
        className="px-8 py-2 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => handleStatusClick(subItem)}
      >
        {subItem}
      </div>
    ))}
  </div>
)}
            </div>
          );
        })}
      </nav>

           {/* User info at the bottom */}
      {/* {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm bg-gray-50 p-3 rounded">
            <div className="font-medium text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
        </div>
      )} */}

      {/* Bottom section with notifications and user menu */}
      <div className="border-t border-gray-200 p-4">
        {/* Notifications */}
        <div className="relative mb-3" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center w-full p-2 rounded-md hover:bg-gray-100 transition-colors ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-gray-600" />
              {!collapsed && <span className="ml-3 text-sm">Notifications</span>}
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
  <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
    <NotificationCenter onClose={() => setShowNotifications(false)} />
  </div>
)}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full p-2 rounded-md hover:bg-gray-100 transition-colors ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {collapsed ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">My Account</div>
                    <div className="text-xs text-gray-500">Manage settings</div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {showUserMenu && (
            <div className={`absolute bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 ${
              collapsed ? 'left-16 bottom-0 w-48' : 'left-0 bottom-full mb-2 w-full'
            }`}>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
}

