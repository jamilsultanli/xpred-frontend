import { useState, useEffect } from 'react';
import { X, Loader2, UserX, Unlock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { blocksApi } from '../lib/api/blocks';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlockedUsersModal({ isOpen, onClose }: BlockedUsersModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBlockedUsers();
    }
  }, [isOpen]);

  const loadBlockedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await blocksApi.getBlockedUsers();
      if (response.success) {
        // Extract user data from nested structure
        const users = response.blocked_users.map((item: any) => ({
          id: item.blocked_id,
          ...(item.profiles || {}),
        }));
        setBlockedUsers(users);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load blocked users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = (userId: string, username: string) => {
    setUserToUnblock({ id: userId, username });
    setShowUnblockConfirm(true);
  };

  const confirmUnblock = async () => {
    if (!userToUnblock) return;

    setUnblocking(userToUnblock.id);
    try {
      const response = await blocksApi.unblockUser(userToUnblock.id);
      if (response.success) {
        toast.success(`@${userToUnblock.username} has been unblocked`);
        await loadBlockedUsers();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to unblock user');
    } finally {
      setUnblocking(null);
      setUserToUnblock(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} flex flex-col max-h-[90vh]`}>
        <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Blocked Users
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <UserX className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No blocked users</p>
              <p className="text-sm">Users you block won't be able to see your content or interact with you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`${isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 flex items-center justify-between`}
                >
                  <Link
                    to={`/user/${user.username}`}
                    className="flex items-center gap-3 flex-1"
                    onClick={onClose}
                  >
                    <div
                      className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0 overflow-hidden"
                      style={{
                        backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base">{user.full_name || user.username}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>@{user.username}</div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleUnblock(user.id, user.username)}
                    disabled={unblocking === user.id}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {unblocking === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Unblock
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

