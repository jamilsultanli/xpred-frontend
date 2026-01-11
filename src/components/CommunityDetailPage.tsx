import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Loader2, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { PredictionCard } from './PredictionCard';
import { communitiesApi } from '../lib/api/communities';
import { Prediction } from '../types';
import { toast } from 'sonner';

// Helper function to map API prediction
const mapApiPrediction = (apiPred: any): Prediction => {
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
    username: apiPred.creator?.username || 'unknown',
    displayName: apiPred.creator?.full_name || apiPred.creator?.username || 'Unknown',
    userAvatar: apiPred.creator?.avatar_url,
    userTitle: apiPred.creator?.title,
    userAvatarFrame: apiPred.creator?.avatar_frame,
    userGreyTick: apiPred.creator?.grey_tick,
    userBlueTick: apiPred.creator?.blue_tick_active,
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

export function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [community, setCommunity] = useState<any>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (id) {
      loadCommunity();
      loadPredictions();
    }
  }, [id]);

  useEffect(() => {
    if (id && page > 1) {
      loadMorePredictions();
    }
  }, [page]);

  const loadCommunity = async () => {
    setIsLoading(true);
    try {
      const response = await communitiesApi.getCommunity(id!);
      if (response.success) {
        setCommunity(response.community);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load community');
      navigate('/communities');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPredictions = async () => {
    setIsLoadingPredictions(true);
    try {
      const response = await communitiesApi.getCommunityPredictions(id!, 1, 20);
      if (response.success && response.predictions) {
        setPredictions(response.predictions.map(mapApiPrediction));
        setHasMore(response.predictions.length === 20);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load predictions');
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  const loadMorePredictions = async () => {
    try {
      const response = await communitiesApi.getCommunityPredictions(id!, page, 20);
      if (response.success && response.predictions) {
        setPredictions(prev => [...prev, ...response.predictions.map(mapApiPrediction)]);
        setHasMore(response.predictions.length === 20);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load more predictions');
    }
  };

  const handleJoinToggle = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (community.isJoined) {
        await communitiesApi.leaveCommunity(community.id);
        toast.success('Left community');
      } else {
        await communitiesApi.joinCommunity(community.id);
        toast.success('Joined community');
      }
      await loadCommunity();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update community membership');
    }
  };

  const handleProfileClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Community not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/communities')}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Community</h1>
        </div>
      </div>

      {/* Banner */}
      <div 
        className="h-64 relative"
        style={{
          backgroundImage: community.banner_url ? `url(${community.banner_url})` : 'linear-gradient(to right, #3b82f6, #9333ea)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute bottom-4 left-4">
          <div 
            className="w-32 h-32 rounded-2xl border-4 border-black overflow-hidden"
            style={{
              backgroundImage: community.avatar_url ? `url(${community.avatar_url})` : 'linear-gradient(to bottom right, #a855f7, #ec4899)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
        </div>
      </div>

      {/* Community Info */}
      <div className={`px-4 pb-4 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-4 -mt-16 pt-20">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{community.name}</h2>
            {community.description && (
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {community.description}
              </p>
            )}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className="font-semibold">{community.members?.toLocaleString() || 0}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>members</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className="font-semibold">{community.predictions?.toLocaleString() || 0}</span>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>predictions</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleJoinToggle}
            className={`px-6 py-2.5 rounded-full font-bold transition-all ${
              community.isJoined
                ? isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {community.isJoined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>

      {/* Predictions */}
      <div>
        {isLoadingPredictions && predictions.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : predictions.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="text-lg font-semibold mb-2">No predictions yet</p>
            <p className="text-sm">Be the first to create a prediction in this community!</p>
          </div>
        ) : (
          <>
            {predictions.map((prediction) => (
              <PredictionCard 
                key={prediction.id} 
                prediction={prediction} 
                onProfileClick={handleProfileClick}
              />
            ))}
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                    isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

