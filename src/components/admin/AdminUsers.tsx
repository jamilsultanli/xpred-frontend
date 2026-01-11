import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, Ban, Shield, DollarSign, Eye, MoreVertical, Check, X } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { DataTable, Column } from './shared/DataTable';
import { PermissionGuard } from './shared/PermissionGuard';
import { ConfirmModal } from './shared/ConfirmModal';
import { toast } from 'sonner';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<any>({
    role: '',
    is_banned: '',
    is_verified: '',
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{ type: string; user: any } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        role: filters.role || undefined,
        is_banned: filters.is_banned !== '' ? filters.is_banned === 'true' : undefined,
        is_verified: filters.is_verified !== '' ? filters.is_verified === 'true' : undefined,
      });
      setUsers(data.users || []);
      setPagination(data.pagination || pagination);
    } catch (error: any) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      setActionLoading(true);
      await adminApi.banUser(userId, reason);
      toast.success('User banned successfully');
      fetchUsers();
      setActionModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      setActionLoading(true);
      await adminApi.updateUser(userId, { is_verified: true });
      toast.success('User verified successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to verify user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFunds = async (userId: string, amount: number, currency: 'XP' | 'XC', reason: string) => {
    try {
      setActionLoading(true);
      await adminApi.addFunds(userId, amount, currency, reason);
      toast.success(`Added ${amount} ${currency} to user`);
      fetchUsers();
      setActionModal(null);
    } catch (error: any) {
      toast.error('Failed to add funds');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'username',
      label: 'User',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-medium text-white flex items-center gap-2">
              {user.username}
              {user.is_verified && <Shield className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="text-sm text-gray-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          user.role === 'admin' ? 'bg-purple-600 text-white' :
          user.role === 'moderator' ? 'bg-blue-600 text-white' :
          'bg-gray-700 text-gray-300'
        }`}>
          {user.role?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'balance_xp',
      label: 'Balance',
      sortable: true,
      render: (user) => (
        <div className="text-sm">
          <div className="text-green-400">{user.balance_xp?.toLocaleString() || 0} XP</div>
          <div className="text-blue-400">{user.balance_xc?.toLocaleString() || 0} XC</div>
        </div>
      ),
    },
    {
      key: 'is_banned',
      label: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          user.is_banned ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {user.is_banned ? 'Banned' : 'Active'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-400">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          
          <PermissionGuard resource="users" action="update">
            <div className="relative group">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {!user.is_verified && (
                  <button
                    onClick={() => handleVerifyUser(user.id)}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Verify User
                  </button>
                )}
                {!user.is_banned && (
                  <button
                    onClick={() => setActionModal({ type: 'ban', user })}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Ban User
                  </button>
                )}
                <button
                  onClick={() => setActionModal({ type: 'funds', user })}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Add Funds
                </button>
              </div>
            </div>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 mt-1">Manage platform users and permissions</p>
        </div>
        <PermissionGuard resource="users" action="create">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Admin
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.is_banned}
            onChange={(e) => setFilters({ ...filters, is_banned: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        rowKey={(user) => user.id}
        emptyMessage="No users found"
      />

      {/* Ban Modal */}
      {actionModal?.type === 'ban' && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setActionModal(null)}
          onConfirm={() => {
            const reason = prompt('Enter ban reason:');
            if (reason) handleBanUser(actionModal.user.id, reason);
          }}
          title="Ban User"
          message={`Are you sure you want to ban ${actionModal.user.username}? This action can be reversed later.`}
          confirmText="Ban User"
          variant="danger"
          loading={actionLoading}
        />
      )}

      {/* Add Funds Modal */}
      {actionModal?.type === 'funds' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Add Funds</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddFunds(
                  actionModal.user.id,
                  Number(formData.get('amount')),
                  formData.get('currency') as 'XP' | 'XC',
                  formData.get('reason') as string
                );
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                <select
                  name="currency"
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="XP">XP</option>
                  <option value="XC">XC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                <textarea
                  name="reason"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
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
                  {actionLoading ? 'Adding...' : 'Add Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

