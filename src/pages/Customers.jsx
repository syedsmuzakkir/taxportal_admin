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
    password: '',
    phone: '',
    role: 'individual',
  });

  useEffect(() => {
    loadCustomers();
  }, [contextCustomers]);

  const userToken = localStorage.getItem('token')
  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      // Fetch customers from the new API endpoint
      const response = await fetch(`${BASE_URL}/api/allCustomers`,{
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${userToken}`
      },
    });
      const data = await response.json();
      
      let allCustomers = data.users.map(user => ({
        id: user.customerId,
        name: user.customerName,
        email: user.customerEmail,
        mobile: user.customerPhone || '',
        documentsCount: user.totalDocuments || 0,
        returnsCount: user.totalReturns || 0,
        // Convert boolean status to string for UI
        status: user.status ? 'Active' : 'Inactive',
        taxReturnId: user.taxReturnId || null,
        taxReturnName: user.taxReturnName || null,
        returnType: user.returnType || null,
        statusLog: user.statusLog || [],
        createdAt: user.createdAt || new Date().toISOString(),
        modifiedAt: user.modifiedAt || new Date().toISOString(),
        role:user.role
      }));
      
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

  const handleStatusChange = async (customerId, newStatus, customerName ,role) => {
    try {
      setEditingStatus({ ...editingStatus, [customerId]: true });
      
      // Convert string status back to boolean for API
      const statusBoolean = newStatus === 'Active';
      
      // console.log(role, 'this is type')
      console.log(customerName, 'this is name')
      // Update customer status via API
      const response = await fetch(`${BASE_URL}/api/changeCustomerStatus/${customerId}`, {
  method: 'PATCH',
  mode: 'cors', // Explicitly set CORS mode
  headers: {
    "ngrok-skip-browser-warning": "true",
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${userToken}`
  },
  body: JSON.stringify({ 'status': statusBoolean }),
});
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state
      const updatedCustomers = customers.map(c => 
        c.id === customerId ? {...c, status: newStatus} : c
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
      addNotification({
        title: 'Status Update Failed',
        body: `Failed to update status for ${customerName}`,
        level: 'error'
      });
    } finally {
      setEditingStatus({ ...editingStatus, [customerId]: false });
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: newCustomer.name,
        email: newCustomer.email,
        password: newCustomer.password,
        role: newCustomer.role,
        phone: newCustomer.mobile,
      };

      const response = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${userToken}`},
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      addNotification({
        title: 'Status',
        body: `Registered Successfully`,
        level: 'success'
      });
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Success flow
      const createdCustomer = data;

      const updatedCustomers = [...customers, {
        id: createdCustomer.id || createdCustomer.customerId,
        name: createdCustomer.name || createdCustomer.customerName,
        email: createdCustomer.email || createdCustomer.customerEmail,
        mobile: createdCustomer.phone || createdCustomer.mobile || '',
        documentsCount: 0,
        returnsCount: 0,
        status: 'Active', // Default status for new customers
        
      }];
      
      setCustomers(updatedCustomers);
      updateCustomers(updatedCustomers);

      addActivity({
        user: user.name,
        action: `Created new customer ${createdCustomer.name || createdCustomer.customerName}`,
        entityType: "customer",
        entityId: createdCustomer.id || createdCustomer.customerId,
      });

      await addNotification({
        title: "New Customer Created",
        body: `${createdCustomer.name || createdCustomer.customerName} has been added to the system`,
        level: "success",
        relatedEntity: { type: "customer", id: createdCustomer.id || createdCustomer.customerId },
      });

      setNewCustomer({
        name: "",
        email: "",
        password: "",
        mobile: "",
        role: "individual",
      });
      setShowCreateModal(false);

    } catch (error) {
      console.error("Error creating customer:", error.message);

      await addNotification({
        title: "Customer Creation Failed",
        body: error.message,
        level: "error",
      });
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (window.confirm(`Are you sure you want to delete ${customerName}?`)) {
      try {
        // Call API to delete customer
        const response = await fetch(`${BASE_URL}/api/deleteCustomer/${customerId}`, {
          headers:{
            "Authorization": `Bearer ${userToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete customer');
        }
        
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
        addNotification({
          title: 'Deletion Failed',
          body: `Failed to delete ${customerName}`,
          level: 'error'
        });
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      // case 'Pending': return 'bg-yellow-100 text-yellow-800';
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
    <div className="space-y-6 ml-5">
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
                        onChange={(e) => handleStatusChange(customer.id, e.target.value, customer.name, customer.role)}
                        disabled={editingStatus[customer.id]}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(customer.status)} ${
                          editingStatus[customer.id] ? 'opacity-50' : 'cursor-pointer'
                        }`}
                      >
                        <option value="Active">Active</option>
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
                      {/* {can('action:customer.delete') && (
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )} */}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={newCustomer.password}
              onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              required
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1-555-0123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={newCustomer.role}
              onChange={(e) => setNewCustomer({ ...newCustomer, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
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