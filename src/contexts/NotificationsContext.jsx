import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { notificationsAPI } from '../api/notifications.js';

const NotificationsContext = createContext();

const initialState = {
  notifications: [],
  toasts: [],
  unreadCount: 0
};

function notificationsReducer(state, action) {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      const unreadCount = action.payload.filter(n => !n.read).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: Date.now() }]
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload)
      };
    default:
      return state;
  }
}

export function NotificationsProvider({ children }) {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const notifications = await notificationsAPI.getAll();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const addNotification = async (notification) => {
    try {
      const newNotification = await notificationsAPI.create(notification);
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
      
      // Also show as toast
      showToast({
        title: notification.title,
        message: notification.body,
        type: notification.level || 'info'
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      dispatch({ type: 'MARK_READ', payload: id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const showToast = (toast) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: toast.id || Date.now() });
    }, 5000);
  };

  const value = {
    ...state,
    addNotification,
    markAsRead,
    showToast,
    removeToast: (id) => dispatch({ type: 'REMOVE_TOAST', payload: id })
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}