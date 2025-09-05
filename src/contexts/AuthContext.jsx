// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { authAPI } from '../api/auth.js';

// const AuthContext = createContext();

// const initialState = {
//   user: null,
//   isAuthenticated: false,
//   requires2FA: false,
//   twoFAValidated: false,
//   isLoading: true,
//   currentCode: null
// };

// function authReducer(state, action) {
//   switch (action.type) {
//     case 'SET_LOADING':
//       return { ...state, isLoading: action.payload };
//     case 'LOGIN_SUCCESS':
//       return { 
//         ...state, 
//         user: action.payload, 
//         isAuthenticated: true, 
//         requires2FA: true,
//         twoFAValidated: false,
//         isLoading: false 
//       };
//     case 'SET_2FA_CODE':
//       return { ...state, currentCode: action.payload };
//     case '2FA_SUCCESS':
//       return { 
//         ...state, 
//         twoFAValidated: true, 
//         requires2FA: false,
//         currentCode: null
//       };
//     case 'LOGOUT':
//       return { 
//         ...initialState, 
//         isLoading: false 
//       };
//     case 'RESTORE_SESSION':
//       return { 
//         ...state, 
//         user: action.payload, 
//         isAuthenticated: true, 
//         twoFAValidated: true,
//         requires2FA: false,
//         isLoading: false 
//       };
//     default:
//       return state;
//   }
// }

// export function AuthProvider({ children }) {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   useEffect(() => {
//     // Check for existing session
//     const session = localStorage.getItem('userSession');
//     if (session) {
//       try {
//         const userData = JSON.parse(session);
//         dispatch({ type: 'RESTORE_SESSION', payload: userData });
//       } catch (error) {
//         console.error('Error restoring session:', error);
//         localStorage.removeItem('userSession');
//         dispatch({ type: 'SET_LOADING', payload: false });
//       }
//     } else {
//       dispatch({ type: 'SET_LOADING', payload: false });
//     }
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const user = await authAPI.login(email, password);
      
//       // Generate 2FA code
//       const code = Math.floor(100000 + Math.random() * 900000).toString();
//       dispatch({ type: 'SET_2FA_CODE', payload: code });
      
//       // Simulate sending code
//       console.log(`2FA Code for ${email}: ${code}`);
      
//       dispatch({ type: 'LOGIN_SUCCESS', payload: user });
//       return { success: true, user };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   };

//   const verify2FA = async (code) => {
//     if (code === state.currentCode) {
//       // Save session
//       localStorage.setItem('userSession', JSON.stringify(state.user));
//       dispatch({ type: '2FA_SUCCESS' });
//       return { success: true };
//     } else {
//       return { success: false, error: 'Invalid verification code' };
//     }
//   };

//   const resend2FA = () => {
//     const newCode = Math.floor(100000 + Math.random() * 900000).toString();
//     dispatch({ type: 'SET_2FA_CODE', payload: newCode });
//     console.log(`New 2FA Code: ${newCode}`);
//     return newCode;
//   };

//   const logout = () => {
//     localStorage.removeItem('userSession');
//     dispatch({ type: 'LOGOUT' });
//   };

//   const value = {
//     ...state,
//     login,
//     logout,
//     verify2FA,
//     resend2FA
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/auth.js';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  requiresOTP: false,
  otpValidated: false,
  isLoading: true,
  loginEmail: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        requiresOTP: true,
        loginEmail: action.payload,
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
        isLoading: false 
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
        isLoading: false 
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
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
        dispatch({ type: 'LOGIN_SUCCESS', payload: email });
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
        // Save session
        const sessionData = {
          user: result.user,
          token: result.token
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

  const logout = () => {
    localStorage.removeItem('userSession');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
    verifyOTP
  };

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