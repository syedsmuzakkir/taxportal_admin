import { getData } from '../seedData.js';
import { simulateNetwork } from './utils.js';

export const authAPI = {
  async login(email, password) {
    await simulateNetwork(800);
    
    const data = getData();
    const user = data.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async verify2FA(code) {
    await simulateNetwork(300);
    // This is handled in the AuthContext
    return { success: true };
  }
};