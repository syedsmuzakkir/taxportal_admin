// import React, { useState, useEffect } from 'react';
// import { Users, Receipt, CreditCard, TrendingUp } from 'lucide-react';
// import { BASE_URL } from '../api/BaseUrl';

// export default function Overview() {
//   const [stats, setStats] = useState({});
//   const [activeTab, setActiveTab] = useState('all');
//   const [returns, setReturns] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
// // Add this at the top of Overview.jsx
// // function getCookie(name) {
// //   const value = `; ${document.cookie}`;
// //   const parts = value.split(`; ${name}=`);
// //   if (parts.length === 2) return parts.pop().split(';').shift();
// //   return null;
// // }

//   const userToken = localStorage.getItem('token');
// // const userToken = getCookie("token");

// // console.log(userToken, 'this is usertoke')
//   // Fetch dashboard data
//   const fetchDashboardData = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/api/admin/getdashboard-data`, {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${userToken}`,
//           //  credentials: "include",
//         },
//       });
//       const data = await res.json();
//       setReturns(data.returns);
//       setInvoices(data.invoices);

//       const returnsByStatus = data.returns.reduce((acc, ret) => {
//         const key = ret.return_status.trim().toLowerCase();
//         acc[key] = (acc[key] || 0) + 1;
//         return acc;
//       }, {});

//       const totalInvoiceAmount = data.invoices.reduce(
//         (sum, inv) => sum + parseFloat(inv.invoice_amount || 0),
//         0
//       );

//       const pendingInvoices = data.invoices.filter(
//         (i) => i.invoice_status.toLowerCase() === 'pending'
//       );
//       const paidInvoices = data.invoices.filter(
//         (i) => i.invoice_status.toLowerCase() === 'paid'
//       );

//       const pendingAmount = pendingInvoices.reduce(
//         (sum, inv) => sum + parseFloat(inv.invoice_amount || 0),
//         0
//       );
//       const paidAmount = paidInvoices.reduce(
//         (sum, inv) => sum + parseFloat(inv.invoice_amount || 0),
//         0
//       );

//       setStats({
//         totalCustomers: data.total_customers,
//         totalReturns: data.returns.length,
//         returnsByStatus,
//         totalInvoices: data.invoices.length,
//         pendingInvoices: pendingInvoices.length,
//         paidInvoices: paidInvoices.length,
//         totalInvoiceAmount,
//         pendingAmount,
//         paidAmount,
//       });
//     } catch (err) {
//       // console.error('Failed to fetch dashboard data:', err);
//     }
//   };

//   const fetchActivities = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/api/getAllActivties`, {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${userToken}`,
//           //  credentials: "include",

//         }
//       });
//       const data = await res.json();
//       setActivities(data);
//     } catch (err) {
//       // console.error('Failed to fetch activities:', err);
//     }
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       await Promise.all([fetchDashboardData(), fetchActivities()]);
//       setLoading(false);
//     };
//     loadData();
//   }, []);

//   const statCards = [
//     {
//       title: 'Total Customers',
//       value: stats.totalCustomers || 0,
//       icon: Users,
//       color: 'blue',
//       trend: TrendingUp,
//       trendColor: 'text-green-600',
//     },
//     {
//       title: 'Total Invoices',
//       value: stats.totalInvoices || 0,
//       subtitle: `${stats.pendingInvoices || 0} pending`,
//       icon: Receipt,
//       color: 'purple',
//     },
//     {
//       title: 'Payments Received',
//       value: `$${(stats.paidAmount || 0).toLocaleString()}`,
//       subtitle: `${stats.paidInvoices || 0} invoices paid`,
//       icon: CreditCard,
//       color: 'emerald',
//     },
//     {
//       title: 'Pending Payments',
//       value: `$${(stats.pendingAmount || 0).toLocaleString()}`,
//       subtitle: `${stats.pendingInvoices || 0} invoices pending`,
//       icon: CreditCard,
//       color: 'red',
//     },
//   ];

//   const filteredActivities = activities.filter((a) => {
//     const c = a.comment.toLowerCase();
//     if (activeTab === 'all') return true;
//     if (activeTab === 'status change') return c.includes('status changed');
//     if (activeTab === 'uploaded document')
//       return c.includes('upload') || c.includes('uploaded');
//     if (activeTab === 'comments')
//       return !c.includes('status changed') && !c.includes('upload');
//     return true;
//   });

