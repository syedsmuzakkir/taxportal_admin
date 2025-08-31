import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionsContext.jsx';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { paymentsAPI } from '../api/payments.js';
import { CreditCard, Filter, RotateCcw, Calendar } from 'lucide-react';
import { formatDate } from '../utils/dateUtils.js';

export default function Payments() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { payments: contextPayments, updatePayments, addActivity } = useData();
  const { addNotification } = useNotifications();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'All',
    customer: 'All',
    dateRange: 'All'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingRefund, setProcessingRefund] = useState({});

  useEffect(() => {
    loadPayments();
  }, [contextPayments]);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const paymentsList = await paymentsAPI.getAll();
      setPayments(paymentsList);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    if (filters.status !== 'All') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.customer !== 'All') {
      filtered = filtered.filter(p => p.customerName === filters.customer);
    }

    if (filters.dateRange !== 'All') {
      const now = new Date();
      const days = parseInt(filters.dateRange);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(p => new Date(p.createdAt) >= cutoff);
    }

    setFilteredPayments(filtered);
  };

  const handleRefund = async (paymentId, payment) => {
    if (!can('action:payment.refund')) {
      alert('You do not have permission to process refunds.');
      return;
    }

    if (!window.confirm(`Are you sure you want to refund $${payment.amount.toFixed(2)} to ${payment.customerName}?`)) {
      return;
    }

    try {
      setProcessingRefund({ ...processingRefund, [paymentId]: true });
      
      const refundedPayment = await paymentsAPI.refund(paymentId);
      const updatedPayments = payments.map(p => 
        p.id === paymentId ? refundedPayment : p
      );
      
      setPayments(updatedPayments);
      updatePayments(updatedPayments);

      // Add activity
      addActivity({
        user: user.name,
        action: `Processed refund for ${payment.customerName} - $${payment.amount.toFixed(2)}`,
        entityType: 'payment',
        entityId: paymentId
      });

      // Add notification
      await addNotification({
        title: 'Payment Refunded',
        body: `$${payment.amount.toFixed(2)} refunded to ${payment.customerName}`,
        level: 'warning',
        relatedEntity: { type: 'payment', id: paymentId }
      });

    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setProcessingRefund({ ...processingRefund, [paymentId]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Refunded': return 'bg-red-100 text-red-800';
      case 'Failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotals = () => {
    const total = filteredPayments.reduce((sum, p) => sum + (p.status === 'Refunded' ? 0 : p.amount), 0);
    const refunded = filteredPayments.filter(p => p.status === 'Refunded').reduce((sum, p) => sum + p.amount, 0);
    return { total, refunded, count: filteredPayments.length };
  };

  const totals = calculateTotals();
  const uniqueCustomers = [...new Set(payments.map(p => p.customerName))];

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
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-gray-900">${totals.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <RotateCcw className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-gray-900">${totals.refunded.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{totals.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={filters.customer}
            onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Customers</option>
            {uniqueCustomers.map(customer => (
              <option key={customer} value={customer}>{customer}</option>
            ))}
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{payment.transactionId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {can('action:payment.refund') && payment.status === 'Completed' && (
                      <button
                        onClick={() => handleRefund(payment.id, payment)}
                        disabled={processingRefund[payment.id]}
                        className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className={`w-4 h-4 ${processingRefund[payment.id] ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No payments match the current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}