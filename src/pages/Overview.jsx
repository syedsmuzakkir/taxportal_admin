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
// Add this at the top of Overview.jsx
// function getCookie(name) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(';').shift();
//   return null;
// }

  const userToken = localStorage.getItem('token');
// const userToken = getCookie("token");

// console.log(userToken, 'this is usertoke')
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/getdashboard-data`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
          //  credentials: "include",
        },
      });
      const data = await res.json();
      setReturns(data.returns);
      setInvoices(data.invoices);

      const returnsByStatus = data.returns.reduce((acc, ret) => {
        const key = ret.return_status.trim().toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

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
        returnsByStatus,
        totalInvoices: data.invoices.length,
        pendingInvoices: pendingInvoices.length,
        paidInvoices: paidInvoices.length,
        totalInvoiceAmount,
        pendingAmount,
        paidAmount,
      });
    } catch (err) {
      // console.error('Failed to fetch dashboard data:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/getAllActivties`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
          //  credentials: "include",

        }
      });
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      // console.error('Failed to fetch activities:', err);
    }
  };

  useEffect(() => {
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

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white-50 to-white-0">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          const TrendIcon = card.trend;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
                  )}
                  {TrendIcon && (
                    <TrendIcon className={`w-4 h-4 mt-2 ${card.trendColor}`} />
                  )}
                </div>
                <div className={`p-4 rounded-xl bg-${card.color}-50`}>
                  <IconComponent className={`w-7 h-7 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Returns Summary */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Tax Returns Summary
        </h2>
        <div className="grid grid-cols-7 md:grid-cols-7  gap-6">
          <div className="text-center bg-gray-50 rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalReturns || 0}
            </div>
            <div className="text-sm text-gray-500">Total Returns</div>
          </div>

          {stats.returnsByStatus &&
            Object.entries(stats.returnsByStatus).map(([status, count]) => (
              <div key={status} className="text-center bg-gray-50 rounded-xl p-5 shadow-sm">
                <div
                  className={`text-3xl font-bold ${
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
                <div className="text-sm text-gray-500 capitalize">
                  {status}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-6">
            {['all', 'comments', 'status change', 'uploaded document'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-2 border-b-2 font-medium text-sm transition ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
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
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scroll">
          {filteredActivities.map((a, i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-100 transition"
            >
              <p className="text-sm text-gray-900">{a.comment}</p>
              <p className="text-xs text-gray-500 mt-1">
                by <span className="font-medium">{a.name}</span> ({a.email}) •{' '}
                {formatDate(a.created_at)}
              </p>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-6 text-gray-500 italic">
              No activities found for this filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

