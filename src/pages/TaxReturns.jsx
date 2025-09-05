import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { Filter, FileText, User, Clock, Edit, Eye, Plus } from 'lucide-react';
import { formatDate } from '../utils/dateUtils.js';
import Modal from '../components/Modal.jsx';
import { BASE_URL } from '../api/BaseUrl.js';

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
  const { addNotification } = useNotifications();
  const location = useLocation();

  const [taxReturns, setTaxReturns] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    if (statusParam && statuses.includes(statusParam)) {
      setSelectedStatus(statusParam);
    }
  }, [location.search]);

  useEffect(() => {
    fetchAllReturns();
  }, []);

  const fetchAllReturns = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/api/get-all-returns`);
      const result = await res.json();

      // ✅ set only the array of returns
      setTaxReturns(result.data || []);
      console.log("Fetched Returns:", result.data);
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginId = localStorage.getItem("loginId");
  const role = localStorage.getItem("role");

  // const handleUpdateStatus = async (newStatus) => {
  //   if (!selectedReturn) return;

  //   try {
  //     setUpdating(true);
  //     const res = await fetch(
  //       `https://2aa85db8069364de8ca5fae1fd182421.serveo.net/api/update-status/${selectedReturn.id}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           newStatus,
  //           createdby_type: role,
  //           createdby_id: loginId
  //         })
  //       }
  //     );

  //     // if (!res.ok) throw new Error("Failed to update status");

  //     addNotification("Status updated successfully", "success");

  //     // ✅ refresh list
  //     fetchAllReturns();
  //     setShowDetailModal(false);
  //   } catch (err) {
  //     console.error("Update error:", err);
  //     addNotification("Failed to update status", "error");
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

const handleUpdateStatus = async (id, newStatus) => {
  try {
    console.log("Updating status:", id, newStatus); // ✅ debug log

    const res = await fetch(
      `${BASE_URL}/api/update-status/${id}`, // use same backend domain
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus,
          createdby_type: role,
          createdby_id: loginId,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed: ${res.status} - ${text}`);
    }

    addNotification("Status updated successfully", "success");
    fetchAllReturns(); // refresh after update
  } catch (err) {
    console.error("Update error:", err);
    addNotification("Failed to update status", "error");
  }
};


  const handleViewReturn = (taxReturn) => {
    setSelectedReturn(taxReturn);
    setShowDetailModal(true);
  };

  // ✅ filter based on selected status
  const filteredReturns =
    selectedStatus === 'All'
      ? taxReturns
      : taxReturns.filter((r) => r.status === selectedStatus);

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
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
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
                        <div className="text-sm font-medium text-gray-900">
                          {taxReturn.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {taxReturn.return_type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{taxReturn.email}</div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[taxReturn.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {taxReturn.status}
                    </span>
                    
                    
                  </td> */}
           <select
  value={taxReturn.status}
  onChange={(e) => handleUpdateStatus(taxReturn.id, e.target.value)}
  className={`text-xs px-2 py-1 rounded-full border-0 ${
    statusColors[taxReturn.status] || 'bg-gray-100 text-gray-800'
  }`}
>
  {statuses.slice(1).map((status) => ( // exclude "All"
    <option key={status} value={status}>
      {status}
    </option>
  ))}
</select>




                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(taxReturn.modified_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* <button
                      onClick={() => handleViewReturn(taxReturn)}
                      className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                    > */}
                    <Link
                to={`/customers/${taxReturn.id}`}
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                      </Link>
                    {/* </button> */}
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

      {/* Return Detail Modal */}
      {/* <Modal
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
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900 mt-1">{selectedReturn.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900 mt-1">{selectedReturn.return_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    statusColors[selectedReturn.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedReturn.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedReturn.created_at).toLocaleString()}
                </p>
              </div>
              <div className="border-t pt-4">
              <Link
                to={`/customers/${selectedReturn.id}`}
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                View Customer Profile →
              </Link>
            </div>
            </div>
          </div>
        )}
      </Modal> */}
    </div>
  );
}





