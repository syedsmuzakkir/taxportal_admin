import { getData, saveData } from '../seedData.js';
import { simulateNetwork, simulateError } from './utils.js';

export const paymentsAPI = {
  async getAll() {
    await simulateNetwork();
    simulateError(0.05);
    
    const data = getData();
    return data.payments || [];
  },

  async create(paymentData) {
    await simulateNetwork(500);
    simulateError(0.05);
    
    const data = getData();
    const newPayment = {
      ...paymentData,
      id: Date.now().toString(),
      transactionId: `tx_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    data.payments.push(newPayment);
    saveData(data);
    
    return newPayment;
  },

  async refund(id) {
    await simulateNetwork(800);
    simulateError(0.05);
    
    const data = getData();
    const index = data.payments.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Payment not found');
    }
    
    data.payments[index] = {
      ...data.payments[index],
      status: 'Refunded',
      refundedAt: new Date().toISOString()
    };
    
    saveData(data);
    return data.payments[index];
  }
};