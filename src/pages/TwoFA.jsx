// import React, { useState, useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext.jsx';
// import { FileText, RotateCcw } from 'lucide-react';

// export default function TwoFA() {
//   const { user, verify2FA, resend2FA, twoFAValidated, isAuthenticated, currentCode } = useAuth();
//   const [code, setCode] = useState('');
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [resendCooldown, setResendCooldown] = useState(0);

//   useEffect(() => {
//     if (resendCooldown > 0) {
//       const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendCooldown]);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (twoFAValidated) {
//     return <Navigate to="/overview" replace />;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsSubmitting(true);

//     try {
//       const result = await verify2FA(code);
//       if (!result.success) {
//         setError(result.error);
//         setCode('');
//       }
//     } catch (err) {
//       setError('Verification failed. Please try again.');
//       setCode('');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleResend = () => {
//     const newCode = resend2FA();
//     setResendCooldown(30);
//     setError('');
//     console.log(`New verification code: ${newCode}`);
//   };

//   const handleCodeChange = (e) => {
//     const value = e.target.value.replace(/\D/g, '').slice(0, 6);
//     setCode(value);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-lg shadow-lg p-8">
//           <div className="text-center mb-8">
//             <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
//               <FileText className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
//             <p className="text-gray-600 mt-2">
//               We've sent a 6-digit code to your registered device
//             </p>
//           </div>

//           {currentCode && (
//             <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
//               <p className="text-sm text-blue-700">
//                 <strong>Demo Code:</strong> {currentCode}
//               </p>
//             </div>
//           )}

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//               <p className="text-sm text-red-600">{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
//                 Verification Code
//               </label>
//               <input
//                 id="code"
//                 type="text"
//                 required
//                 value={code}
//                 onChange={handleCodeChange}
//                 className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
//                 placeholder="000000"
//                 maxLength="6"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting || code.length !== 6}
//               className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//             >
//               {isSubmitting ? 'Verifying...' : 'Verify Code'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <button
//               onClick={handleResend}
//               disabled={resendCooldown > 0}
//               className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto"
//             >
//               <RotateCcw className="w-4 h-4 mr-2" />
//               {resendCooldown > 0 
//                 ? `Resend code in ${resendCooldown}s` 
//                 : 'Resend verification code'
//               }
//             </button>
//           </div>

//           <div className="mt-6 text-center">
//             <p className="text-xs text-gray-500">
//               Signed in as <strong>{user?.name}</strong> ({user?.email})
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FileText, RotateCcw } from 'lucide-react';

export default function TwoFA() {
  const { user, verifyOTP, otpValidated, isAuthenticated, loginEmail, isLoading, resendOTP } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (loginEmail) {
      setMessage(`We've sent a 6-digit code to ${loginEmail}`);
      // Start the resend timer when component mounts
      startResendTimer();
    }
  }, [loginEmail]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(30); // 30 seconds cooldown
  };

  if (!isAuthenticated && !loginEmail) {
    return <Navigate to="/login" replace />;
  }

  if (otpValidated) {
    return <Navigate to="/overview" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await verifyOTP(code);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    
    setIsResending(true);
    setError('');
    
    try {
      const result = await resendOTP();
      if (result.success) {
        setMessage(`A new code has been sent to ${loginEmail}`);
        startResendTimer();
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              {/* <FileText className="w-8 h-8 text-white" /> */}
                   <img src="../../src/images/favicon.svg" 
  className="w-8 h-8" 
  alt="TaxPortal Icon"
  style={{ objectFit: 'contain' }}
/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
            <p className="text-gray-600 mt-2">
              {message || 'We ve sent a 6-digit code to your registered email'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={handleCodeChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center mx-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isResending ? 'Sending...' : 
               resendTimer > 0 ? `Resend in ${resendTimer}s` : 
               'Resend verification code'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Signed in as <strong>{loginEmail}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}