import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { customersAPI } from '../api/customers.js';
import { Search, Plus, Edit, Trash2, FileText, Eye, Users } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import {BASE_URL} from '../api/BaseUrl.js';

export default function Customers() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { customers: contextCustomers, updateCustomers, addActivity } = useData();
  const { addNotification } = useNotifications();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    mobile: '',
    ssn: '',
    status: 'Active'
  });

  useEffect(() => {
    loadCustomers();
  }, [contextCustomers]);

  // const loadCustomers = async () => {
  //   try {
  //     setIsLoading(true);
  //     // let allCustomers = await customersAPI.getAll();
      
  //     let allCustomers = await customersAPI( 'http://192.168.1.5:3000/api/allCustomers');

  //     console.log(allCustomers, 'this is customers api ')

      
 
  //     // Filter for clients - they can only see their own data
  //     if (user?.role === 'client') {
  //       allCustomers = allCustomers.filter(c => c.ownerId === user.id);
  //     }
      
  //     setCustomers(allCustomers);
  //   } catch (error) {
  //     console.error('Error loading customers:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const loadCustomers = async () => {
  try {
    setIsLoading(true);
    // Fetch customers from the new API endpoint
    const response = await fetch(`${BASE_URL}/api/allCustomers`);
    const data = await response.json();
    
    let allCustomers = data.users.map(user => ({
      id: user.customerId || '',  // Math.random().toString(36).substr(2, 9), // Generate a random ID if not provided
      name: user.customerName,
      email: user.customerEmail,
      mobile: user.customerPhone || '',
      documentsCount: user.totalDocuments || 0,
      returnsCount: user.totalReturns || 0,
      status: user.taxReturnStatus || 'No Return',
      taxReturnId: user.taxReturnId || null,
      taxReturnName: user.taxReturnName || null,
      returnType: user.returnType || null,
      statusLog: user.statusLog || [],
      createdAt: user.createdAt || new Date().toISOString(),
      modifiedAt: user.modifiedAt || new Date().toISOString()
    }));
    
    console.log(allCustomers ,' this is customer')
    // Filter for clients - they can only see their own data
    if (user?.role === 'client') {
      allCustomers = allCustomers.filter(c => c.ownerId === user.id);
    }
    
    setCustomers(allCustomers);
  } catch (error) {
    console.error('Error loading customers:', error);
  } finally {
    setIsLoading(false);
  }
};
  const handleStatusChange = async (customerId, newStatus, customerName) => {
    try {
      setEditingStatus({ ...editingStatus, [customerId]: true });
      const updatedCustomer = await customersAPI.update(customerId, { status: newStatus });
      
      const updatedCustomers = customers.map(c => 
        c.id === customerId ? updatedCustomer : c
      );
      setCustomers(updatedCustomers);
      updateCustomers(updatedCustomers);

      // Add activity
      addActivity({
        user: user.name,
        action: `Updated status to ${newStatus} for ${customerName}`,
        entityType: 'customer',
        entityId: customerId
      });

      await addNotification({
        title: 'Customer Status Updated',
        body: `${customerName} status changed to ${newStatus}`,
        level: 'info',
        relatedEntity: { type: 'customer', id: customerId }
      });

    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setEditingStatus({ ...editingStatus, [customerId]: false });
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    
    try {
      const customerData = {
        ...newCustomer,
        ownerId: user.role === 'client' ? user.id : null
      };

      const createdCustomer = await customersAPI.create(customerData);
      const updatedCustomers = [...customers, createdCustomer];
      setCustomers(updatedCustomers);
      updateCustomers(updatedCustomers);

      // Add activity
      addActivity({
        user: user.name,
        action: `Created new customer ${createdCustomer.name}`,
        entityType: 'customer',
        entityId: createdCustomer.id
      });

      await addNotification({
        title: 'New Customer Created',
        body: `${createdCustomer.name} has been added to the system`,
        level: 'success',
        relatedEntity: { type: 'customer', id: createdCustomer.id }
      });

      setNewCustomer({
        name: '',
        email: '',
        mobile: '',
        ssn: '',
        status: 'Active'
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (window.confirm(`Are you sure you want to delete ${customerName}?`)) {
      try {
        await customersAPI.delete(customerId);
        const updatedCustomers = customers.filter(c => c.id !== customerId);
        setCustomers(updatedCustomers);
        updateCustomers(updatedCustomers);

        // Add activity
        addActivity({
          user: user.name,
          action: `Deleted customer ${customerName}`,
          entityType: 'customer',
          entityId: customerId
        });

        await addNotification({
          title: 'Customer Deleted',
          body: `${customerName} has been removed from the system`,
          level: 'warning',
          relatedEntity: { type: 'customer', id: customerId }
        });

      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        {can('action:customer.create') && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returns
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{customer.documentsCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{customer.returnsCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {can('action:customer.edit') ? (
                      <select
                        value={customer.status}
                        onChange={(e) => handleStatusChange(customer.id, e.target.value, customer.name)}
                        disabled={editingStatus[customer.id]}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(customer.status)} ${
                          editingStatus[customer.id] ? 'opacity-50' : 'cursor-pointer'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {/* {can('action:customer.edit') && (
                        <button 
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )} */}
                      {can('action:customer.delete') && (
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new customer.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Customer"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
            <input
              type="tel"
              required
              value={newCustomer.mobile}
              onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1-555-0123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SSN</label>
            <input
              type="text"
              required
              value={newCustomer.ssn}
              onChange={(e) => setNewCustomer({ ...newCustomer, ssn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="***-**-1234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={newCustomer.status}
              onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Customer
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