//   const formatDate = (dateStr) => {
//     const d = new Date(dateStr);
//     return d.toLocaleString();
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white-50 to-white-0">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//         Dashboard Overview
//       </h1>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((card) => {
//           const IconComponent = card.icon;
//           const TrendIcon = card.trend;
//           return (
//             <div
//               key={card.title}
//               className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition transform hover:-translate-y-1"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-500">{card.title}</p>
//                   <p className="text-3xl font-bold text-gray-900 mt-1">
//                     {card.value}
//                   </p>
//                   {card.subtitle && (
//                     <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
//                   )}
//                   {TrendIcon && (
//                     <TrendIcon className={`w-4 h-4 mt-2 ${card.trendColor}`} />
//                   )}
//                 </div>
//                 <div className={`p-4 rounded-xl bg-${card.color}-50`}>
//                   <IconComponent className={`w-7 h-7 text-${card.color}-600`} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Returns Summary */}
//       <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-6">
//           Tax Returns Summary
//         </h2>
//         <div className="grid grid-cols-7 md:grid-cols-7  gap-6">
//           <div className="text-center bg-gray-50 rounded-xl p-5 shadow-sm">
//             <div className="text-3xl font-bold text-gray-900">
//               {stats.totalReturns || 0}
//             </div>
//             <div className="text-sm text-gray-500">Total Returns</div>
//           </div>

//           {stats.returnsByStatus &&
//             Object.entries(stats.returnsByStatus).map(([status, count]) => (
//               <div key={status} className="text-center bg-gray-50 rounded-xl p-5 shadow-sm">
//                 <div
//                   className={`text-3xl font-bold ${
//                     status.includes('filed')
//                       ? 'text-green-600'
//                       : status.includes('review')
//                       ? 'text-yellow-600'
//                       : status.includes('preparation')
//                       ? 'text-blue-600'
//                       : status.includes('document')
//                       ? 'text-indigo-600'
//                       : 'text-gray-600'
//                   }`}
//                 >
//                   {count}
//                 </div>
//                 <div className="text-sm text-gray-500 capitalize">
//                   {status}
//                 </div>
//               </div>
//             ))}
//         </div>
//       </div>

//       {/* Recent Activities */}
//       <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-lg font-semibold text-gray-900">
//             Recent Activities
//           </h2>
//         </div>

//         {/* Tab Navigation */}
//         <div className="border-b border-gray-200 mb-6">
//           <nav className="flex space-x-6">
//             {['all', 'comments', 'status change', 'uploaded document'].map(
//               (tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`py-2 px-2 border-b-2 font-medium text-sm transition ${
//                     activeTab === tab
//                       ? 'border-indigo-500 text-indigo-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               )
//             )}
//           </nav>
//         </div>

//         {/* Activities List */}
//         <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scroll">
//           {filteredActivities.map((a, i) => (
//             <div
//               key={i}
//               className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-100 transition"
//             >
//               <p className="text-sm text-gray-900">{a.comment}</p>
//               <p className="text-xs text-gray-500 mt-1">
//                 by <span className="font-medium">{a.name}</span> ({a.email}) •{' '}
//                 {formatDate(a.created_at)}
//               </p>
//             </div>
//           ))}

//           {filteredActivities.length === 0 && (
//             <div className="text-center py-6 text-gray-500 italic">
//               No activities found for this filter
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState } from 'react';
import { Users, Receipt, CreditCard, TrendingUp, FileText, Activity, MessageCircle, Upload, BarChart3 } from 'lucide-react';
import { BASE_URL } from '../api/BaseUrl';

// ✅ React Query imports
import { useQuery } from '@tanstack/react-query';

