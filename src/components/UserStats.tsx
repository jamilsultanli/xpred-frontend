import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Zap, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../lib/api/users';

export function UserStats() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState([
    { icon: TrendingUp, label: 'Total XP', value: '0', color: 'from-blue-500 to-cyan-500' },
    { icon: Zap, label: 'Total XC', value: '0', color: 'from-purple-500 to-pink-500' },
    { icon: Target, label: 'Active Predictions', value: '0', color: 'from-green-500 to-emerald-500' },
    { icon: Award, label: 'Win Rate', value: '0%', color: 'from-yellow-500 to-orange-500' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getStats();
      if (response.success) {
        const s = response.stats;
        setStats([
          { icon: TrendingUp, label: 'Total XP', value: s.totalXP.toLocaleString(), color: 'from-blue-500 to-cyan-500' },
          { icon: Zap, label: 'Total XC', value: s.totalXC.toFixed(2), color: 'from-purple-500 to-pink-500' },
          { icon: Target, label: 'Active Predictions', value: s.activeBets.toString(), color: 'from-green-500 to-emerald-500' },
          { icon: Award, label: 'Win Rate', value: `${s.winRate.toFixed(1)}%`, color: 'from-yellow-500 to-orange-500' },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} p-4`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 lg:p-4 flex items-center justify-center`}>
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ))
        ) : (
          stats.map((stat) => (
          <div
            key={stat.label}
            className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 lg:p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-xl lg:text-2xl font-bold mb-1">{stat.value}</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
          </div>
        )))}
      </div>
    </div>
  );
}
