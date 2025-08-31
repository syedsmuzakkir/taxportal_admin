import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import { ArrowLeft, Download, FileText, Image, Calendar, User } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils.js';

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();
  const { documents, customers, taxReturns } = useData();
  const [document, setDocument] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [taxReturn, setTaxReturn] = useState(null);

  useEffect(() => {
    const doc = documents.find(d => d.id === id);
    if (!doc) {
      navigate('/customers');
      return;
    }

    const cust = customers.find(c => c.id === doc.customerId);
    const ret = taxReturns.find(r => r.id === doc.returnId);

    // Check permissions for client role
    if (user?.role === 'client' && cust?.ownerId !== user.id) {
      navigate('/not-authorized');
      return;
    }

    setDocument(doc);
    setCustomer(cust);
    setTaxReturn(ret);
  }, [id, documents, customers, taxReturns, user, navigate]);

  const handleDownload = () => {
    if (!can('action:document.download')) {
      alert('You do not have permission to download documents.');
      return;
    }

    // Simulate download
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
  };

  if (!document || !customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to={`/customers/${customer.id}`}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
          <p className="text-gray-600">Document Preview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Preview</h2>
              {can('action:document.download') ? (
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                  Download restricted
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {document.type === 'pdf' ? (
                <div className="bg-gray-50 p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Document</h3>
                  <p className="text-gray-600 mb-4">{document.name}</p>
                  {can('action:document.download') ? (
                    <button
                      onClick={handleDownload}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Click to download and view
                    </button>
                  ) : (
                    <p className="text-red-600">Download permission required to view PDF</p>
                  )}
                </div>
              ) : (
                <img
                  src={document.url}
                  alt={document.name}
                  className="w-full h-auto max-h-96 object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Document Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Document Name</p>
                  <p className="text-sm font-medium text-gray-900">{document.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                </div>
              </div>

              {taxReturn && (
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Return Type</p>
                    <p className="text-sm font-medium text-gray-900">{taxReturn.type}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Uploaded</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(document.uploadedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Related Links</h2>
            <div className="space-y-2">
              <Link
                to={`/customers/${customer.id}`}
                className="block text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                View Customer Profile
              </Link>
              {taxReturn && (
                <Link
                  to="/tax-returns"
                  className="block text-blue-600 hover:text-blue-700 transition-colors text-sm"
                >
                  View Tax Return
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}