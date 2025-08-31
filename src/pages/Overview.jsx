import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Upload
} from 'lucide-react';

// Dummy data functions
const generateDummyCustomers = () => {
  return [
    { id: 1, name: 'Alice Johnson', status: 'Active', joinDate: '2024-12-15' },
    { id: 2, name: 'Bob Smith', status: 'Active', joinDate: '2024-11-20' },
    { id: 3, name: 'Tom Wilson', status: 'Active', joinDate: '2024-10-05' },
    { id: 4, name: 'David Brown', status: 'Active', joinDate: '2025-01-05' },
    { id: 5, name: 'Emma Davis', status: 'Inactive', joinDate: '2024-09-12' },
    { id: 6, name: 'Frank Miller', status: 'Active', joinDate: '2025-01-10' },
    { id: 7, name: 'Grace Lee', status: 'Active', joinDate: '2024-11-30' },
    { id: 8, name: 'Henry Taylor', status: 'Inactive', joinDate: '2024-08-22' }
  ];
};

const generateDummyTaxReturns = () => {
  return [
    { id: 1, customerId: 1, status: 'Filed Return', year: 2024 },
    { id: 2, customerId: 2, status: 'In Review', year: 2024 },
    { id: 3, customerId: 3, status: 'In Preparation', year: 2024 },
    { id: 4, customerId: 4, status: 'Ready to File', year: 2024 },
    { id: 5, customerId: 5, status: 'Filed Return', year: 2024 },
    { id: 6, customerId: 6, status: 'In Review', year: 2024 },
    { id: 7, customerId: 7, status: 'In Preparation', year: 2024 },
    { id: 8, customerId: 8, status: 'Filed Return', year: 2024 }
  ];
};

const generateDummyInvoices = () => {
  return [
    { id: 1, customerId: 1, total: 450, status: 'Paid', date: '2025-01-10' },
    { id: 2, customerId: 2, total: 525, status: 'Pending', date: '2025-01-12' },
    { id: 3, customerId: 3, total: 375, status: 'Paid', date: '2025-01-05' },
    { id: 4, customerId: 4, total: 600, status: 'Pending', date: '2025-01-15' },
    { id: 5, customerId: 5, total: 420, status: 'Paid', date: '2024-12-20' },
    { id: 6, customerId: 6, total: 480, status: 'Pending', date: '2025-01-14' }
  ];
};

const generateDummyPayments = () => {
  return [
    { id: 1, invoiceId: 1, amount: 450, status: 'Completed', date: '2025-01-10' },
    { id: 2, invoiceId: 3, amount: 375, status: 'Completed', date: '2025-01-05' },
    { id: 3, invoiceId: 5, amount: 420, status: 'Completed', date: '2024-12-20' },
    { id: 4, invoiceId: 2, amount: 200, status: 'Partial', date: '2025-01-13' }
  ];
};

const generateDummyActivities = () => {
  return [
    { id: 1, action: 'Reviewed return for Alice Johnson', user: 'Lisa Reviewer', entityType: 'status', timestamp: '2025-01-15T10:30:00' },
    { id: 2, action: 'Created invoice for Bob Smith', user: 'Sarah Manager', entityType: 'invoice', timestamp: '2025-01-15T09:15:00' },
    { id: 3, action: 'Updated permissions for Tom Wilson', user: 'John Admin', entityType: 'user', timestamp: '2025-01-15T08:45:00' },
    { id: 4, action: 'Uploaded W2 document', user: 'Alice Johnson', entityType: 'document', timestamp: '2025-01-14T16:20:00' },
    { id: 5, action: 'Changed status to Ready to File for David Brown', user: 'System', entityType: 'status', timestamp: '2025-01-14T14:10:00' },
    { id: 6, action: 'Added comment to Emma Davis file', user: 'Lisa Reviewer', entityType: 'comment', timestamp: '2025-01-14T11:30:00' },
    { id: 7, action: 'Processed payment for Frank Miller', user: 'Sarah Manager', entityType: 'payment', timestamp: '2025-01-13T15:45:00' },
    { id: 8, action: 'Sent reminder email to Grace Lee', user: 'System', entityType: 'notification', timestamp: '2025-01-13T10:20:00' },
    { id: 9, action: 'Updated tax codes for 2024 season', user: 'John Admin', entityType: 'system', timestamp: '2025-01-12T16:30:00' },
    { id: 10, action: 'Exported quarterly reports', user: 'Sarah Manager', entityType: 'report', timestamp: '2025-01-12T14:15:00' }
  ];
};

