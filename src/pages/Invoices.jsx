import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { invoicesAPI } from '../api/invoices.js';
import { Plus, Receipt, Download, Eye, Edit, X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils.js';
import Modal from '../components/Modal.jsx';

export default function Invoices() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { invoices: contextInvoices, updateInvoices, customers, taxReturns, addActivity } = useData();
  const { addNotification } = useNotifications();
  const [invoices, setInvoices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    returnName: '',
    returnType: '',
    documentsCount: 0,
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    discount: 0,
    taxRate: 0
  });

  useEffect(() => {
    loadInvoices();
  }, [contextInvoices]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const invoiceList = await invoicesAPI.getAll();
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    
    try {
      const customer = customers.find(c => c.id === newInvoice.customerId);
      const invoiceData = {
        ...newInvoice,
        customerName: customer?.name || '',
        amount: newInvoice.items.reduce((sum, item) => sum + item.amount, 0)
      };

      const createdInvoice = await invoicesAPI.create(invoiceData);
      const updatedInvoices = [...invoices, createdInvoice];
      setInvoices(updatedInvoices);
      updateInvoices(updatedInvoices);

      // Add activity
      addActivity({
        user: user.name,
        action: `Created invoice for ${customer?.name}`,
        entityType: 'invoice',
        entityId: createdInvoice.id
      });

      // Add notification
      await addNotification({
        title: 'New Invoice Created',
        body: `Invoice #${createdInvoice.id} created for ${customer?.name} - $${createdInvoice.total.toFixed(2)}`,
        level: 'success',
        relatedEntity: { type: 'invoice', id: createdInvoice.id }
      });

      setShowCreateModal(false);
      setNewInvoice({
        customerId: '',
        returnName: '',
        returnType: '',
        documentsCount: 0,
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        discount: 0,
        taxRate: 0
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const addLineItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeLineItem = (index) => {
    const items = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items });
  };

  const updateLineItem = (index, field, value) => {
    const items = [...newInvoice.items];
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    
    setNewInvoice({ ...newInvoice, items });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrintInvoice = (invoice) => {
    // Create a new window with the invoice content
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { text-align: right; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TaxPortal Demo</h1>
            <h2>Invoice #${invoice.id}</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Customer:</strong> ${invoice.customerName}</p>
            <p><strong>Return:</strong> ${invoice.returnName} (${invoice.returnType})</p>
            <p><strong>Date:</strong> ${formatDate(invoice.createdAt)}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.rate.toFixed(2)}</td>
                  <td>$${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> $${invoice.tax.toFixed(2)}</p>
            <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        {can('component:invoice.create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </button>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">#{invoice.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{invoice.returnName}</div>
                      <div className="text-sm text-gray-500">{invoice.returnType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${invoice.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {can('component:invoice.export') && (
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-700 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Invoice"
        size="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <select
              required
              value={newInvoice.customerId}
              onChange={(e) => {
                const customer = customers.find(c => c.id === e.target.value);
                const customerReturns = taxReturns.filter(r => r.customerId === e.target.value);
                setNewInvoice({
                  ...newInvoice,
                  customerId: e.target.value,
                  returnName: customerReturns[0]?.name || '',
                  returnType: customerReturns[0]?.type || '',
                  documentsCount: customer?.documentsCount || 0
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>

          {/* Line Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
            <div className="space-y-3">
              {newInvoice.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateLineItem(index, 'rate', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      readOnly
                      value={item.amount.toFixed(2)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    {newInvoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="mt-3 text-blue-600 hover:text-blue-700 transition-colors text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Line Item
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Invoice
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}