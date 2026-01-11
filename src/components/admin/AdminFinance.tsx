import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Download } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { LineChartComponent, PieChartComponent } from './shared/Charts';
import StatsCard from './shared/StatsCard';

export const AdminFinance: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFinanceAnalytics(period);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            Finance Analytics
          </h2>
          <p className="text-gray-400 mt-1">Platform revenue and transaction analytics</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {p === '24h' ? '24 Hours' :
               p === '7d' ? '7 Days' :
               p === '30d' ? '30 Days' :
               p === '90d' ? '90 Days' :
               '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Revenue (XP)"
          value={analytics?.total_revenue_xp?.toLocaleString() || '0'}
          icon={<DollarSign className="w-6 h-6" />}
          colorScheme="green"
          change={analytics?.revenue_growth_xp}
        />
        <StatsCard
          label="Total Revenue (XC)"
          value={analytics?.total_revenue_xc?.toLocaleString() || '0'}
          icon={<DollarSign className="w-6 h-6" />}
          colorScheme="blue"
          change={analytics?.revenue_growth_xc}
        />
        <StatsCard
          label="Transaction Volume"
          value={analytics?.total_transactions?.toLocaleString() || '0'}
          icon={<TrendingUp className="w-6 h-6" />}
          colorScheme="purple"
        />
        <StatsCard
          label="Platform Fees"
          value={`${analytics?.total_fees?.toLocaleString() || '0'} XP`}
          icon={<DollarSign className="w-6 h-6" />}
          colorScheme="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <LineChartComponent
            data={analytics?.revenue_trend || []}
            dataKey="revenue"
            xAxisKey="date"
            color="#10b981"
            label="Revenue (XP)"
          />
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Category</h3>
          <PieChartComponent
            data={analytics?.revenue_by_category || []}
            dataKey="value"
            nameKey="name"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent High-Value Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.recent_transactions || []).map((tx: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-300">{tx.user?.username}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{tx.type}</td>
                  <td className="py-3 px-4 text-sm text-green-400">
                    {tx.amount} {tx.currency}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!analytics?.recent_transactions || analytics.recent_transactions.length === 0) && (
            <div className="text-center text-gray-400 py-8">No transactions found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;

