import React, { useEffect, useState } from 'react';
import { Headphones, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { DataTable, Column } from './shared/DataTable';
import { toast } from 'sonner';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [status, setStatus] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [viewModal, setViewModal] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, status]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTickets({
        page: pagination.page,
        limit: pagination.limit,
        status: status !== 'all' ? status : undefined,
      });
      setTickets(data.tickets || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (ticketId: string, reply: string, newStatus?: string) => {
    try {
      setReplyLoading(true);
      await adminApi.replyToTicket(ticketId, reply, newStatus as any);
      toast.success('Reply sent');
      fetchTickets();
      setViewModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'subject',
      label: 'Subject',
      render: (ticket) => (
        <div className="max-w-md">
          <div className="font-medium text-white">{ticket.subject}</div>
          <div className="text-xs text-gray-400 mt-1">{ticket.message?.slice(0, 100)}...</div>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (ticket) => (
        <span className="text-sm text-gray-300">
          {ticket.user?.username || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (ticket) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          ticket.priority === 'urgent' ? 'bg-red-600 text-white' :
          ticket.priority === 'high' ? 'bg-orange-600 text-white' :
          ticket.priority === 'medium' ? 'bg-yellow-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          {ticket.priority?.toUpperCase() || 'LOW'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (ticket) => (
        <span className="text-sm text-gray-400">
          {new Date(ticket.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (ticket) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          ticket.status === 'resolved' ? 'bg-green-600 text-white' :
          ticket.status === 'in_progress' ? 'bg-blue-600 text-white' :
          'bg-yellow-600 text-white'
        }`}>
          {ticket.status?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (ticket) => (
        <button
          onClick={() => {
            setSelectedTicket(ticket);
            setViewModal(true);
          }}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
        >
          Reply
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Headphones className="w-8 h-8" />
          Support Tickets
        </h2>
        <p className="text-gray-400 mt-1">Manage and respond to user support requests</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex gap-2">
          {['open', 'in_progress', 'resolved', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <DataTable
        columns={columns}
        data={tickets}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowKey={(ticket) => ticket.id}
        emptyMessage="No tickets found"
      />

      {/* Reply Modal */}
      {viewModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Support Ticket</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">User</label>
                  <div className="text-white">{selectedTicket.user?.username}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                  <div className="text-white">{selectedTicket.priority?.toUpperCase()}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                <div className="text-white">{selectedTicket.subject}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                <div className="text-white bg-gray-900 rounded p-4">{selectedTicket.message}</div>
              </div>
              {selectedTicket.admin_reply && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Previous Reply</label>
                  <div className="text-white bg-gray-900 rounded p-4">{selectedTicket.admin_reply}</div>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleReply(
                    selectedTicket.id,
                    formData.get('reply') as string,
                    formData.get('status') as string
                  );
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Reply</label>
                  <textarea
                    name="reply"
                    rows={4}
                    required
                    placeholder="Type your reply to the user..."
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Update Status</label>
                  <select
                    name="status"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setViewModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={replyLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {replyLoading ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;

