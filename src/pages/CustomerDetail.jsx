import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { customersAPI } from '../api/customers.js';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  FileText, 
  DollarSign, 
  MessageSquare,
  Plus,
  Download,
  Eye,
  Clock,
  Calendar
} from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/dateUtils.js';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();
  const { addNotification } = useNotifications();
  const { taxReturns, documents, comments, addComment, addActivity } = useData();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pricingMode, setPricingMode] = useState('hourly');
  const [hourlyRate, setHourlyRate] = useState(150);
  const [lumpSum, setLumpSum] = useState(500);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setIsLoading(true);
      const customerData = await customersAPI.getById(id);
      
      // Check if user has permission to view this customer
      if (user?.role === 'client' && customerData.ownerId !== user.id) {
        navigate('/not-authorized');
        return;
      }
      
      setCustomer(customerData);
    } catch (error) {
      console.error('Error loading customer:', error);
      navigate('/customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsAddingComment(true);
      const comment = addComment(id, newComment, user.id, user.name);
      
      // Add activity
      addActivity({
        user: user.name,
        action: `Added comment to ${customer.name} account`,
        entityType: 'customer',
        entityId: id
      });

      // Add notification
      await addNotification({
        title: 'Comment Added',
        body: `New comment added to ${customer.name} account`,
        level: 'info',
        relatedEntity: { type: 'customer', id }
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const customerReturns = taxReturns.filter(r => r.customerId === id);
  const customerDocuments = documents.filter(d => d.customerId === id);
  const customerComments = comments.filter(c => c.customerId === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">Customer not found</h2>
        <Link to="/customers" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/customers"
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600">Customer Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="text-sm font-medium text-gray-900">{customer.mobile}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">SSN</p>
                  <p className="text-sm font-medium text-gray-900">{customer.ssn}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Returns */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tax Returns</h2>
            {customerReturns.length === 0 ? (
              <p className="text-gray-500">No tax returns found.</p>
            ) : (
              <div className="space-y-3">
                {customerReturns.map((taxReturn) => (
                  <Link
                    key={taxReturn.id}
                    to="/tax-returns"
                    className="block p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{taxReturn.name}</h3>
                        <p className="text-xs text-gray-500">{taxReturn.type}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          taxReturn.status === 'Filed Return' ? 'bg-green-100 text-green-800' :
                          taxReturn.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {taxReturn.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated {formatDate(taxReturn.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
            {customerDocuments.length === 0 ? (
              <p className="text-gray-500">No documents uploaded.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerDocuments.map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/documents/${document.id}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {can('action:document.download') && (
                          <button className="text-gray-600 hover:text-gray-700 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Uploaded {formatDate(document.uploadedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {can('action:customer.edit') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setPricingMode('hourly')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      pricingMode === 'hourly' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Hourly
                  </button>
                  <button
                    onClick={() => setPricingMode('lump')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      pricingMode === 'lump' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Lump Sum
                  </button>
                </div>
                
                {pricingMode === 'hourly' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lump Sum ($)
                    </label>
                    <input
                      type="number"
                      value={lumpSum}
                      onChange={(e) => setLumpSum(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Save Pricing
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
            
            {can('action:comment.add') && (
              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={isAddingComment || !newComment.trim()}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isAddingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </form>
            )}
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {customerComments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              ) : (
                customerComments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(customer.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(customer.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}