// // Keep a reference to the original fetch
// const originalFetch = window.fetch;
// import { useNotifications } from '../contexts/NotificationsContext.jsx';


// // Override global fetch
// window.fetch = async (...args) => {

// const { addNotification } = useNotifications();

//   try {
//     const response = await originalFetch(...args);
//     console.log(response , 'response')

//     const clonedResponse = response.clone();

//     let data;
//     try {
//       data = await clonedResponse.json();
//     } catch (e) {
//       data = null; 
//     }

//     // console.log('data',data)

//     //Check for "Token expired" message
//     if (data?.error?.toLowerCase().includes("token expired")) {

       
//       handleLogout();

      
//     }

//     return response;
//   } catch (error) {
//      await addNotification({
//         title: 'Token expired ',
//         body: `Please Login again`,
//         level: 'error',
//       });
//     return Promise.reject(error);
//   }
// };

// function handleLogout() {
//   localStorage.clear();
//   window.location.href = "/login"; // redirect
// }




// import Toastify from 'toastify-js';
// import 'toastify-js/src/toastify.css';
// import { ToastContainer, toast } from 'react-toastify';

// // Keep a reference to the original fetch
// const originalFetch = window.fetch;

// window.fetch = async (...args) => {
//   try {
//     const response = await originalFetch(...args);
//     const clonedResponse = response.clone();

//     let data;
//     try {
//       data = await clonedResponse.json();
//     } catch (e) {
//       data = null; 
//     }

//     if (data?.error?.toLowerCase().includes("token expired")) {
//     //   Toastify({
//     //     text: "Token expired. Please login again.",
//     //     duration: 3000,
//     //     gravity: "top",
//     //     position: "right",
//     //     backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
//     //   }).showToast();

//     //   toast("Token expired. Please login again.")

//     if (Notification.permission === 'granted') {
//         new Notification('Session Expired', {
//           body: 'Your token has expired. Please login again.',
//           icon: '/icon.png'
//         });
//       }
      
//       handleLogout();
//     }

//     return response;
//   } catch (error) {
//     // Toastify({
//     //   text: "Network error occurred",
//     //   duration: 3000,
//     //   gravity: "top",
//     //   position: "right",
//     //   backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
//     // }).showToast();
    
//     return Promise.reject(error);
//   }
// };

// function handleLogout() {
//   localStorage.clear();
//   window.location.href = "/login";
// }


import { toast } from 'react-toastify';

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    // Only process if response is OK and looks like JSON
    if (response.ok) {
      const clone = response.clone();
      const contentType = clone.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await clone.json();
          if (data?.error?.toLowerCase().includes("token expired")) {
            handleTokenExpiration();
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    toast.error("Network error occurred");
    throw error;
  }
};

function handleTokenExpiration() {
  // Show notification if permission granted
  if (Notification.permission === 'granted') {
    new Notification('Session Expired', {
      body: 'Your token has expired. Please login again.',
      icon: '/icon.png'
    });
  }
  
  // Show toast
  toast.error("Token expired. Please login again.");
  
  // Logout after delay
  setTimeout(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }, 2000);
}

export { handleTokenExpiration };