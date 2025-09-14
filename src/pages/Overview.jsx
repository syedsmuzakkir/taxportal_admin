import React, { useState, useEffect } from 'react';
import { Users, Receipt, CreditCard, TrendingUp } from 'lucide-react';
import { BASE_URL } from '../api/BaseUrl';

export default function Overview() {
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [returns, setReturns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activities, setActivities] = useState([]);
const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/getdashboard-data`);
      const data = await res.json();
      setReturns(data.returns);
      setInvoices(data.invoices);

      // --- Returns stats ---
  // --- Returns stats (dynamic) ---
const returnsByStatus = data.returns.reduce((acc, ret) => {
  const key = ret.return_status.trim().toLowerCase();
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});


      // --- Invoice stats ---
      const totalInvoiceAmount = data.invoices.reduce(
        (sum, inv) => sum + parseFloat(inv.invoice_amount || 0),
        0
      );

      const pendingInvoices = data.invoices.filter(
        (i) => i.invoice_status.toLowerCase() === 'pending'
      );
      const paidInvoices = data.invoices.filter(
        (i) => i.invoice_status.toLowerCase() === 'paid'
      );

      const pendingAmount = pendingInvoices.reduce(
        (sum, inv) => sum + parseFloat(inv.invoice_amount || 0),
        0
      );
      const paidAmount = paidInvoices.reduce(
        (sum, inv) => sum + parseFloat(inv.invoice_amount || 0),
        0
      );

      setStats({
  totalCustomers: data.total_customers,
  totalReturns: data.returns.length,
  returnsByStatus, // keep all statuses dynamically
  totalInvoices: data.invoices.length,
  pendingInvoices: pendingInvoices.length,
  paidInvoices: paidInvoices.length,
  totalInvoiceAmount,
  pendingAmount,
  paidAmount,
});

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    // fetchDashboardData();
     const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchActivities()]);
    setLoading(false);
  };
  loadData();
  }, []);



  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      icon: Users,
      color: 'blue',
      trend: TrendingUp,
      trendColor: 'text-green-600',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices || 0,
      subtitle: `${stats.pendingInvoices || 0} pending`,
      icon: Receipt,
      color: 'purple',
    },
    {
      title: 'Payments Received',
      value: `$${(stats.paidAmount || 0).toLocaleString()}`,
      subtitle: `${stats.paidInvoices || 0} invoices paid`,
      icon: CreditCard,
      color: 'emerald',
    },
    {
      title: 'Pending Payments',
      value: `$${(stats.pendingAmount || 0).toLocaleString()}`,
      subtitle: `${stats.pendingInvoices || 0} invoices pending`,
      icon: CreditCard,
      color: 'red',
    },
  ];

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/getAllActivties`);
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  

  // Tab filter logic
  const filteredActivities = activities.filter((a) => {
    const c = a.comment.toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'status change') return c.includes('status changed');
    if (activeTab === 'uploaded document')
      return c.includes('upload') || c.includes('uploaded');
    if (activeTab === 'comments')
      return !c.includes('status changed') && !c.includes('upload');
    return true;
  });

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };


    if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      {/* <span className="ml-3 text-gray-600 font-medium">Loading dashboard...</span> */}
    </div>
  );
}
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          const TrendIcon = card.trend;
          return (
            <div
              key={card.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-sm text-gray-500 mt-2">{card.subtitle}</p>
                  )}
                  {TrendIcon && (
                    <TrendIcon className={`w-4 h-4 mt-1 ${card.trendColor}`} />
                  )}
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-100`}>
                  <IconComponent className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Returns Summary */}
    {/* Returns Summary */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 className="text-lg font-medium text-gray-900 mb-4">
    Tax Returns Summary
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Always show total */}
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900">
        {stats.totalReturns || 0}
      </div>
      <div className="text-sm text-gray-600">Total Returns</div>
    </div>

    {/* Loop through dynamic statuses */}
    {stats.returnsByStatus &&
      Object.entries(stats.returnsByStatus).map(([status, count]) => (
        <div key={status} className="text-center">
          <div
            className={`text-2xl font-bold ${
              status.includes('filed')
                ? 'text-green-600'
                : status.includes('review')
                ? 'text-yellow-600'
                : status.includes('preparation')
                ? 'text-blue-600'
                : status.includes('document')
                ? 'text-indigo-600'
                : 'text-gray-600'
            }`}
          >
            {count}
          </div>
          <div className="text-sm text-gray-600 capitalize">
            {status}
          </div>
        </div>
      ))}
  </div>
</div>


      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Activities
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {['all', 'comments', 'status change', 'uploaded document'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Activities List */}
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {filteredActivities.map((a, i) => (
            <div key={i} className="p-3 border-b border-gray-100 last:border-b-0">
              <p className="text-sm text-gray-900">{a.comment}</p>
              <p className="text-xs text-gray-500">
                by {a.name} ({a.email}) • {formatDate(a.created_at)}
              </p>
            </div>
          ))}

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
