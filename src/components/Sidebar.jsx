// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext.jsx';
// import { usePermissions } from '../contexts/PermissionsContext.jsx';
// import {
//   Home,
//   Users,
//   UserCheck,
//   FileText,
//   Receipt,
//   CreditCard,
//   Settings,
//   ChevronDown,
//   ChevronRight
// } from 'lucide-react';

// import { useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useNotifications } from '../contexts/NotificationsContext.jsx';
// import { Bell, LogOut, Menu, User } from 'lucide-react';
// import NotificationCenter from './NotificationCenter.jsx';
// import Icons from '../images/favicon.svg'

// const taxReturnStatuses = [
//   'initial request',
//   'document verified',
//   'in preparation',
//   'in review',
//   'ready to file',
//   'filed return'
// ];

// export default function Sidebar({ collapsed, onToggle }) {
//   const location = useLocation();
//   const { user, logout } = useAuth();
//   const { can } = usePermissions();
//   const [taxReturnsExpanded, setTaxReturnsExpanded] = useState(false);

// const navigate = useNavigate();
// const { unreadCount } = useNotifications();
// const [showNotifications, setShowNotifications] = useState(false);
// const [showUserMenu, setShowUserMenu] = useState(false);
// const notificationRef = useRef(null);
// const userMenuRef = useRef(null);

// // Close dropdowns when clicking outside
// useEffect(() => {
//   function handleClickOutside(event) {
//     if (notificationRef.current && !notificationRef.current.contains(event.target)) {
//       setShowNotifications(false);
//     }
//     if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//       setShowUserMenu(false);
//     }
//   }

//   document.addEventListener("mousedown", handleClickOutside);
//   return () => {
//     document.removeEventListener("mousedown", handleClickOutside);
//   };
// }, []);

// const handleStatusClick = (status) => {
//   const params = new URLSearchParams();
//   if (status !== 'All') {
//     params.set('status', status);
//   }
//   navigate(`/tax-returns?${params.toString()}`);
// };

//   const navigationItems = [
//     {
//       name: 'Overview',
//       path: '/overview',
//       icon: Home,
//       permission: 'page:overview'
//     },
//     {
//       name: 'Customers',
//       path: '/customers',
//       icon: Users,
//       permission: 'page:customers'
//     },
//     {
//       name: 'Users & Roles',
//       path: '/users-management',
//       icon: UserCheck,
//       permission: 'page:users_management'
//     },
//     {
//       name: 'Tax Returns',
//       path: '/tax-returns',
//       icon: FileText,
//       permission: 'page:tax_returns',
//       expandable: true,
//       expanded: taxReturnsExpanded,
//       onToggle: () => setTaxReturnsExpanded(!taxReturnsExpanded),
//       subItems: taxReturnStatuses
//     },
//     {
//       name: 'Invoices',
//       path: '/invoices',
//       icon: Receipt,
//       permission: 'page:invoices'
//     },
//     {
//       name: 'Payments',
//       path: '/payments',
//       icon: CreditCard,
//       permission: 'page:payments'
//     },
//     // {
//     //   name: 'Settings',
//     //   path: '/settings',
//     //   icon: Settings,
//     //   permission: 'page:settings'
//     // }
//   ];

//   const visibleItems = navigationItems.filter(item => can(item.permission));

//   return (
//     <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-10 flex flex-col ${
//       collapsed ? 'w-16' : 'w-64'
//     }`}>
//       <div className="p-4 flex items-center justify-between">
//   <div className="flex items-center space-x-3">
//     {!collapsed && (
//       <div className="flex items-center space-x-3">
//         <div className="w-6 h-8  flex items-center justify-center">
//           {/* <FileText className="w-5 h-5 text-white" /> */}
//              <img src={Icons}
//   className="w-8 h-8"
//   alt="TaxPortal Icon"
//   style={{ objectFit: 'contain' }}
// />
//         </div>
//         <div>
//           <h1 className="text-lg font-bold text-gray-900">Tax Admin</h1>
//           {/* <p className="text-xs text-gray-500">Demo</p> */}
//            {/* <div className="font-medium text-gray-900">{user?.name}</div>
//             <div className="text-xs text-gray-500 capitalize">{user?.role}</div> */}
//         </div>
//       </div>
//     )}
//   </div>
//   <button
//     onClick={onToggle}
//     className="p-1 rounded-md hover:bg-gray-100 transition-colors"
//   >
//     <Menu className="w-5 h-5 text-gray-600" />
//   </button>
// </div>

//       <nav className="mt-6 flex-1">
//         {visibleItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = location.pathname === item.path;

