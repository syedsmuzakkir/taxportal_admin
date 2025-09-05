// import { getData } from '../seedData.js';
// import { simulateNetwork } from './utils.js';

// export const authAPI = {
//   async login(email, password) {
//     await simulateNetwork(800);
    
//     const data = getData();
//     const user = data.users.find(u => u.email === email && u.password === password);
    
//     if (!user) {
//       throw new Error('Invalid email or password');
//     }

//     if (!user.isActive) {
//       throw new Error('Account is inactive. Please contact administrator.');
//     }

//     // Return user without password
//     const { password: _, ...userWithoutPassword } = user;
//     return userWithoutPassword;
//   },

//   async verify2FA(code) {
//     await simulateNetwork(300);
//     // This is handled in the AuthContext
//     return { success: true };
//   }
// };



export const authAPI = {
  async login(email, password) {
    try {
      const response = await fetch('https://taxation-backend.onrender.com/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      // The login API should return a success message indicating OTP was sent
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  async verifyOTP(email, otp) {
    try {
      const response = await fetch('https://taxation-backend.onrender.com/api/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      const data = await response.json();
      localStorage.setItem("loginId", data.user.id.toString());
      localStorage.setItem("role", data.user.role.toString());
      let loginId = localStorage.getItem("loginId");
      
      // console.log(loginId)
      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message
      };
    } catch (error) {
      throw new Error(error.message || 'OTP verification failed');
    }
  }
};