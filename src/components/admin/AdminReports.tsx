import React, { useEffect, useState } from 'react';
import { Flag, CheckCircle, XCircle, Ban, Trash2, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { DataTable, Column } from './shared/DataTable';
import { ConfirmModal } from './shared/ConfirmModal';
import { toast } from 'sonner';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [status, setStatus] = useState('pending');
  const [actionModal, setActionModal] = useState<{ type: string; report: any } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [pagination.page, status]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReports({
        page: pagination.page,
        limit: pagination.limit,
        status: status !== 'all' ? status : undefined,
      });
      setReports(data.reports || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, action: string, notes: string) => {
    try {
      setActionLoading(true);
      await adminApi.resolveReport(reportId, action as any, notes);
      toast.success('Report resolved');
      fetchReports();
      setActionModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve report');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'type',
      label: 'Type',
      render: (report) => (
        <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-medium">
          {report.type?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'reporter',
      label: 'Reporter',
      render: (report) => (
        <span className="text-sm text-gray-300">
          {report.reporter?.username || 'Anonymous'}
        </span>
      ),
    },
    {
      key: 'reported_user',
      label: 'Reported User',
      render: (report) => (
        <span className="text-sm text-gray-300">
          {report.reported_user?.username || 'N/A'}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (report) => (
        <div className="max-w-xs">
          <div className="text-sm text-white">{report.reason}</div>
          {report.description && (
            <div className="text-xs text-gray-400 mt-1">{report.description.slice(0, 100)}...</div>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Reported',
      sortable: true,
      render: (report) => (
        <span className="text-sm text-gray-400">
          {new Date(report.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (report) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          report.status === 'resolved' ? 'bg-green-600 text-white' :
          report.status === 'dismissed' ? 'bg-gray-600 text-white' :
          'bg-yellow-600 text-white'
        }`}>
          {report.status?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (report) => (
        report.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActionModal({ type: 'dismiss', report })}
              className="p-2 hover:bg-gray-600 rounded transition-colors"
              title="Dismiss"
            >
              <XCircle className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setActionModal({ type: 'warn', report })}
              className="p-2 hover:bg-yellow-600 rounded transition-colors"
              title="Warn User"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </button>
            <button
              onClick={() => setActionModal({ type: 'ban', report })}
              className="p-2 hover:bg-red-600 rounded transition-colors"
              title="Ban User"
            >
              <Ban className="w-4 h-4 text-red-400" />
            </button>
            <button
              onClick={() => setActionModal({ type: 'delete', report })}
              className="p-2 hover:bg-red-700 rounded transition-colors"
              title="Delete Content"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
        <p className="text-gray-400 mt-1">Review and action on user reports</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex gap-2">
          {['pending', 'resolved', 'dismissed', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowKey={(report) => report.id}
        emptyMessage="No reports found"
      />

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {actionModal.type === 'dismiss' ? 'Dismiss Report' :
                 actionModal.type === 'warn' ? 'Warn User' :
                 actionModal.type === 'ban' ? 'Ban User' :
                 'Delete Content'}
              </h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleResolve(
                  actionModal.report.id,
                  actionModal.type === 'dismiss' ? 'dismiss' :
                  actionModal.type === 'warn' ? 'warn_user' :
                  actionModal.type === 'ban' ? 'ban_user' :
                  'delete_content',
                  formData.get('notes') as string
                );
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Add notes about this action..."
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                    actionModal.type === 'ban' || actionModal.type === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;

