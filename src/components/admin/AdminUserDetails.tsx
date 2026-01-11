import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Ban, DollarSign, FileText, MessageSquare, Save } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import { toast } from 'sonner';

export const AdminUserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('note');

  useEffect(() => {
    if (id) {
      fetchUserDetails();
      fetchUserNotes();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUserDetails(id!);
      setUser(data);
    } catch (error) {
      toast.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNotes = async () => {
    try {
      const data = await adminApi.getUserNotes(id!);
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await adminApi.addUserNote(id!, newNote, noteType);
      toast.success('Note added successfully');
      setNewNote('');
      fetchUserNotes();
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-white">User not found</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {/* User Info Card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              {user.is_verified && <Shield className="w-6 h-6 text-blue-500" />}
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                user.is_banned ? 'bg-red-600' : 'bg-green-600'
              } text-white`}>
                {user.is_banned ? 'Banned' : 'Active'}
              </span>
            </div>
            <div className="text-gray-400 space-y-1">
              <div>{user.email}</div>
              <div>Joined: {new Date(user.created_at).toLocaleDateString()}</div>
              <div>Role: <span className="text-purple-400">{user.role?.toUpperCase()}</span></div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{user.balance_xp?.toLocaleString() || 0} XP</div>
            <div className="text-xl font-bold text-blue-400">{user.balance_xc?.toLocaleString() || 0} XC</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Total Predictions</div>
          <div className="text-2xl font-bold text-white mt-1">{user.stats?.total_predictions || 0}</div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Total Bets</div>
          <div className="text-2xl font-bold text-white mt-1">{user.stats?.total_bets || 0}</div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Win Rate</div>
          <div className="text-2xl font-bold text-white mt-1">{user.stats?.win_rate || 0}%</div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Followers</div>
          <div className="text-2xl font-bold text-white mt-1">{user.stats?.followers || 0}</div>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Admin Notes
        </h3>

        {/* Add Note */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="note">Note</option>
              <option value="warning">Warning</option>
              <option value="ban_reason">Ban Reason</option>
              <option value="internal">Internal</option>
            </select>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this user..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Add Note
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  note.type === 'warning' ? 'bg-yellow-600' :
                  note.type === 'ban_reason' ? 'bg-red-600' :
                  note.type === 'internal' ? 'bg-purple-600' :
                  'bg-gray-700'
                } text-white`}>
                  {note.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-300">{note.note}</p>
              <div className="text-xs text-gray-500 mt-2">
                By: {note.admin?.username || 'Unknown Admin'}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-center text-gray-400 py-8">No notes yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;