//           return (
//             <div key={item.name}>
//               <Link
//                 to={item.path}
//                 className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
//                   isActive
//                     ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
//                     : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
//                 }`}
//                 onClick={item.onToggle}
//               >
//                 <Icon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
//                 {!collapsed && (
//                   <span className="flex-1">{item.name}</span>
//                 )}
//                 {!collapsed && item.expandable && (
//                   <div
//                     className="ml-auto"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       item.onToggle();
//                     }}
//                   >
//                     {item.expanded ? (
//                       <ChevronDown className="w-4 h-4" />
//                     ) : (
//                       <ChevronRight className="w-4 h-4" />
//                     )}
//                   </div>
//                 )}
//               </Link>

//               {!collapsed && item.expandable && item.expanded && (
//   <div className="bg-gray-50 border-l-2 border-gray-200 ml-4">
//     {item.subItems.map((subItem, index) => (
//       <div
//         key={index}
//         className="px-8 py-2 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
//         onClick={() => handleStatusClick(subItem)}
//       >
//         {subItem}
//       </div>
//     ))}
//   </div>
// )}
//             </div>
//           );
//         })}
//       </nav>

//            {/* User info at the bottom */}
//       {/* {!collapsed && (
//         <div className="p-4 border-t border-gray-200">
//           <div className="text-sm bg-gray-50 p-3 rounded">
//             <div className="font-medium text-gray-900">{user?.name}</div>
//             <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
//           </div>
//         </div>
//       )} */}

//       {/* Bottom section with notifications and user menu */}
//       <div className="border-t border-gray-200 p-4">
//         {/* Notifications */}
//         <div className="relative mb-3" ref={notificationRef}>
//           <button
//             onClick={() => setShowNotifications(!showNotifications)}
//             className={`flex items-center w-full p-2 rounded-md hover:bg-gray-100 transition-colors ${
//               collapsed ? 'justify-center' : 'justify-between'
//             }`}
//           >
//             <div className="flex items-center">
//               <Bell className="w-5 h-5 text-gray-600" />
//               {!collapsed && <span className="ml-3 text-sm">Notifications</span>}
//             </div>
//             {unreadCount > 0 && (
//               <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                 {unreadCount > 9 ? '9+' : unreadCount}
//               </span>
//             )}
//           </button>

//           {showNotifications && (
//   <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
//     <NotificationCenter onClose={() => setShowNotifications(false)} />
//   </div>
// )}
//         </div>

//         {/* User Menu */}
//         <div className="relative" ref={userMenuRef}>
//           <button
//             onClick={() => setShowUserMenu(!showUserMenu)}
//             className={`flex items-center w-full p-2 rounded-md hover:bg-gray-100 transition-colors ${
//               collapsed ? 'justify-center' : 'justify-between'
//             }`}
//           >
//             {collapsed ? (
//               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//                 <User className="w-4 h-4 text-white" />
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-center">
//                   <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
//                     <User className="w-4 h-4 text-white" />
//                   </div>
//                   <div className="text-left">
//                     {/* <div className="text-sm font-medium text-gray-900">My Account</div>
//                     <div className="text-xs text-gray-500">Manage settings</div> */}

//                      <div className="font-medium text-gray-900">{user?.name}</div>
//             <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
//                   </div>
//                 </div>
//                 <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
//               </>
//             )}
//           </button>

//           {showUserMenu && (
//             <div className={`absolute bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 ${
//               collapsed ? 'left-16 bottom-0 w-48' : 'left-0 bottom-full mb-2 w-full'
//             }`}>
//               {/* <button
//                 onClick={() => {
//                   setShowUserMenu(false);
//                   navigate('/settings');
//                 }}
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
//               >
//                 <Settings className="w-4 h-4 mr-2" />
//                 Settings
//               </button> */}
//               <hr className="my-1" />
//               <button
//                 onClick={() => {
//                   setShowUserMenu(false);
//                   logout();
//                 }}
//                 className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
//               >
//                 <LogOut className="w-4 h-4 mr-2" />
//                 Sign Out
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>

