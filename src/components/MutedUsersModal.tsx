import { useState, useEffect } from 'react';
import { X, Loader2, VolumeX, Volume2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { blocksApi } from '../lib/api/blocks';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface MutedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MutedUsersModal({ isOpen, onClose }: MutedUsersModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mutedUsers, setMutedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unmuting, setUnmuting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMutedUsers();
    }
  }, [isOpen]);

  const loadMutedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await blocksApi.getMutedUsers();
      if (response.success) {
        // Extract user data from nested structure
        const users = response.muted_users.map((item: any) => ({
          id: item.muted_id,
          ...(item.profiles || {}),
        }));
        setMutedUsers(users);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load muted users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnmute = async (userId: string, username: string) => {
    setUnmuting(userId);
    try {
      const response = await blocksApi.unmuteUser(userId);
      if (response.success) {
        toast.success(`@${username} has been unmuted`);
        await loadMutedUsers();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to unmute user');
    } finally {
      setUnmuting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} flex flex-col max-h-[90vh]`}>
        <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <VolumeX className="w-5 h-5" />
            Muted Users
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
          ) : mutedUsers.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <VolumeX className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No muted users</p>
              <p className="text-sm">Muted users' content will be hidden from your feed, but they can still see your content.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mutedUsers.map((user) => (
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
                    onClick={() => handleUnmute(user.id, user.username)}
                    disabled={unmuting === user.id}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {unmuting === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Unmute
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
