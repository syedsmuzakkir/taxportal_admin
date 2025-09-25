import React, { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePermissions } from "../contexts/PermissionsContext.jsx";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import { paymentsAPI } from "../api/payments.js";
import { CreditCard, Filter, RotateCcw, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { formatDate } from "../utils/dateUtils.js";
import { BASE_URL } from "../api/BaseUrl.js";

export default function Payments() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { payments: contextPayments, updatePayments, addActivity } = useData();
  const { addNotification } = useNotifications();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: "All",
    customer: "All",
    dateRange: "All",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingRefund, setProcessingRefund] = useState({});
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/getAllPayments`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
      }
      );
      const apiPayments = await response.json();

      const transformedPayments = apiPayments.map((payment) => ({
        id: payment.id,
        invoiceId: payment.invoice_id,
        amount: parseFloat(payment.paid_amount),
        status:
          payment.payment_status === "paid"
            ? "Completed"
            : payment.payment_status === "refunded"
            ? "Refunded"
            : payment.payment_status === "failed"
            ? "Failed"
            : "Pending",
        customerName:
          payment.payment_payload?.notes?.customer_name || "Unknown Customer",
        method: payment.transaction_type,
        transactionId: payment.transaction_id,
        createdAt: payment.created_at,
        currency: payment.payment_payload?.currency || "USD",
        originalData: payment,
      }));

      setPayments(transformedPayments);
      if (updatePayments) {
        updatePayments(transformedPayments);
      }
    } catch (error) {
      addNotification({
        title: "Error Loading Payments",
        body: "Failed to fetch payment data from the server.",
        level: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    if (filters.status !== "All") {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.customer !== "All") {
      filtered = filtered.filter((p) => p.customerName === filters.customer);
    }

    if (filters.dateRange !== "All") {
      const now = new Date();
      const days = parseInt(filters.dateRange);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((p) => new Date(p.createdAt) >= cutoff);
    }

    setFilteredPayments(filtered);
  };

  const handleRefund = async (paymentId, payment) => {
    if (!can("action:payment.refund")) {
      alert("You do not have permission to process refunds.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to refund $${payment.amount.toFixed(2)} to ${
          payment.customerName
        }?`
      )
    ) {
      return;
    }

    try {
      setProcessingRefund({ ...processingRefund, [paymentId]: true });

      const updatedPayments = payments.map((p) =>
        p.id === paymentId ? { ...p, status: "Refunded" } : p
      );

      setPayments(updatedPayments);
      if (updatePayments) {
        updatePayments(updatedPayments);
      }

      if (addActivity) {
        addActivity({
          user: user.name,
          action: `Processed refund for ${
            payment.customerName
          } - $${payment.amount.toFixed(2)}`,
          entityType: "payment",
          entityId: paymentId,
        });
      }

      if (addNotification) {
        await addNotification({
          title: "Payment Refunded",
          body: `$${payment.amount.toFixed(2)} refunded to ${
            payment.customerName
          }`,
          level: "warning",
          relatedEntity: { type: "payment", id: paymentId },
        });
      }
    } catch (error) {
      // console.error("Error processing refund:", error);
    } finally {
      setProcessingRefund({ ...processingRefund, [paymentId]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Refunded":
        return "bg-red-100 text-red-700 border-red-200";
      case "Failed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "Pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "Refunded":
        return <RotateCcw className="w-4 h-4 mr-1" />;
      case "Failed":
        return <AlertCircle className="w-4 h-4 mr-1" />;
      default:
        return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  const calculateTotals = () => {
    const total = filteredPayments.reduce(
      (sum, p) => sum + (p.status === "Refunded" ? 0 : p.amount),
      0
    );
    const refunded = filteredPayments
      .filter((p) => p.status === "Refunded")
      .reduce((sum, p) => sum + p.amount, 0);
    const completed = filteredPayments
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = filteredPayments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + p.amount, 0);
    return { total, refunded, completed, pending, count: filteredPayments.length };
  };

  const totals = calculateTotals();
  const uniqueCustomers = [...new Set(payments.map((p) => p.customerName))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">Loading Payments</h3>
            <p className="text-slate-600">Fetching your payment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-8xl mx-auto space-y-5">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Payment Management
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Monitor and manage all payment transactions
            </p>
          </div>
          
          <button
            onClick={loadPayments}
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-3">
              <RotateCcw className="w-5 h-5" />
              <span>Refresh Data</span>
            </div>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Total Net Revenue */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Net Revenue
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  ${totals.total.toFixed(2)}
                </p>
                <p className="text-sm text-emerald-600 font-medium mt-1">
                  After refunds
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Completed Payments */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Completed
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  ${totals.completed.toFixed(2)}
                </p>
                <p className="text-sm text-blue-600 font-medium mt-1">
                  Successfully processed
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Pending
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  ${totals.pending.toFixed(2)}
                </p>
                <p className="text-sm text-amber-600 font-medium mt-1">
                  Awaiting processing
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Refunded Amount */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Refunded
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  ${totals.refunded.toFixed(2)}
                </p>
                <p className="text-sm text-red-600 font-medium mt-1">
                  Total refunds issued
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  Transactions
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {totals.count}
                </p>
                <p className="text-sm text-purple-600 font-medium mt-1">
                  Total processed
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <Filter className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-lg font-semibold text-slate-900">
                Filter Payments
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 font-medium text-slate-700"
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
                className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 font-medium text-slate-700"
              >
                <option value="All">All Customers</option>
                {uniqueCustomers.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 font-medium text-slate-700"
              >
                <option value="All">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Transaction Details
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className={`hover:bg-slate-50/80 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 font-mono">
                            {payment.transactionId}
                          </div>
                          <div className="text-xs text-slate-500">
                            Invoice: {payment.invoiceId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-900">
                        {payment.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-900">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-700 capitalize">
                        {payment.method}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl border-2 ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                  <CreditCard className="w-12 h-12 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">No payments found</h3>
                  <p className="text-slate-600">
                    No payments match the current filters. Try adjusting your search criteria.
                  </p>
                </div>
                <button
                  onClick={() => setFilters({ status: "All", customer: "All", dateRange: "All" })}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}