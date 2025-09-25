import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { customersAPI } from '../api/customers.js';
import { Search, Plus, Edit, Trash2, FileText, Eye, Users, Check, X, Phone, Mail, Building, User, UserCheck, UserX, ClipboardList } from 'lucide-react';
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
    setCustomerReturns([]);
    setReturnsError('');
    
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
      setReturnsError('');
      const response = await fetch(`${BASE_URL}/api/tax-returns/${customerId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch returns: ${response.status}`);
      }
      
      const data = await response.json();
      
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

      setShowAssignModal(false);
      setSelectedUserId('');
      setSelectedReturnIds([]);
      setCustomerReturns([]);
      setReturnsError('');
      
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
        phone: newCustomer.phone,
      };

      const response = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${userToken}`},
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      addNotification({
        title: 'Status',
        body: `Registered Successfully`,
        level: 'success'
      });

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
        phone: "",
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
      case 'Active': 
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Inactive': 
        return 'bg-red-100 text-red-700 border-red-200';
      default: 
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Active' ? <UserCheck className="w-4 h-4 mr-1" /> : <UserX className="w-4 h-4 mr-1" />;
  };

  const getRoleIcon = (role) => {
    return role === 'business' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const getRoleColor = (role) => {
    return role === 'business' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">Loading Customers</h3>
            <p className="text-slate-600">Fetching your customer data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Customer Management
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Manage your customer relationships and assignments
            </p>
          </div>
          
          {can('action:customer.create') && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <Plus className="w-5 h-5" />
                <span>Add Customer</span>
              </div>
            </button>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-lg font-semibold text-slate-900">
                {filteredCustomers.length} Customer{filteredCustomers.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 font-medium text-slate-700 w-full md:w-96"
              />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Returns
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Assignment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomers.map((customer, index) => (
                  <tr 
                    key={customer.id} 
                    className={`hover:bg-slate-50/80 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-3 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-600">{customer.email}</span>
                          </div>
                          {customer.mobile && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-600">{customer.mobile}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 py-5">
                      <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl border-2 ${getRoleColor(customer.role)}`}>
                        {getRoleIcon(customer.role)}
                        <span className="ml-2 capitalize">{customer.role}</span>
                      </span>
                    </td>
                    
                    <td className="px-3 py-5">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-900">{customer.documentsCount}</span>
                      </div>
                    </td>
                    
                    <td className="px-3 py-5">
                      <div className="flex items-center space-x-2">
                        <ClipboardList className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-slate-900">{customer.returnsCount}</span>
                      </div>
                    </td>
                    
                    <td className="px-3 py-5">
                      {can("update") ? (
                        <select
                          value={customer.status}
                          onChange={(e) => handleStatusChange(customer.id, e.target.value, customer.name, customer.role)}
                          disabled={editingStatus[customer.id]}
                          className={`inline-flex items-center text-sm px-3 py-2 rounded-xl border-2 font-medium cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(customer.status)} ${
                            editingStatus[customer.id] ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl border-2 ${getStatusColor(customer.status)}`}>
                          {getStatusIcon(customer.status)}
                          {customer.status}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-3 py-5">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-200 hover:shadow-md border-2 border-blue-200 hover:border-blue-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </td>
                    
                    <td className="px-3 py-5">
                      <button 
                        onClick={() => handleAssignReturns(customer.id, customer.name)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 rounded-xl transition-all duration-200 hover:shadow-md border-2 border-purple-200 hover:border-purple-300"
                      >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Assign Returns
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                  <Users className="w-12 h-12 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">No customers found</h3>
                  <p className="text-slate-600">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new customer.'}
                  </p>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Customer Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Customer"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl">
            <form onSubmit={handleCreateCustomer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={newCustomer.password}
                    onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                    placeholder="Enter secure password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Type</label>
                <select
                  value={newCustomer.role}
                  onChange={(e) => setNewCustomer({ ...newCustomer, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                >
                  <option value="individual">Individual Customer</option>
                  <option value="business">Business Customer</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg"
                >
                  Create Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-300 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-400 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select User to Assign Returns
              </label>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
                </div>
              ) : (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all duration-200"
                >
                  <option value="">Choose a user to assign returns to...</option>
                  {allUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role}) - {user.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Returns Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Select Returns to Assign
                </label>
                {customerReturns.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllReturns}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                  >
                    {selectedReturnIds.length === customerReturns.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
              
              {isLoadingReturns ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="text-sm text-slate-600">Loading returns...</p>
                  </div>
                </div>
              ) : returnsError ? (
                <div className="text-center py-8 bg-red-50 rounded-xl border border-red-200">
                  <FileText className="mx-auto h-12 w-12 text-red-400 mb-3" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Returns</h3>
                  <p className="text-red-600">{returnsError}</p>
                </div>
              ) : customerReturns.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Returns Found</h3>
                  <p className="text-slate-600">No returns found for this customer</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {customerReturns.map(returnItem => (
                    <div key={returnItem.id} className="flex items-center p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                      <input
                        type="checkbox"
                        id={`return-${returnItem.id}`}
                        checked={selectedReturnIds.includes(returnItem.id)}
                        onChange={() => handleReturnSelection(returnItem.id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-slate-300 rounded cursor-pointer"
                      />
                      <label htmlFor={`return-${returnItem.id}`} className="ml-4 flex-1 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-semibold text-slate-900">{returnItem.return_type}</span>
                            <div className="text-sm text-slate-600 mt-1">
                              Tax: {returnItem.tax_name} | Price: {returnItem.price ? `${returnItem.price}` : 'Not set'}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ml-3 ${
                            returnItem.status === 'filed return' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            returnItem.status === 'in review' 
                              ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                            {returnItem.status}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedReturnIds.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-700">
                    {selectedReturnIds.length} return{selectedReturnIds.length !== 1 ? 's' : ''} selected for assignment
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={assignReturnsToUser}
                disabled={isAssigning || !selectedUserId || selectedReturnIds.length === 0 || returnsError}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Assigning Returns...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Assign Selected Returns
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
                className="flex-1 bg-slate-300 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-400 transition-all duration-200"
              >
                <X className="w-5 h-5 mr-2 inline" />
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}