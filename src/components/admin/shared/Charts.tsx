import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  data: any[];
  loading?: boolean;
}

/**
 * Line Chart Component
 * For displaying trends over time
 */
export const LineChartComponent: React.FC<ChartProps & {
  dataKey: string;
  xAxisKey: string;
  color?: string;
  label?: string;
}> = ({ data, loading, dataKey, xAxisKey, color = '#3b82f6', label = 'Value' }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color }}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Bar Chart Component
 * For displaying comparisons
 */
export const BarChartComponent: React.FC<ChartProps & {
  dataKey: string;
  xAxisKey: string;
  color?: string;
  label?: string;
}> = ({ data, loading, dataKey, xAxisKey, color = '#10b981', label = 'Value' }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend />
          <Bar dataKey={dataKey} fill={color} name={label} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Area Chart Component
 * For displaying cumulative data
 */
export const AreaChartComponent: React.FC<ChartProps & {
  dataKey: string;
  xAxisKey: string;
  color?: string;
  label?: string;
}> = ({ data, loading, dataKey, xAxisKey, color = '#8b5cf6', label = 'Value' }) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fillOpacity={1}
            fill={`url(#color${dataKey})`}
            name={label}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Pie Chart Component
 * For displaying distribution
 */
export const PieChartComponent: React.FC<ChartProps & {
  dataKey: string;
  nameKey: string;
  colors?: string[];
}> = ({
  data,
  loading,
  dataKey,
  nameKey,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
}) => {
  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gray-800 rounded-xl border border-gray-700 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default {
  LineChart: LineChartComponent,
  BarChart: BarChartComponent,
  AreaChart: AreaChartComponent,
  PieChart: PieChartComponent,
};

