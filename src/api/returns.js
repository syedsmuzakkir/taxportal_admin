import { getData, saveData } from '../seedData.js';
import { simulateNetwork, simulateError } from './utils.js';

export const returnsAPI = {
  async getAll() {
    await simulateNetwork();
    simulateError(0.05);
    
    const data = getData();
    return data.taxReturns || [];
  },

  async getById(id) {
    await simulateNetwork();
    simulateError(0.05);
    
    const data = getData();
    const taxReturn = data.taxReturns.find(r => r.id === id);
    
    if (!taxReturn) {
      throw new Error('Tax return not found');
    }
    
    return taxReturn;
  },

  async updateStatus(id, status, reviewerId = null) {
    await simulateNetwork(400);
    simulateError(0.05);
    
    const data = getData();
    const index = data.taxReturns.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Tax return not found');
    }
    
    const updates = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (reviewerId) {
      const reviewer = data.users.find(u => u.id === reviewerId);
      updates.assignedReviewer = reviewer ? reviewer.name : null;
      updates.reviewerId = reviewerId;
    }
    
    data.taxReturns[index] = {
      ...data.taxReturns[index],
      ...updates
    };
    
    saveData(data);
    return data.taxReturns[index];
  }
};