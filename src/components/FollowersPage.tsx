import { useState, useEffect } from 'react';
import { Users, Loader2, UserPlus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../lib/api/users';
import { socialApi } from '../lib/api/social';
import { toast } from 'sonner';

interface FollowersPageProps {
  username: string;
  onProfileClick?: (username: string) => void;
}

export function FollowersPage({ username, onProfileClick }: FollowersPageProps) {
  const { theme } = useTheme();
  const { isAuthenticated, userData } = useAuth();
  const isDark = theme === 'dark';
  const [followers, setFollowers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (username) {
      loadFollowers();
    }
  }, [username]);

  useEffect(() => {
    if (isAuthenticated && followers.length > 0) {
      loadFollowStatuses();
    }
  }, [followers, isAuthenticated]);

  const loadFollowers = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getFollowers(username, 1, 100);
      if (response.success && response.followers) {
        setFollowers(response.followers);
      }
    } catch (error: any) {
      console.error('Error loading followers:', error);
      toast.error(error.message || 'Failed to load followers');
      setFollowers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowStatuses = async () => {
    if (!userData?.id) return;
    const statuses: Record<string, boolean> = {};
    for (const follower of followers) {
      try {
        const response = await socialApi.getFollowStatus(follower.id);
        if (response.success) {
          statuses[follower.id] = response.following;
        }
      } catch {
        statuses[follower.id] = false;
      }
    }
    setFollowingStatus(statuses);
  };

  const handleFollow = async (userId: string, followerUsername: string) => {
    if (!isAuthenticated) return;

    const isFollowing = followingStatus[userId];
    try {
      const response = isFollowing
        ? await socialApi.unfollowUser(userId)
        : await socialApi.followUser(userId);
      
      if (response.success) {
        setFollowingStatus(prev => ({ ...prev, [userId]: response.following }));
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
            <Users className="w-6 h-6" />
            Followers
          </h1>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : followers.length === 0 ? (
          <div className="text-center py-20">
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <h3 className="text-xl font-bold mb-2">No followers yet</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              This user doesn't have any followers yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map((follower) => (
              <div
                key={follower.id}
                className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-4 flex items-center justify-between`}
              >
                <button
                  onClick={() => onProfileClick?.(follower.username)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"
                    style={{ backgroundImage: follower.avatar_url ? `url(${follower.avatar_url})` : undefined, backgroundSize: 'cover' }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{follower.full_name || follower.username}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      @{follower.username}
                    </div>
                    {follower.bio && (
                      <div className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'} line-clamp-1`}>
                        {follower.bio}
                      </div>
                    )}
                  </div>
                </button>
                {isAuthenticated && userData?.username !== follower.username && (
                  <button
                    onClick={() => handleFollow(follower.id, follower.username)}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                      followingStatus[follower.id]
                        ? isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {followingStatus[follower.id] ? 'Following' : 'Follow'}
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

