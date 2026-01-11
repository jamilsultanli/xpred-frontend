import { useState, useEffect } from 'react';
import { PredictionCard } from './PredictionCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Prediction } from '../types';
import { predictionsApi } from '../lib/api/predictions';
import { Loader2 } from 'lucide-react';

interface PredictionFeedProps {
  onProfileClick?: (username: string) => void;
  newPrediction?: any; // New prediction to prepend to feed
}

// Helper function to map API prediction to frontend Prediction type
const mapApiPrediction = (apiPred: any): Prediction => {
  const yesPercentXP = apiPred.total_pot_xp > 0 
    ? Math.round((apiPred.yes_pool_xp / apiPred.total_pot_xp) * 100) 
    : 50;
  const noPercentXP = 100 - yesPercentXP;
  const yesPercentXC = apiPred.total_pot_xc > 0 
    ? Math.round((apiPred.yes_pool_xc / apiPred.total_pot_xc) * 100) 
    : 50;
  const noPercentXC = 100 - yesPercentXC;

  // Calculate multipliers (simplified)
  const yesMultiplier = yesPercentXP > 0 ? (100 / yesPercentXP).toFixed(1) + 'x' : '1.0x';
  const noMultiplier = noPercentXP > 0 ? (100 / noPercentXP).toFixed(1) + 'x' : '1.0x';

  return {
    id: apiPred.id,
    userId: apiPred.creator_id,
    username: apiPred.creator?.username || 'unknown',
    displayName: apiPred.creator?.full_name || apiPred.creator?.username || 'Unknown',
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
    category: apiPred.category || 'technology',
  };
};

