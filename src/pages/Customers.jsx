import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { customersAPI } from '../api/customers.js';
import { Search, Plus, Edit, Trash2, FileText, Eye, Users, Check, X } from 'lucide-react';
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

  // Assign Returns Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [currentCustomerName, setCurrentCustomerName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [customerReturns, setCustomerReturns] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedReturnIds, setSelectedReturnIds] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [returnsError, setReturnsError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [contextCustomers]);

  const userToken = localStorage.getItem('token')

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
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
        status: user.status ? 'Active' : 'Inactive',
        taxReturnId: user.taxReturnId || null,
        taxReturnName: user.taxReturnName || null,
        returnType: user.returnType || null,
        statusLog: user.statusLog || [],
        createdAt: user.createdAt || new Date().toISOString(),
        modifiedAt: user.modifiedAt || new Date().toISOString(),
        role: user.role
      }));
      
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

  const handleAssignReturns = async (customerId, customerName) => {
    setCurrentCustomerId(customerId);
    setCurrentCustomerName(customerName);
    setShowAssignModal(true);
    setSelectedUserId('');
    setSelectedReturnIds([]);
    setCustomerReturns([]); // Clear previous returns
    setReturnsError(''); // Clear previous errors
    
    // Load users and returns for this customer
    await loadAllUsers();
    await loadCustomerReturns(customerId);
  };

  const loadAllUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch(`${BASE_URL}/api/allUsers`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      // Filter out client users if needed, or show all
      const filteredUsers = data.filter(user => user.role !== 'client');
      setAllUsers(filteredUsers || []);
    } catch (error) {
      console.error('Error loading users:', error);
      addNotification({
        title: 'Error',
        body: 'Failed to load users',
        level: 'error'
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadCustomerReturns = async (customerId) => {
    try {
      setIsLoadingReturns(true);
      setReturnsError(''); // Clear any previous errors
      const response = await fetch(`${BASE_URL}/api/tax-returns/${customerId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
      });
      
      if (!response.ok) {
        // If response is not ok, try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch returns: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response contains an error message
      if (data && data.error) {
        setReturnsError(data.error);
        setCustomerReturns([]);
      } else if (Array.isArray(data)) {
        setCustomerReturns(data);
        setReturnsError('');
      } else {
        setReturnsError('Invalid response format');
        setCustomerReturns([]);
      }
    } catch (error) {
      console.error('Error loading returns:', error);
      setReturnsError(error.message);
      setCustomerReturns([]);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const handleReturnSelection = (returnId) => {
    setSelectedReturnIds(prev => {
      if (prev.includes(returnId)) {
        return prev.filter(id => id !== returnId);
      } else {
        return [...prev, returnId];
      }
    });
  };

  const handleSelectAllReturns = () => {
    if (selectedReturnIds.length === customerReturns.length) {
      setSelectedReturnIds([]);
    } else {
      const allReturnIds = customerReturns.map(returnItem => returnItem.id).filter(Boolean);
      setSelectedReturnIds(allReturnIds);
    }
  };

  const assignReturnsToUser = async () => {
    if (!selectedUserId) {
      addNotification({
        title: 'Validation Error',
        body: 'Please select a user',
        level: 'error'
      });
      return;
    }

    if (selectedReturnIds.length === 0) {
      addNotification({
        title: 'Validation Error',
        body: 'Please select at least one return',
        level: 'error'
      });
      return;
    }

    try {
      setIsAssigning(true);
      
      const payload = {
        user_id: parseInt(selectedUserId),
        return_ids: selectedReturnIds.map(id => parseInt(id))
      };

      const response = await fetch(`${BASE_URL}/api/assign-returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to assign returns');
      }

      const data = await response.json();
      
      addNotification({
        title: 'Success',
        body: `Successfully assigned ${selectedReturnIds.length} returns to user`,
        level: 'success'
      });

      // Close modal and reset state
      setShowAssignModal(false);
      setSelectedUserId('');
      setSelectedReturnIds([]);
      setCustomerReturns([]);
      setReturnsError('');
      
      // Refresh customers to reflect changes
      loadCustomers();

    } catch (error) {
      console.error('Error assigning returns:', error);
      addNotification({
        title: 'Assignment Failed',
        body: 'Failed to assign returns to user',
        level: 'error'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusChange = async (customerId, newStatus, customerName, role) => {
    try {
      setEditingStatus({ ...editingStatus, [customerId]: true });
      
      const statusBoolean = newStatus === 'Active';
      
      const response = await fetch(`${BASE_URL}/api/changeCustomerStatus/${customerId}`, {
        method: 'PATCH',
        mode: 'cors',
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
      
      const updatedCustomers = customers.map(c => 
        c.id === customerId ? {...c, status: newStatus} : c
      );
      
      setCustomers(updatedCustomers);
      updateCustomers(updatedCustomers);

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

      const createdCustomer = data;

      const updatedCustomers = [...customers, {
        id: createdCustomer.id || createdCustomer.customerId,
        name: createdCustomer.name || createdCustomer.customerName,
        email: createdCustomer.email || createdCustomer.customerEmail,
        mobile: createdCustomer.phone || createdCustomer.mobile || '',
        documentsCount: 0,
        returnsCount: 0,
        status: 'Active',
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assign Returns
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
                  <td>
                    {can("update") ? (
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
                    </div>
                  </td>
                  <td>
                    <div className='text-center'>
                      <button 
                        onClick={() => handleAssignReturns(customer.id, customer.name)}
                        className="px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors text-sm font-medium"
                        title="Assign Returns"
                      >
                        Assign
                      </button>
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

      {/* Assign Returns Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setCustomerReturns([]);
          setReturnsError('');
        }}
        title={`Assign Returns - ${currentCustomerName}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a user</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role}) - {user.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Returns Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Returns to Assign
              </label>
              {customerReturns.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllReturns}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedReturnIds.length === customerReturns.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            
            {isLoadingReturns ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : returnsError ? (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">{returnsError}</p>
              </div>
            ) : customerReturns.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No returns found for this customer</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                {customerReturns.map(returnItem => (
                  <div key={returnItem.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`return-${returnItem.id}`}
                      checked={selectedReturnIds.includes(returnItem.id)}
                      onChange={() => handleReturnSelection(returnItem.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`return-${returnItem.id}`} className="ml-3 flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{returnItem.return_type}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          returnItem.status === 'filed return' ? 'bg-green-100 text-green-800' :
                          returnItem.status === 'in review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {returnItem.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Tax: {returnItem.tax_name} | Price: {returnItem.price ? `$${returnItem.price}` : 'Not set'}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedReturnIds.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                {selectedReturnIds.length} return{selectedReturnIds.length !== 1 ? 's' : ''} selected for assignment
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={assignReturnsToUser}
              disabled={isAssigning || !selectedUserId || selectedReturnIds.length === 0 || returnsError}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Assign Returns
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAssignModal(false);
                setCustomerReturns([]);
                setReturnsError('');
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}