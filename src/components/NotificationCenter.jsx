import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { formatDistanceToNow } from '../utils/dateUtils.js';
import { X, FileText, Users, Receipt, CreditCard } from 'lucide-react';

const entityIcons = {
  return: FileText,
  customer: Users,
  invoice: Receipt,
  payment: CreditCard,
  user: Users
};

export default function NotificationCenter({ onClose }) {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to related entity
    const { type, id } = notification.relatedEntity;
    switch (type) {
      case 'customer':
        navigate(`/customers/${id}`);
        break;
      case 'return':
        navigate('/tax-returns');
        break;
      case 'invoice':
        navigate('/invoices');
        break;
      case 'payment':
        navigate('/payments');
        break;
      case 'user':
        navigate('/users-management');
        break;
      default:
        break;
    }
    
    onClose();
  };

  return (
    <div 
      ref={ref}
      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = entityIcons[notification.relatedEntity?.type] || FileText;
            
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    notification.level === 'success' ? 'bg-green-100 text-green-600' :
                    notification.level === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    notification.level === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt))} ago
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}