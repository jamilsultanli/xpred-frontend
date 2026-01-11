import React, { useEffect, useState } from 'react';
import { Search, FileText, CheckCircle, Trash2, Star } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { DataTable, Column } from './shared/DataTable';
import { ConfirmModal } from './shared/ConfirmModal';
import { toast } from 'sonner';

export const AdminPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [actionModal, setActionModal] = useState<{ type: string; prediction: any } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, [pagination.page, search, category]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPredictions({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category: category || undefined,
      });
      setPredictions(data.predictions || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      await adminApi.updatePrediction(id, { is_featured: featured });
      toast.success(featured ? 'Prediction featured' : 'Prediction unfeatured');
      fetchPredictions();
    } catch (error) {
      toast.error('Failed to update prediction');
    }
  };

  const handleResolve = async (id: string, outcome: boolean, reason: string) => {
    try {
      setActionLoading(true);
      await adminApi.forceResolvePrediction(id, outcome, reason);
      toast.success('Prediction resolved');
      fetchPredictions();
      setActionModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve prediction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      await adminApi.deletePrediction(id);
      toast.success('Prediction deleted');
      fetchPredictions();
      setActionModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete prediction');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'question',
      label: 'Question',
      render: (pred) => (
        <div className="max-w-md">
          <div className="font-medium text-white flex items-center gap-2">
            {pred.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            {pred.question}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {pred.description?.slice(0, 100)}...
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (pred) => (
        <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">
          {pred.category}
        </span>
      ),
    },
    {
      key: 'creator',
      label: 'Creator',
      render: (pred) => (
        <span className="text-sm text-gray-300">
          {pred.creator?.username || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'pool',
      label: 'Pool',
      render: (pred) => (
        <div className="text-sm">
          <div className="text-green-400">{pred.total_pool_xp || 0} XP</div>
          <div className="text-blue-400">{pred.total_pool_xc || 0} XC</div>
        </div>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      sortable: true,
      render: (pred) => (
        <span className={`text-sm ${
          new Date(pred.deadline) < new Date() ? 'text-red-400' : 'text-gray-400'
        }`}>
          {new Date(pred.deadline).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (pred) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          pred.is_resolved ? 'bg-gray-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {pred.is_resolved ? 'Resolved' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (pred) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFeature(pred.id, !pred.is_featured)}
            className={`p-2 rounded transition-colors ${
              pred.is_featured ? 'bg-yellow-600 hover:bg-yellow-700' : 'hover:bg-gray-700'
            }`}
            title={pred.is_featured ? 'Unfeature' : 'Feature'}
          >
            <Star className={`w-4 h-4 ${pred.is_featured ? 'fill-white' : 'text-gray-400'}`} />
          </button>
          {!pred.is_resolved && (
            <button
              onClick={() => setActionModal({ type: 'resolve', prediction: pred })}
              className="p-2 hover:bg-green-600 rounded transition-colors"
              title="Resolve"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
            </button>
          )}
          <button
            onClick={() => setActionModal({ type: 'delete', prediction: pred })}
            className="p-2 hover:bg-red-600 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Prediction Management</h2>
        <p className="text-gray-400 mt-1">Manage and moderate platform predictions</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search predictions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="crypto">Crypto</option>
            <option value="sports">Sports</option>
            <option value="politics">Politics</option>
            <option value="entertainment">Entertainment</option>
            <option value="science">Science</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Predictions Table */}
      <DataTable
        columns={columns}
        data={predictions}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowKey={(pred) => pred.id}
        emptyMessage="No predictions found"
      />

      {/* Resolve Modal */}
      {actionModal?.type === 'resolve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Force Resolve Prediction</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleResolve(
                  actionModal.prediction.id,
                  formData.get('outcome') === 'true',
                  formData.get('reason') as string
                );
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Outcome</label>
                <select
                  name="outcome"
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="true">YES</option>
                  <option value="false">NO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                <textarea
                  name="reason"
                  rows={3}
                  placeholder="Why are you resolving this prediction?"
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
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Resolving...' : 'Resolve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {actionModal?.type === 'delete' && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setActionModal(null)}
          onConfirm={() => handleDelete(actionModal.prediction.id)}
          title="Delete Prediction"
          message="Are you sure you want to delete this prediction? All bets will be refunded. This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminPredictions;

