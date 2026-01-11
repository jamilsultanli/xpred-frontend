import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { DataTable, Column } from './shared/DataTable';
import { toast } from 'sonner';

export const AdminKYC: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [status, setStatus] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [viewModal, setViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, status]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getKYCRequests({
        page: pagination.page,
        limit: pagination.limit,
        status: status !== 'all' ? status : undefined,
      });
      setRequests(data.requests || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId: string, decision: 'approved' | 'rejected', notes: string) => {
    try {
      setActionLoading(true);
      await adminApi.updateKYCStatus(requestId, decision, notes);
      toast.success(`KYC ${decision}`);
      fetchRequests();
      setViewModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'user',
      label: 'User',
      render: (req) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {req.user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-white">{req.user?.username}</div>
            <div className="text-sm text-gray-400">{req.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'document_type',
      label: 'Document Type',
      render: (req) => (
        <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
          {req.document_type?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      sortable: true,
      render: (req) => (
        <span className="text-sm text-gray-400">
          {new Date(req.submitted_at || req.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (req) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          req.status === 'approved' ? 'bg-green-600 text-white' :
          req.status === 'rejected' ? 'bg-red-600 text-white' :
          'bg-yellow-600 text-white'
        }`}>
          {req.status?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (req) => (
        <button
          onClick={() => {
            setSelectedRequest(req);
            setViewModal(true);
          }}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
        >
          Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8" />
          KYC Verification
        </h2>
        <p className="text-gray-400 mt-1">Review and verify user identity documents</p>
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

      {/* Requests Table */}
      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowKey={(req) => req.id}
        emptyMessage="No KYC requests found"
      />

      {/* Review Modal */}
      {viewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full border border-gray-700 my-8">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">KYC Review</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                  <div className="text-white">{selectedRequest.user?.username}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <div className="text-white">{selectedRequest.user?.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <div className="text-white">{selectedRequest.full_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Document Type</label>
                  <div className="text-white">{selectedRequest.document_type?.toUpperCase()}</div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Submitted Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.document_front && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Front</label>
                      <img
                        src={selectedRequest.document_front}
                        alt="Document Front"
                        className="w-full rounded-lg border border-gray-700"
                      />
                    </div>
                  )}
                  {selectedRequest.document_back && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Back</label>
                      <img
                        src={selectedRequest.document_back}
                        alt="Document Back"
                        className="w-full rounded-lg border border-gray-700"
                      />
                    </div>
                  )}
                  {selectedRequest.selfie && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Selfie</label>
                      <img
                        src={selectedRequest.selfie}
                        alt="Selfie"
                        className="w-full rounded-lg border border-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Admin Notes</label>
                  <textarea
                    id="admin-notes"
                    rows={3}
                    placeholder="Add notes about this verification..."
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
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
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value || '';
                      handleDecision(selectedRequest.id, 'rejected', notes);
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => {
                      const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value || '';
                      handleDecision(selectedRequest.id, 'approved', notes);
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYC;