function Overview() {
  const [activeTab, setActiveTab] = useState('all');

  const userToken = localStorage.getItem('token');

  // ----------------------------
  // 🔹 React Query: Dashboard
  // ----------------------------
  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    isError: errorDashboard,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/admin/getdashboard-data`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 min fresh
  });

  // ----------------------------
  // 🔹 React Query: Activities
  // ----------------------------
  const {
    data: activitiesData,
    isLoading: loadingActivities,
    isError: errorActivities,
  } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/getAllActivties`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min fresh
  });

  // ----------------------------
  // 🔹 Combined loading state
  // ----------------------------
  const loading = loadingDashboard || loadingActivities;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">Loading Dashboard</h3>
            <p className="text-slate-600">Fetching your latest data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------
  // 🔹 Map API data to stats
  // ----------------------------
  const stats = dashboardData
    ? {
        totalCustomers: dashboardData.total_customers,
        totalReturns: dashboardData.returns.length,
        returnsByStatus: dashboardData.returns.reduce((acc, ret) => {
          const key = ret.return_status.trim().toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {}),
        totalInvoices: dashboardData.invoices.length,
        pendingInvoices: dashboardData.invoices.filter(
          (i) => i.invoice_status.toLowerCase() === 'pending'
        ).length,
        paidInvoices: dashboardData.invoices.filter(
          (i) => i.invoice_status.toLowerCase() === 'paid'
        ).length,
        totalInvoiceAmount: dashboardData.invoices.reduce(
          (sum, inv) => sum + parseFloat(inv.invoice_amount || 0),
          0
        ),
        pendingAmount: dashboardData.invoices
          .filter((i) => i.invoice_status.toLowerCase() === 'pending')
          .reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0),
        paidAmount: dashboardData.invoices
          .filter((i) => i.invoice_status.toLowerCase() === 'paid')
          .reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0),
      }
    : {};

  const activities = activitiesData || [];

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices || 0,
      subtitle: `${stats.pendingInvoices || 0} pending`,
      icon: Receipt,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Payments Received',
      value: `$${(stats.paidAmount || 0).toLocaleString()}`,
      subtitle: `${stats.paidInvoices || 0} invoices paid`,
      icon: CreditCard,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Pending Payments',
      value: `$${(stats.pendingAmount || 0).toLocaleString()}`,
      subtitle: `${stats.pendingInvoices || 0} invoices pending`,
      icon: TrendingUp,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const tabIcons = {
    'all': Activity,
    'comments': MessageCircle,
    'status change': BarChart3,
    'uploaded document': Upload,
  };

  const filteredActivities = activities.filter((a) => {
    const c = a.comment.toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'status change') return c.includes('status changed');
    if (activeTab === 'uploaded document') return c.includes('upload') || c.includes('uploaded');
    if (activeTab === 'comments') return !c.includes('status changed') && !c.includes('upload');
    return true;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    if (status.includes('filed')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status.includes('review')) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (status.includes('preparation')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (status.includes('document')) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pl-4">
      <div className="max-w-8xl mx-auto space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2 mb-1">
                      {card.value}
                    </p>
                    {card.subtitle && (
                      <p className="text-sm font-medium text-slate-500">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                </div>
                
                {/* Animated border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            );
          })}
        </div>

        {/* Returns Summary */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Tax Returns Summary</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Total Returns */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 text-center border-2 border-slate-200">
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {stats.totalReturns || 0}
              </div>
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Total Returns
              </div>
            </div>
            
            {/* Status Breakdown */}
            {stats.returnsByStatus &&
              Object.entries(stats.returnsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className={`rounded-2xl p-6 text-center border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${getStatusColor(status)}`}
                >
                  <div className="text-4xl font-bold mb-2">
                    {count}
                  </div>
                  <div className="text-sm font-semibold uppercase tracking-wide">
                    {status.replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Activities</h2>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl">
              {['all', 'comments', 'status change', 'uploaded document'].map((tab) => {
                const TabIcon = tabIcons[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-white text-slate-900 shadow-lg scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span className="capitalize">{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {filteredActivities.map((activity, index) => (
              <div
                key={index}
                className="group p-5 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3 group-hover:scale-150 transition-transform duration-300"></div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {activity.comment}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {activity.name}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{activity.email}</span>
                      <span className="text-slate-400">•</span>
                      <time className="font-medium">
                        {formatDate(activity.created_at)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                    <Activity className="w-12 h-12 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">No activities found</h3>
                    <p className="text-slate-600">
                      No activities match the selected filter: <span className="font-semibold capitalize">{activeTab}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default Overview