import { getData, saveData } from '../seedData.js';
import { simulateNetwork } from './utils.js';

export const notificationsAPI = {
  async getAll() {
    await simulateNetwork(200);
    
    const data = getData();
    return data.notifications || [];
  },

  async create(notification) {
    await simulateNetwork(300);
    
    const data = getData();
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString()
    };
    
    if (!data.notifications) {
      data.notifications = [];
    }
    
    data.notifications.unshift(newNotification);
    saveData(data);
    
    return newNotification;
  },

  async markRead(id) {
    await simulateNetwork(100);
    
    const data = getData();
    const index = data.notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      data.notifications[index].read = true;
      saveData(data);
    }
    
    return { success: true };
  }
};