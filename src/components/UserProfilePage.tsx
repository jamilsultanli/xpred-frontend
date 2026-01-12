import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, MoreHorizontal, Mail, Flag, UserX, Shield, Loader2, UserPlus, UserMinus, Send, Edit } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { PredictionCard } from './PredictionCard';
import { usersApi } from '../lib/api/users';
import { socialApi } from '../lib/api/social';
import { messagesApi } from '../lib/api/messages';
import { Prediction } from '../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { EditProfileModal } from './EditProfileModal';

interface UserProfilePageProps {
  username: string;
  onClose?: () => void;
}

// Helper function to map API prediction
const mapApiPrediction = (apiPred: any, username: string, displayName: string): Prediction => {
  const yesPercentXP = apiPred.total_pot_xp > 0 
    ? Math.round((apiPred.yes_pool_xp / apiPred.total_pot_xp) * 100) 
    : 50;
  const noPercentXP = 100 - yesPercentXP;
  const yesPercentXC = apiPred.total_pot_xc > 0 
    ? Math.round((apiPred.yes_pool_xc / apiPred.total_pot_xc) * 100) 
    : 50;
  const noPercentXC = 100 - yesPercentXC;

  const yesMultiplier = yesPercentXP > 0 ? (100 / yesPercentXP).toFixed(1) + 'x' : '1.0x';
  const noMultiplier = noPercentXP > 0 ? (100 / noPercentXP).toFixed(1) + 'x' : '1.0x';

  return {
    id: apiPred.id,
    userId: apiPred.creator_id,
    username: username,
    displayName: displayName,
    userAvatar: apiPred.creator?.avatar_url,
    userTitle: apiPred.creator?.title,
    userBlueTick: apiPred.creator?.blue_tick,
    userGreyTick: apiPred.creator?.grey_tick,
    date: new Date(apiPred.created_at).toLocaleDateString(),
    question: apiPred.question,
    description: apiPred.description,
    endDate: new Date(apiPred.deadline).toLocaleDateString(),
    mediaType: apiPred.market_video ? 'video' : apiPred.market_image ? 'photo' : 'text',
    mediaUrl: apiPred.market_video || apiPred.market_image,
    xpPool: (apiPred.total_pot_xp || 0).toLocaleString(),
    xcPool: (apiPred.total_pot_xc || 0).toLocaleString(),
    yesPercentXP,
    noPercentXP,
    yesPercentXC,
    noPercentXC,
    yesMultiplier,
    noMultiplier,
    comments: apiPred.comments_count || 0,
    reposts: apiPred.reposts_count || 0,
    likes: apiPred.likes_count || 0,
    isLiked: apiPred.is_liked || false,
    isReposted: apiPred.is_reposted || false,
    category: apiPred.category || 'Tech',
  };
};

