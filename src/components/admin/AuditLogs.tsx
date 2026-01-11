import React, { useEffect, useState } from 'react';
import { FileSearch, Filter, Download } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { DataTable, Column } from './shared/DataTable';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    admin_id: '',
    action: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        admin_id: filters.admin_id || undefined,
        action: filters.action || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      });
      setLogs(data.logs || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'admin',
      label: 'Admin',
      render: (log) => (
        <span className="text-sm text-gray-300">
          {log.admin?.username || 'System'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log) => (
        <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium">
          {log.action}
        </span>
      ),
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (log) => (
        log.resource_type ? (
          <div className="text-sm">
            <div className="text-white">{log.resource_type}</div>
            {log.resource_id && (
              <div className="text-xs text-gray-400">{log.resource_id.slice(0, 8)}...</div>
            )}
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (log) => (
        log.details ? (
          <details className="text-xs">
            <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
              View Details
            </summary>
            <pre className="mt-2 p-2 bg-gray-900 rounded text-gray-300 overflow-x-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </details>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (log) => (
        <span className="text-xs text-gray-400">{log.ip_address || '-'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      sortable: true,
      render: (log) => (
        <span className="text-xs text-gray-400">
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileSearch className="w-8 h-8" />
            Audit Logs
          </h2>
          <p className="text-gray-400 mt-1">Complete history of all admin actions</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Filter by action..."
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <input
            type="date"
            placeholder="Start date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
          <input
            type="date"
            placeholder="End date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => setFilters({ admin_id: '', action: '', start_date: '', end_date: '' })}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowKey={(log) => log.id}
        emptyMessage="No audit logs found"
      />
    </div>
  );
};

export default AuditLogs;