// Fallback predictions for demo
const fallbackPredictions: Prediction[] = [
  {
    id: 1,
    userId: 'user1',
    username: 'techguru',
    displayName: 'Tech Guru',
    date: '5h',
    question: 'Will OpenAI release GPT-5 before June 2026?',
    description: 'Given the development timeline and recent announcements, I think we\'re closer than ever.',
    endDate: 'Jun 1, 2026',
    mediaType: 'text',
    xpPool: '145,892',
    xcPool: '1,245',
    yesPercentXP: 65,
    noPercentXP: 35,
    yesPercentXC: 58,
    noPercentXC: 42,
    yesMultiplier: '1.5x',
    noMultiplier: '2.8x',
    comments: 456,
    reposts: 128,
    likes: 2341,
    category: 'technology',
  },
  {
    id: 2,
    userId: 'user2',
    username: 'cryptoking',
    displayName: 'Crypto King',
    date: '8h',
    question: 'Bitcoin to reach $200,000 by end of 2026?',
    description: 'Based on historical patterns and current market conditions, Bitcoin is showing strong bullish signals.',
    endDate: 'Dec 31, 2026',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800',
    xpPool: '234,567',
    xcPool: '2,890',
    yesPercentXP: 72,
    noPercentXP: 28,
    yesPercentXC: 68,
    noPercentXC: 32,
    yesMultiplier: '1.4x',
    noMultiplier: '3.6x',
    comments: 892,
    reposts: 234,
    likes: 4521,
    category: 'crypto',
  },
  {
    id: 3,
    userId: 'user3',
    username: 'sportsfan',
    displayName: 'Sports Fan',
    date: '10h',
    question: 'Will Messi win another Ballon d\'Or in 2026?',
    description: 'At 38, Messi is still performing at an elite level. His leadership at Inter Miami could seal another award.',
    endDate: 'Dec 1, 2026',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    xpPool: '67,890',
    xcPool: '523',
    yesPercentXP: 38,
    noPercentXP: 62,
    yesPercentXC: 35,
    noPercentXC: 65,
    yesMultiplier: '2.6x',
    noMultiplier: '1.6x',
    comments: 345,
    reposts: 89,
    likes: 1567,
    category: 'sports',
  },
  {
    id: 4,
    userId: 'user4',
    username: 'politico',
    displayName: 'Political Analyst',
    date: '12h',
    question: 'Will there be a major election upset in 2026?',
    endDate: 'Nov 30, 2026',
    mediaType: 'text',
    xpPool: '98,765',
    xcPool: '892',
    yesPercentXP: 50,
    noPercentXP: 50,
    yesPercentXC: 48,
    noPercentXC: 52,
    yesMultiplier: '2.0x',
    noMultiplier: '2.0x',
    comments: 678,
    reposts: 234,
    likes: 3456,
    category: 'politics',
  },
  {
    id: 5,
    userId: 'user5',
    username: 'moviebuff',
    displayName: 'Movie Buff',
    date: '14h',
    question: 'Will Avatar 3 break box office records in 2026?',
    description: 'Cameron has never disappointed. With the hype building, this could be massive.',
    endDate: 'Dec 31, 2026',
    mediaType: 'video',
    mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    xpPool: '123,456',
    xcPool: '987',
    yesPercentXP: 68,
    noPercentXP: 32,
    yesPercentXC: 65,
    noPercentXC: 35,
    yesMultiplier: '1.5x',
    noMultiplier: '3.1x',
    comments: 234,
    reposts: 156,
    likes: 2890,
    category: 'entertainment',
  },
  {
    id: 6,
    userId: 'user6',
    username: 'sciencegeek',
    displayName: 'Science Geek',
    date: '16h',
    question: 'Will we discover signs of life on Mars in 2026?',
    description: 'NASA\'s Perseverance rover has been collecting promising samples. This could be the year!',
    endDate: 'Dec 31, 2026',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800',
    xpPool: '89,234',
    xcPool: '734',
    yesPercentXP: 25,
    noPercentXP: 75,
    yesPercentXC: 22,
    noPercentXC: 78,
    yesMultiplier: '4.0x',
    noMultiplier: '1.3x',
    comments: 567,
    reposts: 201,
    likes: 3421,
    category: 'science',
  },
  {
    id: 7,
    userId: 'user7',
    username: 'aiexpert',
    displayName: 'AI Expert',
    date: '18h',
    question: 'Will Apple release AR glasses in 2026?',
    description: 'All signs point to a 2026 launch. Apple has been working on this for years.',
    endDate: 'Dec 31, 2026',
    mediaType: 'text',
    xpPool: '156,789',
    xcPool: '1,234',
    yesPercentXP: 55,
    noPercentXP: 45,
    yesPercentXC: 52,
    noPercentXC: 48,
    yesMultiplier: '1.8x',
    noMultiplier: '2.2x',
    comments: 445,
    reposts: 178,
    likes: 2987,
    category: 'technology',
  },
  {
    id: 8,
    userId: 'user8',
    username: 'defimaster',
    displayName: 'DeFi Master',
    date: '20h',
    question: 'Will Ethereum 3.0 launch in 2026?',
    endDate: 'Dec 31, 2026',
    mediaType: 'text',
    xpPool: '178,234',
    xcPool: '1,567',
    yesPercentXP: 42,
    noPercentXP: 58,
    yesPercentXC: 45,
    noPercentXC: 55,
    yesMultiplier: '2.4x',
    noMultiplier: '1.7x',
    comments: 678,
    reposts: 234,
    likes: 3890,
    category: 'crypto',
  },
  {
    id: 9,
    userId: 'user9',
    username: 'globalwatch',
    displayName: 'Global Watcher',
    date: '1d',
    question: 'Will global temperatures increase by 1.5°C in 2026?',
    description: 'Climate data shows we\'re approaching this critical threshold faster than predicted.',
    endDate: 'Dec 31, 2026',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
    xpPool: '145,678',
    xcPool: '1,123',
    yesPercentXP: 70,
    noPercentXP: 30,
    yesPercentXC: 68,
    noPercentXC: 32,
    yesMultiplier: '1.4x',
    noMultiplier: '3.3x',
    comments: 789,
    reposts: 312,
    likes: 4234,
    category: 'global',
  },
  {
    id: 10,
    userId: 'user10',
    username: 'bizpro',
    displayName: 'Business Pro',
    date: '1d',
    question: 'Will Tesla stock hit $500 in 2026?',
    description: 'With new models launching and expansion into new markets, Tesla is positioned for growth.',
    endDate: 'Dec 31, 2026',
    mediaType: 'text',
    xpPool: '201,345',
    xcPool: '1,890',
    yesPercentXP: 63,
    noPercentXP: 37,
    yesPercentXC: 60,
    noPercentXC: 40,
    yesMultiplier: '1.6x',
    noMultiplier: '2.7x',
    comments: 523,
    reposts: 198,
    likes: 3678,
    category: 'business',
  },
];

