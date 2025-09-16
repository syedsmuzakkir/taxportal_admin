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




import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { ToastContainer, toast } from 'react-toastify';

// Keep a reference to the original fetch
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    const clonedResponse = response.clone();

    let data;
    try {
      data = await clonedResponse.json();
    } catch (e) {
      data = null; 
    }

    if (data?.error?.toLowerCase().includes("token expired")) {
    //   Toastify({
    //     text: "Token expired. Please login again.",
    //     duration: 3000,
    //     gravity: "top",
    //     position: "right",
    //     backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
    //   }).showToast();

    //   toast("Token expired. Please login again.")

    if (Notification.permission === 'granted') {
        new Notification('Session Expired', {
          body: 'Your token has expired. Please login again.',
          icon: '/icon.png'
        });
      }
      
      handleLogout();
    }

    return response;
  } catch (error) {
    // Toastify({
    //   text: "Network error occurred",
    //   duration: 3000,
    //   gravity: "top",
    //   position: "right",
    //   backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
    // }).showToast();
    
    return Promise.reject(error);
  }
};

function handleLogout() {
  localStorage.clear();
  window.location.href = "/login";
}