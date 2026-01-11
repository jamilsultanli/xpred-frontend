import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
  changeLabel?: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  loading?: boolean;
}

/**
 * StatsCard Component
 * Display metric with value, icon, and change indicator
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  change,
  changeLabel,
  colorScheme = 'blue',
  loading = false,
}) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
    red: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
    gray: 'bg-gradient-to-br from-gray-700 to-gray-800 text-white',
  };

  const getTrendIcon = () => {
    if (change === undefined || change === null) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return '';
    if (change > 0) return 'text-green-300';
    if (change < 0) return 'text-red-300';
    return 'text-gray-300';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
          <div className="h-10 w-10 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className={`${colorClasses[colorScheme]} rounded-xl p-6 shadow-lg transition-transform hover:scale-105`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-medium opacity-90">{label}</div>
        {icon && (
          <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-1">{value}</div>
      
      {change !== undefined && change !== null && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="font-medium">
            {change > 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="opacity-80 ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default StatsCard;