//   );
// }

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePermissions } from "../contexts/PermissionsContext.jsx";
import {
  Home,
  Users,
  UserCheck,
  FileText,
  Receipt,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import { Bell, LogOut, Menu, User } from "lucide-react";
import NotificationCenter from "./NotificationCenter.jsx";
import Icons from "../images/favicon.svg";

const taxReturnStatuses = [
  "initial request",
  "document verified",
  "in preparation",
  "in review",
  "ready to file",
  "filed return",
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const [taxReturnsExpanded, setTaxReturnsExpanded] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const activeStatus = queryParams.get("status");

  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
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
    if (status !== "All") {
      params.set("status", status);
    }
    navigate(`/tax-returns?${params.toString()}`);
  };

  const navigationItems = [
    {
      name: "Overview",
      path: "/overview",
      icon: Home,
      permission: "page:overview",
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
      permission: "page:customers",
    },
    {
      name: "Users & Roles",
      path: "/users-management",
      icon: UserCheck,
      permission: "page:users_management",
    },
    {
      name: "Tax Returns",
      path: "/tax-returns",
      icon: FileText,
      permission: "page:tax_returns",
      expandable: true,
      expanded: taxReturnsExpanded,
      onToggle: () => setTaxReturnsExpanded(!taxReturnsExpanded),
      subItems: taxReturnStatuses,
    },
    {
      name: "Invoices",
      path: "/invoices",
      icon: Receipt,
      permission: "page:invoices",
    },
    {
      name: "Payments",
      path: "/payments",
      icon: CreditCard,
      permission: "page:payments",
    },
  ];

  const visibleItems = navigationItems.filter((item) => can(item.permission));

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-lg transition-all duration-300 z-10 flex flex-col ${
        collapsed ? "w-25" : "w-64"
      }`}
    >
      {/* Header Section */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src={Icons}
                  className="w-8 h-8 drop-shadow-sm"
                  alt="TaxPortal Icon"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Tax Admin
                </h1>
              </div>
            </div>
          )}
        </div>
        {/* <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 hover:shadow-sm "
        >
          <Menu className="w-4 h-4 text-slate-600 " />
        </button> */}
        {collapsed ? (
          <div className="flex-1 flex justify-center">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 hover:shadow-sm"
            >
              <Menu className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 hover:shadow-sm"
          >
            <Menu className="w-4 h-4 text-slate-600" />
          </button>
        )}
      </div>

      {/* Navigation Section */}
      <nav className="mt-2 flex-1 px-2 justify-center items-center">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div key={item.name} className="mb-1">
              <Link
                to={item.path}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-700 to-blue-950 text-white shadow-md shadow-blue-200/50 transform scale-[1.02]"
                    : "text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 hover:shadow-sm hover:transform hover:scale-[1.01]"
                }`}
                onClick={item.onToggle}
              >
                <Icon
                  className={`${
                    collapsed ? "w-14 h-5" : "w-5 h-5 mr-3"
                  } flex-shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 font-medium tracking-wide">
                    {item.name}
                  </span>
                )}
                {!collapsed && item.expandable && (
                  <div
                    className="ml-auto p-1 rounded hover:bg-black/10 transition-colors"
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
                <div className="mt-1 ml-2 bg-slate-50/80 rounded-lg border border-slate-200/50 shadow-inner">
                  {item.subItems.map((subItem, index) => {
                    const isSubActive = activeStatus === subItem;

                    return (
                      <div
                        key={index}
                        className={`px-4 py-2.5 text-sm font-medium capitalize tracking-wide border-b border-slate-200/30 last:border-b-0 cursor-pointer transition-all duration-200 first:rounded-t-lg last:rounded-b-lg flex items-center
            ${
              isSubActive
                ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-inner"
                : "text-slate-600 hover:bg-white/80 hover:text-slate-800"
            }`}
                        onClick={() => handleStatusClick(subItem)}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-3 ${
                            isSubActive ? "bg-white" : "bg-slate-400 opacity-60"
                          }`}
                        ></div>
                        {subItem}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section with notifications and user menu */}
      <div className="border-t border-slate-200/50 p-3 bg-white/60 backdrop-blur-sm">
        {/* Notifications */}
        <div className="relative mb-3" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`group flex items-center w-full p-3 rounded-lg hover:bg-slate-100/70 transition-all duration-200 hover:shadow-sm ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium text-slate-700 tracking-wide">
                  Notifications
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-200/50 animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/60 z-50 backdrop-blur-sm">
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`group flex items-center w-full p-3 rounded-lg hover:bg-slate-100/70 transition-all duration-200 hover:shadow-sm ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {collapsed ? (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50 ring-2 ring-white">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg shadow-blue-200/50 ring-2 ring-white">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-800 text-sm tracking-wide">
                      {user?.name}
                    </div>
                    <div className="text-xs text-slate-500 capitalize font-medium">
                      {user?.role}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-all duration-200 ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>

          {showUserMenu && (
            <div
              className={`absolute bg-white rounded-lg shadow-xl border border-slate-200/60 py-2 z-50 backdrop-blur-sm ${
                collapsed
                  ? "left-16 bottom-0 w-48"
                  : "left-0 bottom-full mb-2 w-full"
              }`}
            >
              <div className="px-3 py-1">
                <div className="h-px bg-slate-200/50"></div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="group flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 w-full text-left transition-all duration-200 font-medium tracking-wide hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-3 group-hover:transform group-hover:scale-110 transition-transform" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