export function PredictionFeed({ onProfileClick, newPrediction }: PredictionFeedProps) {
  const { theme } = useTheme();
  const { userData, isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Handle new prediction from create modal
  useEffect(() => {
    if (newPrediction) {
      const mapped = mapApiPrediction(newPrediction);
      setPredictions(prev => [mapped, ...prev]);
    }
  }, [newPrediction]);

  useEffect(() => {
    loadPredictions();
  }, [activeTab]);

  const loadPredictions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await predictionsApi.getPredictions({
        page: 1,
        limit: 20,
        status: 'active',
        sort: activeTab === 'foryou' ? 'trending' : 'newest',
      });

      if (response.success) {
        const mapped = response.predictions.map(mapApiPrediction);
        setPredictions(mapped);
      } else {
        setError('Failed to load predictions');
        // Use fallback predictions
        setPredictions(fallbackPredictions);
      }
    } catch (err: any) {
      console.error('Error loading predictions:', err);
      setError(err.message || 'Failed to load predictions');
      // Use fallback predictions on error
      setPredictions(fallbackPredictions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrediction = (predictionId: string | number) => {
    // Remove from local state immediately for instant feedback
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
  };

  // Personalize feed based on user interests
  const getPersonalizedFeed = (): Prediction[] => {
    if (!userData?.interests || userData.interests.length === 0) {
      return predictions;
    }

    // Prioritize predictions from user's interests
    const interestPredictions = predictions.filter(p => 
      userData.interests?.includes(p.category)
    );
    const otherPredictions = predictions.filter(p => 
      !userData.interests?.includes(p.category)
    );

    // Mix: 70% from interests, 30% discovery
    const interestCount = Math.ceil(predictions.length * 0.7);
    return [
      ...interestPredictions.slice(0, interestCount),
      ...otherPredictions.slice(0, predictions.length - interestCount)
    ];
  };

  const feedPredictions = activeTab === 'foryou' 
    ? getPersonalizedFeed()
    : predictions.slice(0, 3); // Following would show predictions from followed users

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/95' : 'border-gray-200 bg-white/95'} backdrop-blur-md`}>
        <div className="flex">
          <button 
            onClick={() => setActiveTab('foryou')}
            className={`flex-1 py-3 lg:py-4 transition-all font-bold relative text-sm lg:text-base active:scale-95 ${
              activeTab === 'foryou' 
                ? '' 
                : isDark ? 'text-gray-400 hover:bg-gray-900/50' : 'text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            For You
            {activeTab === 'foryou' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 lg:py-4 transition-all font-bold relative text-sm lg:text-base active:scale-95 ${
              activeTab === 'following' 
                ? '' 
                : isDark ? 'text-gray-400 hover:bg-gray-900/50' : 'text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            Following
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error && predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={loadPredictions}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-all"
          >
            Retry
          </button>
        </div>
      ) : activeTab === 'foryou' ? (
        <div>
          {feedPredictions.length > 0 ? (
            feedPredictions.map((prediction) => (
              <PredictionCard 
                key={prediction.id} 
                prediction={prediction} 
                onProfileClick={onProfileClick}
                onDelete={handleDeletePrediction}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className={`text-6xl mb-4`}>🔮</div>
              <h3 className="text-xl font-bold mb-2 text-center">No predictions yet</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 text-center`}>
                Be the first to create a prediction!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {feedPredictions.length > 0 ? (
            feedPredictions.map((prediction) => (
              <PredictionCard 
                key={prediction.id} 
                prediction={prediction} 
                onProfileClick={onProfileClick}
                onDelete={handleDeletePrediction}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className={`text-6xl mb-4`}>👥</div>
              <h3 className="text-xl font-bold mb-2 text-center">No predictions yet</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 text-center`}>
                Follow users to see their predictions here
              </p>
              <button 
                onClick={() => window.location.href = '#'}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-all active:scale-95"
              >
                Find people to follow
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}