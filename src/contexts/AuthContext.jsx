import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/auth.js';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  requiresOTP: false,
  otpValidated: false,
  isLoading: true,   // stays true until restore completes
  loginEmail: null,
  loginPassword: null,
  permissions: {},   // default empty object instead of null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        requiresOTP: true,
        loginEmail: action.payload.email,
        loginPassword: action.payload.password,
        isLoading: false 
      };
    case 'OTP_SUCCESS':
      return { 
        ...state, 
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        otpValidated: true,
        requiresOTP: false,
        loginPassword: null,
        isLoading: false,
        permissions: action.payload.permissions || {}, 
      };
    case 'LOGOUT':
      return { 
        ...initialState, 
        isLoading: false 
      };
    case 'RESTORE_SESSION':
      return { 
        ...state, 
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true, 
        otpValidated: true,
        requiresOTP: false,
        isLoading: false,
        permissions: action.payload.permissions || {}, 
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Restore session from localStorage
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        console.log("Restoring session:", sessionData); // debug
        dispatch({ type: 'RESTORE_SESSION', payload: sessionData });
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('userSession');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authAPI.login(email, password);
      if (result.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { email, password } });
        return { success: true, message: result.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authAPI.verifyOTP(state.loginEmail, otp);
      if (result.success) {
        const sessionData = {
          user: result.user,
          token: result.token,
          permissions: result.permissions || {},
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        dispatch({ type: 'OTP_SUCCESS', payload: sessionData });
        return { success: true, message: result.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const resendOTP = async () => {
    try {
      if (!state.loginEmail || !state.loginPassword) {
        throw new Error('No login credentials available');
      }
      const result = await authAPI.login(state.loginEmail, state.loginPassword);
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('userSession');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
    verifyOTP,
    resendOTP,
  };

  // 🔒 Don’t render children until restore is complete
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