const generateDummyUsers = () => {
  return [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin', isActive: true },
    { id: 2, name: 'Tax Reviewer', email: 'reviewer@example.com', role: 'Reviewer', isActive: true },
    { id: 3, name: 'Account Manager', email: 'manager@example.com', role: 'Manager', isActive: true },
    { id: 4, name: 'Inactive User', email: 'inactive@example.com', role: 'Viewer', isActive: false }
  ];
};

// Date formatting utility
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours`;
  return `${Math.floor(diffInSeconds / 86400)} days`;
};

export default function Overview() {
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [taxReturns, setTaxReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load dummy data
    setCustomers(generateDummyCustomers());
    setTaxReturns(generateDummyTaxReturns());
    setInvoices(generateDummyInvoices());
    setPayments(generateDummyPayments());
    setActivities(generateDummyActivities());
    setUsers(generateDummyUsers());
  }, []);

  useEffect(() => {
    // Calculate statistics
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaymentsReceived = payments.filter(p => p.status === 'Completed')
      .reduce((sum, pay) => sum + pay.amount, 0);
    
    const returnsByStatus = taxReturns.reduce((acc, ret) => {
      acc[ret.status] = (acc[ret.status] || 0) + 1;
      return acc;
    }, {});

    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;

    setStats({
      totalCustomers: customers.length,
      activeCustomers,
      newCustomersThisMonth: Math.floor(customers.length * 0.15),
      customerTrend: 'up',
      activeUsers,
      inactiveUsers,
      totalInvoices: invoices.length,
      pendingInvoices: invoices.filter(i => i.status === 'Pending').length,
      totalPaymentsReceived,
      totalReturns: taxReturns.length,
      filedReturns: returnsByStatus['Filed Return'] || 0,
      inReviewReturns: returnsByStatus['In Review'] || 0,
      inPreparationReturns: returnsByStatus['In Preparation'] || 0
    });
  }, [customers, taxReturns, invoices, payments, users]);

  // Filter activities based on active tab
  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true;
    if (activeTab === 'comments') return activity.entityType === 'comment';
    if (activeTab === 'status change') return activity.entityType === 'status';
    if (activeTab === 'uploaded document') return activity.entityType === 'document';
    return true;
  });

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      subtitle: `${stats.newCustomersThisMonth || 0} new this month`,
      icon: Users,
      color: 'blue',
      trend: stats.customerTrend === 'up' ? TrendingUp : TrendingDown,
      trendColor: stats.customerTrend === 'up' ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      subtitle: `${stats.inactiveUsers || 0} inactive`,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices || 0,
      subtitle: `${stats.pendingInvoices || 0} pending`,
      icon: Receipt,
      color: 'purple',
      badge: stats.pendingInvoices > 0 ? stats.pendingInvoices : null
    },
    {
      title: 'Payments Received',
      value: `$${(stats.totalPaymentsReceived || 0).toLocaleString()}`,
      subtitle: 'Total received',
      icon: CreditCard,
      color: 'emerald'
    }
  ];

  // Format date to match the image (MM/DD/YYYY format)
  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Admin User
          </h1>
          <p className="text-gray-600">Here's what's happening with your tax portal today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          const TrendIcon = card.trend;
          
          return (
            <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <div className="flex items-center mt-2">
                    {TrendIcon && (
                      <TrendIcon className={`w-4 h-4 mr-1 ${card.trendColor}`} />
                    )}
                    <p className="text-sm text-gray-500">{card.subtitle}</p>
                  </div>
                </div>
                <div className="relative">
                  <div className={`p-3 rounded-full bg-${card.color}-100`}>
                    <IconComponent className={`w-6 h-6 text-${card.color}-600`} />
                  </div>
                  {card.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {card.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Returns Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tax Returns Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalReturns || 0}</div>
            <div className="text-sm text-gray-600">Total Returns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.filedReturns || 0}</div>
            <div className="text-sm text-gray-600">Filed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inReviewReturns || 0}</div>
            <div className="text-sm text-gray-600">In Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inPreparationReturns || 0}</div>
            <div className="text-sm text-gray-600">In Preparation</div>
          </div>
        </div>
      </div>

      {/* Recent Activities - Refactored to match the image */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              all
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              comments
            </button>
            <button
              onClick={() => setActiveTab('status change')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status change'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              status change
            </button>
            <button
              onClick={() => setActiveTab('uploaded document')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'uploaded document'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              uploaded document
            </button>
          </nav>
        </div>
        
        {/* Activities List */}
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {filteredActivities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="p-3 border-b border-gray-100 last:border-b-0">
              <p className="text-sm text-gray-900">
                {activity.action} by {activity.user} • {formatActivityDate(activity.timestamp)} 
              </p>
            </div>
          ))}
          
          {/* Fallback if no activities */}
          {filteredActivities.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No activities found for this filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}