export function UserProfilePage({ username }: UserProfilePageProps) {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal, userData } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'predictions' | 'completed' | 'likes' | 'media'>('predictions');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Handle profile click navigation
  const onProfileClick = (clickedUsername: string) => {
    if (clickedUsername && clickedUsername !== username) {
      navigate(`/user/${clickedUsername}`);
    }
  };

  useEffect(() => {
    if (username) {
      // Reset state when username changes
      setIsFollowing(false);
      setUser(null);
      setPredictions([]);
      fetchUserData();
    }
  }, [username]);

  // Fetch follow status after user data is loaded
  useEffect(() => {
    if (user?.id && isAuthenticated && userData?.id) {
      console.log('🎯 Dependencies ready - fetching follow status', {
        userId: user.id,
        currentUserId: userData.id,
        isAuthenticated
      });
      fetchFollowStatus();
    } else {
      console.log('⏭️ Waiting for dependencies:', {
        hasUserId: !!user?.id,
        hasCurrentUserId: !!userData?.id,
        isAuthenticated
      });
    }
  }, [user?.id, isAuthenticated, userData?.id]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'predictions') {
        fetchPredictions();
      } else if (activeTab === 'completed') {
        fetchCompletedPredictions();
      } else if (activeTab === 'likes') {
        fetchLikedPredictions();
      } else if (activeTab === 'media') {
        fetchMediaPredictions();
      }
    }
  }, [user, activeTab]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getByUsername(username);
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      toast.error(error.message || 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowStatus = async () => {
    if (!isAuthenticated || !userData?.id || !user?.id) {
      console.log('⏭️ Skipping fetchFollowStatus:', { isAuthenticated, hasUserData: !!userData?.id, hasUserId: !!user?.id });
      return;
    }
    
    try {
      console.log('🔍 Fetching follow status for user:', user.id);
      const response = await socialApi.getFollowStatus(user.id);
      console.log('📦 Follow status response:', response);
      
      if (response.success) {
        setIsFollowing(response.following);
        console.log('✅ Follow status set to:', response.following);
      }
    } catch (error) {
      console.error('❌ Error fetching follow status:', error);
      // Don't show error toast for follow status
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await usersApi.getPredictions(username, 1, 50);
      if (response.success && response.predictions) {
        const mapped = response.predictions.map((p: any) => 
          mapApiPrediction(p, user?.username || username, user?.full_name || user?.username || 'Unknown')
        );
        setPredictions(mapped);
      }
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
    }
  };

  const fetchLikedPredictions = async () => {
    try {
      // Fetch all predictions and filter liked ones
      const response = await usersApi.getPredictions(username, 1, 100);
      if (response.success && response.predictions) {
        const likedPredictions = response.predictions.filter((p: any) => p.is_liked);
        const mapped = likedPredictions.map((p: any) => 
          mapApiPrediction(p, user?.username || username, user?.full_name || user?.username || 'Unknown')
        );
        setPredictions(mapped);
      }
    } catch (error: any) {
      console.error('Error fetching liked predictions:', error);
      setPredictions([]);
    }
  };

  const fetchMediaPredictions = async () => {
    try {
      // Fetch all predictions and filter media ones
      const response = await usersApi.getPredictions(username, 1, 100);
      if (response.success && response.predictions) {
        const mediaPredictions = response.predictions.filter((p: any) => p.market_image || p.market_video);
        const mapped = mediaPredictions.map((p: any) => 
          mapApiPrediction(p, user?.username || username, user?.full_name || user?.username || 'Unknown')
        );
        setPredictions(mapped);
      }
    } catch (error: any) {
      console.error('Error fetching media predictions:', error);
      setPredictions([]);
    }
  };

  const fetchCompletedPredictions = async () => {
    try {
      // Fetch all predictions and filter resolved ones
      const response = await usersApi.getPredictions(username, 1, 100);
      if (response.success && response.predictions) {
        const completedPredictions = response.predictions.filter((p: any) => p.is_resolved);
        const mapped = completedPredictions.map((p: any) => 
          mapApiPrediction(p, user?.username || username, user?.full_name || user?.username || 'Unknown')
        );
        setPredictions(mapped);
      }
    } catch (error: any) {
      console.error('Error fetching completed predictions:', error);
      setPredictions([]);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    if (!user?.id) {
      toast.error('User not loaded yet');
      return;
    }
    
    setIsLoadingFollow(true);
    console.log('🔄 Toggling follow status. Current:', isFollowing);
    
    try {
      const response = isFollowing
        ? await socialApi.unfollowUser(user.id)
        : await socialApi.followUser(user.id);
      
      console.log('📦 Follow response:', response);
      
      if (response.success) {
        setIsFollowing(response.following);
        toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
        fetchUserData(); // Refresh to update follower count
      }
    } catch (error: any) {
      console.error('❌ Error toggling follow:', error);
      
      // Handle 409 Conflict (already following/unfollowing)
      if (error.status === 409 || error.response?.status === 409) {
        console.log('⚠️ Got 409 conflict, fetching actual status from backend');
        
        // Don't show error toast, just refresh the status silently
        try {
          const statusResponse = await socialApi.getFollowStatus(user.id);
          if (statusResponse.success) {
            console.log('✅ Refreshed follow status:', statusResponse.following);
            setIsFollowing(statusResponse.following);
          }
        } catch (statusError) {
          console.error('❌ Failed to refresh follow status:', statusError);
        }
        return;
      }
      
      // Other errors
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!user?.id) {
      toast.error('User profile not loaded yet. Please wait...');
      return;
    }

    try {
      console.log('Navigating to messages with user:', user.id);
      navigate(`/messages?user=${user.id}`);
    } catch (error: any) {
      console.error('Error navigating to messages:', error);
      toast.error('Failed to open conversation');
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="h-48 relative overflow-hidden">
        {user?.banner_url ? (
          <img 
            src={user.banner_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'bg-black/50 hover:bg-black/70' : 'bg-white/50 hover:bg-white/70'}`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
        
        {showMoreMenu && (
          <div className={`absolute top-14 right-4 ${isDark ? 'bg-[#16181c]' : 'bg-white'} rounded-xl shadow-xl border ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-hidden z-10`}>
            <button className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left`}>
              <Flag className="w-4 h-4" />
              Report User
            </button>
            <button className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left`}>
              <UserX className="w-4 h-4" />
              Block User
            </button>
            <button className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left`}>
              <Shield className="w-4 h-4" />
              Mute User
            </button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className={`px-4 pb-4 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-4 relative">
          <div className="relative -mt-20">
            <div 
              className="w-32 h-32 rounded-full border-4 overflow-hidden"
              style={{
                borderColor: isDark ? '#000' : '#fff',
                backgroundImage: user?.avatar_url ? `url(${user.avatar_url})` : 'linear-gradient(to bottom right, #a855f7, #ec4899)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!user?.avatar_url && (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {isLoading ? (
              // Show skeleton loaders while loading
              <div className="flex gap-2">
                <div className={`w-32 h-10 rounded-full animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                <div className={`w-28 h-10 rounded-full animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              </div>
            ) : userData?.username === username ? (
              // Own profile - show Edit Profile button
              <button
                onClick={() => setShowEditProfile(true)}
                className={`px-4 py-2.5 rounded-full border transition-colors flex items-center gap-2 font-semibold ${
                  isDark 
                    ? 'border-gray-800 hover:bg-gray-800 text-white' 
                    : 'border-gray-200 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            ) : user ? (
              // Other user's profile - show Send Message and Follow buttons (only when user data loaded)
              <>
                <button
                  onClick={handleMessage}
                  className={`px-4 py-2.5 rounded-full border transition-colors flex items-center gap-2 font-semibold ${
                    isDark 
                      ? 'border-gray-800 hover:bg-gray-800 text-white' 
                      : 'border-gray-200 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send Message</span>
                  <span className="sm:hidden">Message</span>
                </button>
                <button
                  onClick={handleFollow}
                  disabled={isLoadingFollow}
                  className={`px-6 py-2.5 rounded-full font-bold transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    isFollowing
                      ? isDark 
                        ? 'bg-transparent border border-gray-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500' 
                        : 'bg-transparent border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                  title={`Current state: ${isFollowing ? 'Following' : 'Not Following'}`}
                >
                  {isLoadingFollow ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : user ? (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{user.full_name || user.username}</h1>
                {user.blue_tick && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {user.grey_tick && !user.blue_tick && (
                  <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-1`}>@{user.username}</div>
              {user.title && (
                <div className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {user.title}
                </div>
              )}
            </div>

            {user.bio && <p className="mb-3">{user.bio}</p>}

            <div className={`flex flex-wrap gap-4 text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.city && user.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.city}, {user.country}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {user.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

        <div className={`flex gap-6 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Link 
            to={`/user/${user.username}/followers`}
            className="hover:underline flex items-center gap-1"
          >
            <span className="font-bold text-lg">{user.followers_count || 0}</span>
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Followers</span>
          </Link>
          <Link 
            to={`/user/${user.username}/following`}
            className="hover:underline flex items-center gap-1"
          >
            <span className="font-bold text-lg">{user.following_count || 0}</span>
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Following</span>
          </Link>
        </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Only show balance if viewing own profile */}
              {isAuthenticated && userData?.id === user?.id ? (
                <>
                  <div className={`${isDark ? 'bg-[#16181c]' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                    <div className="text-2xl font-bold text-blue-500">
                      {user.balance_xp ? (user.balance_xp >= 1000000 ? `${(user.balance_xp / 1000000).toFixed(1)}M` : user.balance_xp >= 1000 ? `${(user.balance_xp / 1000).toFixed(0)}K` : user.balance_xp) : '0'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total XP</div>
                  </div>
                  <div className={`${isDark ? 'bg-[#16181c]' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                    <div className="text-2xl font-bold text-purple-500">
                      {user.balance_xc ? user.balance_xc.toLocaleString() : '0'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total XC</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={`${isDark ? 'bg-[#16181c]' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                    <div className="text-2xl font-bold text-blue-500">***</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total XP</div>
                  </div>
                  <div className={`${isDark ? 'bg-[#16181c]' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                    <div className="text-2xl font-bold text-purple-500">***</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total XC</div>
                  </div>
                </>
              )}
              <div className={`${isDark ? 'bg-[#16181c]' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold text-green-500">{user.predictions_count || 0}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Predictions</div>
              </div>
              <div className={`${isDark ? 'bg-[#16181c]' : 'bg-gray-100'} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold text-yellow-500">{user.win_rate ? Math.round(user.win_rate * 100) : 0}%</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Win Rate</div>
              </div>
            </div>
          </>
        ) : (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            User not found
          </div>
        )}

        {/* Tabs */}
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} flex`}>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`flex-1 py-4 font-semibold transition-colors ${
              activeTab === 'predictions'
                ? 'border-b-4 border-blue-500'
                : isDark ? 'text-gray-400 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-4 font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'border-b-4 border-blue-500'
                : isDark ? 'text-gray-400 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-4 font-semibold transition-colors ${
              activeTab === 'likes'
                ? 'border-b-4 border-blue-500'
                : isDark ? 'text-gray-400 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Likes
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-4 font-semibold transition-colors ${
              activeTab === 'media'
                ? 'border-b-4 border-blue-500'
                : isDark ? 'text-gray-400 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Media
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'predictions' && (
          predictions.length > 0 ? (
            predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))
          ) : (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No active predictions yet
            </div>
          )
        )}
        {activeTab === 'completed' && (
          predictions.length > 0 ? (
            predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} onProfileClick={onProfileClick} />
            ))
          ) : (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No completed predictions yet
            </div>
          )
        )}
        {activeTab === 'likes' && (
          predictions.length > 0 ? (
            predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} onProfileClick={onProfileClick} />
            ))
          ) : (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No liked predictions yet
            </div>
          )
        )}
        {activeTab === 'media' && (
          predictions.length > 0 ? (
            predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} onProfileClick={onProfileClick} />
            ))
          ) : (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No media predictions yet
            </div>
          )
        )}
      </div>

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onUpdate={async () => {
          // Reload user data after update
          await fetchUserData();
        }}
      />
    </div>
  );
}
