import { getData, saveData } from '../seedData.js';
import { simulateNetwork, simulateError } from './utils.js';

export const customersAPI = {
  async getAll() {
    await simulateNetwork();
    simulateError(0.05);
    
    const data = getData();
    return data.customers || [];
  },

  async getById(id) {
    await simulateNetwork();
    simulateError(0.05);
    
    const data = getData();
    const customer = data.customers.find(c => c.id === id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  },

  async create(customerData) {
    await simulateNetwork(600);
    simulateError(0.05);
    
    const data = getData();
    const newCustomer = {
      ...customerData,
      id: Date.now().toString(),
      documentsCount: 0,
      returnsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.customers.push(newCustomer);
    saveData(data);
    
    return newCustomer;
  },

  async update(id, updates) {
    await simulateNetwork(400);
    simulateError(0.05);
    
    const data = getData();
    const index = data.customers.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Customer not found');
    }
    
    data.customers[index] = {
      ...data.customers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    saveData(data);
    return data.customers[index];
  },

  async delete(id) {
    await simulateNetwork(300);
    simulateError(0.05);
    
    const data = getData();
    data.customers = data.customers.filter(c => c.id !== id);
    saveData(data);
    
    return { success: true };
  }
};