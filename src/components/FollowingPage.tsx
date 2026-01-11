import { useState, useEffect } from 'react';
import { UserPlus, Loader2, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../lib/api/users';
import { socialApi } from '../lib/api/social';
import { toast } from 'sonner';

interface FollowingPageProps {
  username: string;
  onProfileClick?: (username: string) => void;
}

export function FollowingPage({ username, onProfileClick }: FollowingPageProps) {
  const { theme } = useTheme();
  const { isAuthenticated, userData } = useAuth();
  const isDark = theme === 'dark';
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (username) {
      loadFollowing();
    }
  }, [username]);

  useEffect(() => {
    if (isAuthenticated && following.length > 0) {
      loadFollowStatuses();
    }
  }, [following, isAuthenticated]);

  const loadFollowing = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getFollowing(username, 1, 100);
      if (response.success && response.following) {
        setFollowing(response.following);
        // Initialize all as following since they're in the following list
        const statuses: Record<string, boolean> = {};
        response.following.forEach((user: any) => {
          statuses[user.id] = true;
        });
        setFollowingStatus(statuses);
      }
    } catch (error: any) {
      console.error('Error loading following:', error);
      toast.error(error.message || 'Failed to load following');
      setFollowing([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowStatuses = async () => {
    if (!userData?.id) return;
    const statuses: Record<string, boolean> = {};
    for (const user of following) {
      try {
        const response = await socialApi.getFollowStatus(user.id);
        if (response.success) {
          statuses[user.id] = response.following;
        }
      } catch {
        statuses[user.id] = false;
      }
    }
    setFollowingStatus(statuses);
  };

  const handleFollow = async (userId: string, targetUsername: string) => {
    if (!isAuthenticated) return;

    const isFollowing = followingStatus[userId];
    try {
      const response = isFollowing
        ? await socialApi.unfollowUser(userId)
        : await socialApi.followUser(userId);
      
      if (response.success) {
        setFollowingStatus(prev => ({ ...prev, [userId]: response.following }));
        if (isFollowing) {
          setFollowing(prev => prev.filter(u => u.id !== userId));
        }
        toast.success(isFollowing ? 'Unfollowed' : 'Following');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    }
  };

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            Following
          </h1>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : following.length === 0 ? (
          <div className="text-center py-20">
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <h3 className="text-xl font-bold mb-2">Not following anyone</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              This user is not following anyone yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((user) => (
              <div
                key={user.id}
                className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-4 flex items-center justify-between`}
              >
                <button
                  onClick={() => onProfileClick?.(user.username)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"
                    style={{ backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : undefined, backgroundSize: 'cover' }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{user.full_name || user.username}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      @{user.username}
                    </div>
                    {user.bio && (
                      <div className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'} line-clamp-1`}>
                        {user.bio}
                      </div>
                    )}
                  </div>
                </button>
                {isAuthenticated && userData?.username !== user.username && (
                  <button
                    onClick={() => handleFollow(user.id, user.username)}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                      followingStatus[user.id]
                        ? isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {followingStatus[user.id] ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

