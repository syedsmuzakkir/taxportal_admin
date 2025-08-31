import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Users, 
  FileText, 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils.js';

export default function Overview() {
  const { user } = useAuth();
  const { customers, taxReturns, invoices, payments, activities, users } = useData();
  const [stats, setStats] = useState({});

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
      newCustomersThisMonth: Math.floor(customers.length * 0.15), // Simulate
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}
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

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.slice(0, 10).map((activity) => {
            const getIcon = () => {
              switch (activity.entityType) {
                case 'return': return <FileText className="w-4 h-4" />;
                case 'invoice': return <Receipt className="w-4 h-4" />;
                case 'payment': return <CreditCard className="w-4 h-4" />;
                case 'customer': return <Users className="w-4 h-4" />;
                case 'user': return <Users className="w-4 h-4" />;
                default: return <Clock className="w-4 h-4" />;
              }
            };

            const getNavigationPath = () => {
              switch (activity.entityType) {
                case 'customer': return `/customers/${activity.entityId}`;
                case 'return': return '/tax-returns';
                case 'invoice': return '/invoices';
                case 'payment': return '/payments';
                case 'user': return '/users-management';
                default: return '#';
              }
            };

            return (
              <Link
                key={activity.id}
                to={getNavigationPath()}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="p-2 bg-gray-100 rounded-full">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    by {activity.user} • {formatDistanceToNow(new Date(activity.timestamp))} ago
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}