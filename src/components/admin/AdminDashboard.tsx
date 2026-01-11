import React, { useEffect, useState } from 'react';
import { Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import StatsCard from './shared/StatsCard';
import { LineChartComponent, BarChartComponent } from './shared/Charts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, chartsData, usersData, activityData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getDashboardCharts('7d'),
          adminApi.getTopUsers('balance_xp', 5),
          adminApi.getRecentActivity(10),
        ]);

        setStats(statsData);
        setCharts(chartsData);
        setTopUsers(usersData);
        setActivity(activityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCard
              key={i}
              label="Loading..."
              value="---"
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-gray-400 mt-1">Welcome to the admin panel. Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Users"
          value={stats?.total_users?.toLocaleString() || '0'}
          icon={<Users className="w-6 h-6" />}
          colorScheme="blue"
          change={stats?.user_growth_percent}
          changeLabel="vs last week"
        />
        <StatsCard
          label="Total Predictions"
          value={stats?.total_predictions?.toLocaleString() || '0'}
          icon={<FileText className="w-6 h-6" />}
          colorScheme="purple"
          change={stats?.prediction_growth_percent}
        />
        <StatsCard
          label="Total Volume (XP)"
          value={stats?.total_volume_xp?.toLocaleString() || '0'}
          icon={<DollarSign className="w-6 h-6" />}
          colorScheme="green"
        />
        <StatsCard
          label="Active Users (24h)"
          value={stats?.active_users_24h?.toLocaleString() || '0'}
          icon={<TrendingUp className="w-6 h-6" />}
          colorScheme="orange"
        />
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Pending KYC</h3>
          </div>
          <div className="text-3xl font-bold text-yellow-500">{stats?.pending_kyc || 0}</div>
          <p className="text-sm text-gray-400 mt-1">Requests awaiting review</p>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-white">Pending Reports</h3>
          </div>
          <div className="text-3xl font-bold text-red-500">{stats?.pending_reports || 0}</div>
          <p className="text-sm text-gray-400 mt-1">Reports to review</p>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Support Tickets</h3>
          </div>
          <div className="text-3xl font-bold text-blue-500">{stats?.open_support_tickets || stats?.pending_support || 0}</div>
          <p className="text-sm text-gray-400 mt-1">Open tickets</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">User Growth (7 Days)</h3>
          <LineChartComponent
            data={charts?.user_growth || []}
            dataKey="value"
            xAxisKey="date"
            color="#3b82f6"
            label="New Users"
            loading={loading}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Bet Volume (7 Days)</h3>
          <BarChartComponent
            data={charts?.bet_count || []}
            dataKey="value"
            xAxisKey="date"
            color="#10b981"
            label="Bets"
            loading={loading}
          />
        </div>
      </div>

      {/* Top Users & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Users by XP</h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-750 rounded-lg">
                <div className="text-lg font-bold text-gray-400 w-8">#{index + 1}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{user.username}</div>
                  <div className="text-sm text-gray-400">{user.balance_xp?.toLocaleString()} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activity.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-750 rounded-lg">
                <div className="text-xs text-gray-500 w-16">
                  {new Date(item.created_at).toLocaleTimeString()}
                </div>
                <div className="flex-1">
                  {item.type === 'prediction_created' && (
                    <div className="text-sm text-gray-300">
                      <span className="text-purple-400">{item.data.creator?.username}</span> created a prediction
                    </div>
                  )}
                  {item.type === 'bet_placed' && (
                    <div className="text-sm text-gray-300">
                      <span className="text-green-400">{item.data.user?.username}</span> placed a{' '}
                      {item.data.amount} {item.data.currency} bet
                    </div>
                  )}
                  {item.type === 'user_joined' && (
                    <div className="text-sm text-gray-300">
                      <span className="text-blue-400">{item.data.username}</span> joined the platform
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

