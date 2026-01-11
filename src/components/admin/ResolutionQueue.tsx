import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { DataTable, Column } from './shared/DataTable';
import { ConfirmModal } from './shared/ConfirmModal';
import { toast } from 'sonner';

export const ResolutionQueue: React.FC = () => {
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [status, setStatus] = useState('pending');
  const [selectedResolution, setSelectedResolution] = useState<any>(null);
  const [viewModal, setViewModal] = useState(false);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; resolution: any } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchResolutions();
  }, [pagination.page, status]);

  const fetchResolutions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getResolutionQueue({
        page: pagination.page,
        limit: pagination.limit,
        status: status !== 'all' ? status : undefined,
      });
      setResolutions(data.resolutions || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch resolutions');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (resolutionId: string, decision: 'approved' | 'rejected', notes?: string, rejectionReason?: string) => {
    try {
      setActionLoading(true);
      await adminApi.reviewResolution(resolutionId, decision, notes, rejectionReason);
      toast.success(`Resolution ${decision}`);
      fetchResolutions();
      setActionModal(null);
      setViewModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to review resolution');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'prediction',
      label: 'Prediction',
      render: (resolution) => (
        <div className="max-w-md">
          <div className="font-medium text-white">{resolution.prediction?.question}</div>
          <div className="text-xs text-gray-400 mt-1">
            Category: {resolution.prediction?.category}
          </div>
        </div>
      ),
    },
    {
      key: 'proposed_outcome',
      label: 'Proposed Outcome',
      render: (resolution) => (
        <span className={`px-3 py-1 rounded font-medium ${
          resolution.proposed_outcome ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {resolution.proposed_outcome ? 'YES' : 'NO'}
        </span>
      ),
    },
    {
      key: 'proof',
      label: 'Proof',
      render: (resolution) => (
        <div className="flex items-center gap-2">
          {resolution.proof_url && (
            <a
              href={resolution.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-700 rounded"
              title="View URL"
            >
              <LinkIcon className="w-4 h-4 text-blue-400" />
            </a>
          )}
          {resolution.proof_image && (
            <button
              onClick={() => window.open(resolution.proof_image, '_blank')}
              className="p-1 hover:bg-gray-700 rounded"
              title="View Image"
            >
              <ImageIcon className="w-4 h-4 text-purple-400" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'submitter',
      label: 'Submitted By',
      render: (resolution) => (
        <span className="text-sm text-gray-300">
          {resolution.submitter?.username || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Submitted',
      sortable: true,
      render: (resolution) => (
        <span className="text-sm text-gray-400">
          {new Date(resolution.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (resolution) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          resolution.status === 'approved' ? 'bg-green-600 text-white' :
          resolution.status === 'rejected' ? 'bg-red-600 text-white' :
          'bg-yellow-600 text-white'
        }`}>
          {resolution.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (resolution) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedResolution(resolution);
              setViewModal(true);
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            View
          </button>
          {resolution.status === 'pending' && (
            <>
              <button
                onClick={() => setActionModal({ type: 'approve', resolution })}
                className="p-2 hover:bg-green-600 rounded transition-colors"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
              </button>
              <button
                onClick={() => setActionModal({ type: 'reject', resolution })}
                className="p-2 hover:bg-red-600 rounded transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4 text-red-400" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Resolution Queue</h2>
        <p className="text-gray-400 mt-1">Review and approve prediction resolution submissions</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
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

      {/* Resolutions Table */}
      <DataTable
        columns={columns}
        data={resolutions}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowKey={(resolution) => resolution.id}
        emptyMessage="No resolutions found"
      />

      {/* View Modal */}
      {viewModal && selectedResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Resolution Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Prediction</label>
                <div className="text-white">{selectedResolution.prediction?.question}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Proposed Outcome</label>
                  <span className={`inline-block px-3 py-1 rounded font-medium ${
                    selectedResolution.proposed_outcome ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {selectedResolution.proposed_outcome ? 'YES' : 'NO'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Submitted By</label>
                  <div className="text-white">{selectedResolution.submitter?.username}</div>
                </div>
              </div>
              {selectedResolution.submission_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Submitter Notes</label>
                  <div className="text-white bg-gray-900 rounded p-3">{selectedResolution.submission_notes}</div>
                </div>
              )}
              {selectedResolution.proof_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Proof URL</label>
                  <a
                    href={selectedResolution.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all"
                  >
                    {selectedResolution.proof_url}
                  </a>
                </div>
              )}
              {selectedResolution.proof_image && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Proof Image</label>
                  <img
                    src={selectedResolution.proof_image}
                    alt="Proof"
                    className="max-w-full rounded-lg border border-gray-700"
                  />
                </div>
              )}
              {selectedResolution.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Admin Notes</label>
                  <div className="text-white bg-gray-900 rounded p-3">{selectedResolution.admin_notes}</div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => setViewModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedResolution.status === 'pending' && (
                <>
                  <button
                    onClick={() => setActionModal({ type: 'approve', resolution: selectedResolution })}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setActionModal({ type: 'reject', resolution: selectedResolution })}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {actionModal && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setActionModal(null)}
          onConfirm={() => {
            const notes = actionModal.type === 'approve' ? prompt('Admin notes (optional):') || '' : '';
            const rejectionReason = actionModal.type === 'reject' ? prompt('Rejection reason:') || '' : '';
            handleReview(actionModal.resolution.id, actionModal.type, notes, rejectionReason);
          }}
          title={`${actionModal.type === 'approve' ? 'Approve' : 'Reject'} Resolution`}
          message={`Are you sure you want to ${actionModal.type} this resolution?`}
          confirmText={actionModal.type === 'approve' ? 'Approve' : 'Reject'}
          variant={actionModal.type === 'approve' ? 'info' : 'danger'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ResolutionQueue;

