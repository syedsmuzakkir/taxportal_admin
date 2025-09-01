import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { returnsAPI } from '../api/returns.js';
import { Filter, FileText, User, Clock, Edit, Eye, Plus } from 'lucide-react';
import { formatDate } from '../utils/dateUtils.js';
import Modal from '../components/Modal.jsx';

const statuses = [
  'All',
  'Initial Request',
  'Document Verified',
  'In Preparation',
  'In Review',
  'Ready to File',
  'Filed Return'
];

const statusColors = {
  'Initial Request': 'bg-gray-100 text-gray-800',
  'Document Verified': 'bg-blue-100 text-blue-800',
  'In Preparation': 'bg-yellow-100 text-yellow-800',
  'In Review': 'bg-orange-100 text-orange-800',
  'Ready to File': 'bg-purple-100 text-purple-800',
  'Filed Return': 'bg-green-100 text-green-800'
};

export default function TaxReturns() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { taxReturns: contextReturns, updateTaxReturns, users, customers, addActivity } = useData();
  const { addNotification } = useNotifications();
  const [taxReturns, setTaxReturns] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [newReturn, setNewReturn] = useState({
    name: '',
    customerId: '',
    type: 'Federal',
    status: 'Initial Request'
  });

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    if (statusParam && statuses.includes(statusParam)) {
      setSelectedStatus(statusParam);
    }
  }, [location.search]);

  useEffect(() => {
    loadReturns();
  }, [contextReturns]);

  const loadReturns = async () => {
    try {
      setIsLoading(true);
      const returns = await returnsAPI.getAll();
      
      // Filter returns based on permissions
      const filteredReturns = returns.filter(returnItem => {
        // Admins and reviewers can see all returns
        if (can('view:all_returns')) {
          return true;
        }
        
        // Users can see returns they created or are assigned to
        if (can('view:assigned_returns')) {
          return returnItem.createdBy === user.id || returnItem.assignedTo === user.id;
        }
        
        // Clients can only see their own returns
        if (can('view:own_returns')) {
          return returnItem.customerId === user.customerId;
        }
        
        return false;
      });
      
      setTaxReturns(filteredReturns);
    } catch (error) {
      console.error('Error loading tax returns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (returnId, newStatus, returnData) => {
    if (!can('update_status:return')) return;

    try {
      setUpdatingStatus({ ...updatingStatus, [returnId]: true });
      
      const reviewerId = user.role === 'reviewer' ? user.id : null;
      const updatedReturn = await returnsAPI.updateStatus(returnId, newStatus, reviewerId);
      
      const updatedReturns = taxReturns.map(r => 
        r.id === returnId ? updatedReturn : r
      );
      setTaxReturns(updatedReturns);
      updateTaxReturns(updatedReturns);

      // Add activity
      addActivity({
        user: user.name,
        action: `Changed status to ${newStatus} for ${returnData.customerName}`,
        entityType: 'return',
        entityId: returnId
      });

      // Add notification
      await addNotification({
        title: 'Return Status Updated',
        body: `${returnData.customerName}'s return has been moved to ${newStatus}`,
        level: 'info',
        relatedEntity: { type: 'return', id: returnId }
      });

    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus({ ...updatingStatus, [returnId]: false });
    }
  };

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    
    if (!can('create:return')) return;
    
    try {
      const customer = customers.find(c => c.id === newReturn.customerId);
      const returnData = {
        ...newReturn,
        id: Date.now().toString(),
        customerName: customer?.name || '',
        assignedReviewer: null,
        reviewerId: null,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedReturns = [...taxReturns, returnData];
      setTaxReturns(updatedReturns);
      updateTaxReturns(updatedReturns);

      // Add activity
      addActivity({
        user: user.name,
        action: `Created new ${returnData.type} return for ${customer?.name}`,
        entityType: 'return',
        entityId: returnData.id
      });

      await addNotification({
        title: 'New Tax Return Created',
        body: `${returnData.type} return created for ${customer?.name}`,
        level: 'success',
        relatedEntity: { type: 'return', id: returnData.id }
      });

      setNewReturn({
        name: '',
        customerId: '',
        type: 'Federal',
        status: 'Initial Request'
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating return:', error);
    }
  };

  const handleViewReturn = (taxReturn) => {
    setSelectedReturn(taxReturn);
    setShowDetailModal(true);
  };

  const filteredReturns = selectedStatus === 'All' 
    ? taxReturns 
    : taxReturns.filter(r => r.status === selectedStatus);

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
        <h1 className="text-2xl font-bold text-gray-900">Tax Returns</h1>
        {can('create:return') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Return
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredReturns.length} of {taxReturns.length} returns
          </span>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.map((taxReturn) => (
                <tr key={taxReturn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{taxReturn.name}</div>
                        <div className="text-sm text-gray-500">{taxReturn.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{taxReturn.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {can('update_status:return') ? (
                      <select
                        value={taxReturn.status}
                        onChange={(e) => handleStatusChange(taxReturn.id, e.target.value, taxReturn)}
                        disabled={updatingStatus[taxReturn.id]}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${statusColors[taxReturn.status]} ${
                          updatingStatus[taxReturn.id] ? 'opacity-50' : 'cursor-pointer'
                        }`}
                      >
                        {statuses.slice(1).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[taxReturn.status]}`}>
                        {taxReturn.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {taxReturn.assignedReviewer ? (
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{taxReturn.assignedReviewer}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{formatDate(taxReturn.updatedAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewReturn(taxReturn)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {can('edit:return') && (
                        <button 
                          className="text-gray-600 hover:text-gray-700 transition-colors"
                          title="Edit Return"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus !== 'All' && (
                <div className="text-sm text-gray-600">
                  Filtered by: <span className="font-medium">{selectedStatus}</span>
                </div>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Create Return Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Tax Return"
      >
        <form onSubmit={handleCreateReturn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Name</label>
            <input
              type="text"
              required
              value={newReturn.name}
              onChange={(e) => setNewReturn({ ...newReturn, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2024 Federal Return"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <select
              required
              value={newReturn.customerId}
              onChange={(e) => setNewReturn({ ...newReturn, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={newReturn.type}
              onChange={(e) => setNewReturn({ ...newReturn, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Federal">Federal</option>
              <option value="State">State</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Amendment">Amendment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
            <select
              value={newReturn.status}
              onChange={(e) => setNewReturn({ ...newReturn, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.slice(1).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Return
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

      {/* Return Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedReturn ? `${selectedReturn.name} - Details` : 'Return Details'}
        size="lg"
      >
        {selectedReturn && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Return Name</label>
                <p className="text-sm text-gray-900 mt-1">{selectedReturn.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="text-sm text-gray-900 mt-1">{selectedReturn.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900 mt-1">{selectedReturn.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${statusColors[selectedReturn.status]}`}>
                  {selectedReturn.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Reviewer</label>
                <p className="text-sm text-gray-900 mt-1">{selectedReturn.assignedReviewer || 'Unassigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(selectedReturn.updatedAt)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <Link
                to={`/customers/${selectedReturn.customerId}`}
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                View Customer Profile →
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}











// import React, { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useData } from '../contexts/DataContext.jsx';
// import { useAuth } from '../contexts/AuthContext.jsx';
// import { usePermissions } from '../contexts/PermissionsContext.jsx';
// import { useNotifications } from '../contexts/NotificationsContext.jsx';
// import { returnsAPI } from '../api/returns.js';
// import { Filter, FileText, User, Clock, Edit, Eye, Plus } from 'lucide-react';
// import { formatDate } from '../utils/dateUtils.js';
// import Modal from '../components/Modal.jsx';

// const statuses = [
//   'All',
//   'Initial Request',
//   'Document Verified',
//   'In Preparation',
//   'In Review',
//   'Ready to File',
//   'Filed Return'
// ];

// const statusColors = {
//   'Initial Request': 'bg-gray-100 text-gray-800',
//   'Document Verified': 'bg-blue-100 text-blue-800',
//   'In Preparation': 'bg-yellow-100 text-yellow-800',
//   'In Review': 'bg-orange-100 text-orange-800',
//   'Ready to File': 'bg-purple-100 text-purple-800',
//   'Filed Return': 'bg-green-100 text-green-800'
// };

// export default function TaxReturns() {
//   const { user } = useAuth();
//   const { can } = usePermissions();
//   const { taxReturns: contextReturns, updateTaxReturns, users, customers, addActivity } = useData();
//   const { addNotification } = useNotifications();
//   const location = useLocation();
//   const [taxReturns, setTaxReturns] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState('All');
//   const [isLoading, setIsLoading] = useState(true);
//   const [updatingStatus, setUpdatingStatus] = useState({});
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [selectedReturn, setSelectedReturn] = useState(null);
//   const [newReturn, setNewReturn] = useState({
//     name: '',
//     customerId: '',
//     type: 'Federal',
//     status: 'Initial Request'
//   });

//   useEffect(() => {
//     loadReturns();
//   }, [contextReturns]);

//   // Read status from URL parameters
//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const statusParam = queryParams.get('status');
//     if (statusParam && statuses.includes(statusParam)) {
//       setSelectedStatus(statusParam);
//     }
//   }, [location.search]);

//   const loadReturns = async () => {
//     try {
//       setIsLoading(true);
//       const returns = await returnsAPI.getAll();
      
//       // Filter returns based on user permissions
//       const filteredReturns = returns.filter(returnItem => {
//         // Admins and reviewers can see all returns
//         if (user.role === 'admin' || user.role === 'reviewer') {
//           return true;
//         }
        
//         // Users can see returns they created or are assigned to
//         if (user.role === 'user') {
//           return returnItem.createdBy === user.id || returnItem.assignedTo === user.id;
//         }
        
//         // Clients can only see their own returns
//         if (user.role === 'client') {
//           return returnItem.customerId === user.customerId;
//         }
        
//         return false;
//       });
      
//       setTaxReturns(filteredReturns);
//     } catch (error) {
//       console.error('Error loading tax returns:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStatusChange = async (returnId, newStatus, returnData) => {
//     if (!can('action:return.update_status')) return;

//     try {
//       setUpdatingStatus({ ...updatingStatus, [returnId]: true });
      
//       const reviewerId = user.role === 'reviewer' ? user.id : null;
//       const updatedReturn = await returnsAPI.updateStatus(returnId, newStatus, reviewerId);
      
//       const updatedReturns = taxReturns.map(r => 
//         r.id === returnId ? updatedReturn : r
//       );
//       setTaxReturns(updatedReturns);
//       updateTaxReturns(updatedReturns);

//       // Add activity
//       addActivity({
//         user: user.name,
//         action: `Changed status to ${newStatus} for ${returnData.customerName}`,
//         entityType: 'return',
//         entityId: returnId
//       });

//       // Add notification
//       await addNotification({
//         title: 'Return Status Updated',
//         body: `${returnData.customerName}'s return has been moved to ${newStatus}`,
//         level: 'info',
//         relatedEntity: { type: 'return', id: returnId }
//       });

//     } catch (error) {
//       console.error('Error updating status:', error);
//     } finally {
//       setUpdatingStatus({ ...updatingStatus, [returnId]: false });
//     }
//   };

//   const handleCreateReturn = async (e) => {
//     e.preventDefault();
    
//     try {
//       const customer = customers.find(c => c.id === newReturn.customerId);
//       const returnData = {
//         ...newReturn,
//         id: Date.now().toString(),
//         customerName: customer?.name || '',
//         assignedReviewer: null,
//         reviewerId: null,
//         createdBy: user.id,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//       };

//       const updatedReturns = [...taxReturns, returnData];
//       setTaxReturns(updatedReturns);
//       updateTaxReturns(updatedReturns);

//       // Add activity
//       addActivity({
//         user: user.name,
//         action: `Created new ${returnData.type} return for ${customer?.name}`,
//         entityType: 'return',
//         entityId: returnData.id
//       });

//       await addNotification({
//         title: 'New Tax Return Created',
//         body: `${returnData.type} return created for ${customer?.name}`,
//         level: 'success',
//         relatedEntity: { type: 'return', id: returnData.id }
//       });

//       setNewReturn({
//         name: '',
//         customerId: '',
//         type: 'Federal',
//         status: 'Initial Request'
//       });
//       setShowCreateModal(false);
//     } catch (error) {
//       console.error('Error creating return:', error);
//     }
//   };

//   const handleViewReturn = (taxReturn) => {
//     setSelectedReturn(taxReturn);
//     setShowDetailModal(true);
//   };

//   const filteredReturns = selectedStatus === 'All' 
//     ? taxReturns 
//     : taxReturns.filter(r => r.status === selectedStatus);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-900">Tax Returns</h1>
//         {selectedStatus !== 'All' && (
//           <div className="text-sm text-gray-600">
//             Filtered by: <span className="font-medium">{selectedStatus}</span>
//           </div>
//         )}
//         {can('action:return.edit') && (
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Create Return
//           </button>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="flex items-center space-x-4">
//           <Filter className="w-5 h-5 text-gray-400" />
//           <select
//             value={selectedStatus}
//             onChange={(e) => setSelectedStatus(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             {statuses.map(status => (
//               <option key={status} value={status}>{status}</option>
//             ))}
//           </select>
//           <span className="text-sm text-gray-600">
//             Showing {filteredReturns.length} of {taxReturns.length} returns
//           </span>
//         </div>
//       </div>

//       {/* Returns Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Return Details
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Customer
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Assigned Reviewer
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Updated
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredReturns.map((taxReturn) => (
//                 <tr key={taxReturn.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <FileText className="w-5 h-5 text-gray-400 mr-3" />
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{taxReturn.name}</div>
//                         <div className="text-sm text-gray-500">{taxReturn.type}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{taxReturn.customerName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {can('action:return.update_status') ? (
//                       <select
//                         value={taxReturn.status}
//                         onChange={(e) => handleStatusChange(taxReturn.id, e.target.value, taxReturn)}
//                         disabled={updatingStatus[taxReturn.id]}
//                         className={`text-xs px-2 py-1 rounded-full border-0 ${statusColors[taxReturn.status]} ${
//                           updatingStatus[taxReturn.id] ? 'opacity-50' : 'cursor-pointer'
//                         }`}
//                       >
//                         {statuses.slice(1).map(status => (
//                           <option key={status} value={status}>{status}</option>
//                         ))}
//                       </select>
//                     ) : (
//                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[taxReturn.status]}`}>
//                         {taxReturn.status}
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {taxReturn.assignedReviewer ? (
//                       <div className="flex items-center">
//                         <User className="w-4 h-4 text-gray-400 mr-2" />
//                         <span className="text-sm text-gray-900">{taxReturn.assignedReviewer}</span>
//                       </div>
//                     ) : (
//                       <span className="text-sm text-gray-500">Unassigned</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <Clock className="w-4 h-4 text-gray-400 mr-2" />
//                       <span className="text-sm text-gray-900">{formatDate(taxReturn.updatedAt)}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     <div className="flex items-center space-x-2">
//                       <button 
//                         onClick={() => handleViewReturn(taxReturn)}
//                         className="text-blue-600 hover:text-blue-700 transition-colors"
//                         title="View Details"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>
//                       {can('action:return.edit') && (
//                         <button 
//                           className="text-gray-600 hover:text-gray-700 transition-colors"
//                           title="Edit Return"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
        
//         {filteredReturns.length === 0 && (
//           <div className="text-center py-12">
//             <FileText className="mx-auto h-12 w-12 text-gray-400" />
//             <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               {selectedStatus === 'All' 
//                 ? 'No tax returns available.' 
//                 : `No returns with status "${selectedStatus}".`
//               }
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Create Return Modal */}
//       <Modal
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         title="Create New Tax Return"
//       >
//         <form onSubmit={handleCreateReturn} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Return Name</label>
//             <input
//               type="text"
//               required
//               value={newReturn.name}
//               onChange={(e) => setNewReturn({ ...newReturn, name: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="e.g., 2024 Federal Return"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
//             <select
//               required
//               value={newReturn.customerId}
//               onChange={(e) => setNewReturn({ ...newReturn, customerId: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select Customer</option>
//               {customers.map(customer => (
//                 <option key={customer.id} value={customer.id}>{customer.name}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
//             <select
//               value={newReturn.type}
//               onChange={(e) => setNewReturn({ ...newReturn, type: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="Federal">Federal</option>
//               <option value="State">State</option>
//               <option value="Quarterly">Quarterly</option>
//               <option value="Amendment">Amendment</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
//             <select
//               value={newReturn.status}
//               onChange={(e) => setNewReturn({ ...newReturn, status: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               {statuses.slice(1).map(status => (
//                 <option key={status} value={status}>{status}</option>
//               ))}
//             </select>
//           </div>
//           <div className="flex space-x-3 pt-4">
//             <button
//               type="submit"
//               className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
//             >
//               Create Return
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowCreateModal(false)}
//               className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </Modal>

//       {/* Return Detail Modal */}
//       <Modal
//         isOpen={showDetailModal}
//         onClose={() => setShowDetailModal(false)}
//         title={selectedReturn ? `${selectedReturn.name} - Details` : 'Return Details'}
//         size="lg"
//       >
//         {selectedReturn && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Return Name</label>
//                 <p className="text-sm text-gray-900 mt-1">{selectedReturn.name}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Customer</label>
//                 <p className="text-sm text-gray-900 mt-1">{selectedReturn.customerName}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Type</label>
//                 <p className="text-sm text-gray-900 mt-1">{selectedReturn.type}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Status</label>
//                 <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${statusColors[selectedReturn.status]}`}>
//                   {selectedReturn.status}
//                 </span>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Assigned Reviewer</label>
//                 <p className="text-sm text-gray-900 mt-1">{selectedReturn.assignedReviewer || 'Unassigned'}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Last Updated</label>
//                 <p className="text-sm text-gray-900 mt-1">{formatDate(selectedReturn.updatedAt)}</p>
//               </div>
//             </div>

//             <div className="border-t pt-4">
//               <Link
//                 to={`/customers/${selectedReturn.customerId}`}
//                 className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
//               >
//                 View Customer Profile →
//               </Link>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }