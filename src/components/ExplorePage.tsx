import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Zap, DollarSign, Gamepad2, Trophy, Globe, Loader2 } from 'lucide-react';
import { PredictionCard } from './PredictionCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Prediction } from '../types';
import { exploreApi } from '../lib/api/explore';
import { predictionsApi } from '../lib/api/predictions';
import { toast } from 'sonner';

type Category = 'trending' | 'Tech' | 'Crypto' | 'Sports' | 'Politics' | 'World';

interface ExplorePageProps {
  onProfileClick?: (username: string) => void;
}

const categories = [
  { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
  { id: 'Tech' as const, label: 'Technology', icon: Zap },
  { id: 'Crypto' as const, label: 'Crypto', icon: DollarSign },
  { id: 'Sports' as const, label: 'Sports', icon: Trophy },
  { id: 'Politics' as const, label: 'Politics', icon: Gamepad2 },
  { id: 'World' as const, label: 'Global', icon: Globe },
];

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
    category: apiPred.category || 'Tech',
  };
};


export function ExplorePage({ onProfileClick }: ExplorePageProps) {
  const { userData } = useAuth();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const isDark = theme === 'dark';
  
  // Determine initial category based on URL param or user interests
  const getInitialCategory = (): Category => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && ['Tech', 'Crypto', 'Sports', 'Politics', 'World', 'trending'].includes(categoryParam)) {
      return categoryParam as Category;
    }
    if (userData?.interests && userData.interests.length > 0) {
      const firstInterest = userData.interests[0];
      if (firstInterest === 'Tech' || firstInterest === 'Crypto' || 
          firstInterest === 'Sports' || firstInterest === 'Politics' || 
          firstInterest === 'World') {
        return firstInterest as Category;
      }
    }
    return 'trending';
  };

  const [selectedCategory, setSelectedCategory] = useState<Category>(getInitialCategory());
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    if (categoryParam && ['Tech', 'Crypto', 'Sports', 'Politics', 'World', 'trending'].includes(categoryParam)) {
      setSelectedCategory(categoryParam as Category);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPredictions();
  }, [selectedCategory, searchQuery]);

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      if (searchQuery.trim()) {
        // Search predictions
        const response = await exploreApi.search({
          q: searchQuery.trim(),
          type: 'predictions',
          page: 1,
          limit: 20,
        });
        if (response.success && response.predictions) {
          setPredictions(response.predictions.map(mapApiPrediction));
        }
      } else if (selectedCategory === 'trending') {
        const response = await exploreApi.getTrending('7d', 20);
        if (response.success && response.predictions) {
          setPredictions(response.predictions.map(mapApiPrediction));
        }
      } else {
        // Fetch predictions by category
        const response = await predictionsApi.getPredictions({
          category: selectedCategory,
          page: 1,
          limit: 20,
        });
        if (response.success && response.predictions) {
          setPredictions(response.predictions.map(mapApiPrediction));
        }
      }
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      toast.error(error.message || 'Failed to load predictions');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get personalized category order based on user interests
  const getPersonalizedCategories = () => {
    if (!userData?.interests || userData.interests.length === 0) {
      return categories;
    }
    
    const interestCategories = categories.filter(cat => 
      userData.interests?.includes(cat.id) && cat.id !== 'trending'
    );
    const otherCategories = categories.filter(cat => 
      !userData.interests?.includes(cat.id) && cat.id !== 'trending'
    );
    
    // Show trending first, then user interests, then others
    const trending = categories.find(cat => cat.id === 'trending');
    return trending 
      ? [trending, ...interestCategories, ...otherCategories]
      : [...interestCategories, ...otherCategories];
  };

  const personalizedCategories = getPersonalizedCategories();

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/95' : 'border-gray-200 bg-white/95'} backdrop-blur-md`}>
        <div className="px-0 lg:px-4 py-3">
          <h1 className="text-lg lg:text-xl font-bold mb-3 hidden lg:block px-4">
            Explore Predictions
          </h1>
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide">
              {personalizedCategories.map((category) => {
                const isUserInterest = userData?.interests?.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all snap-start flex-shrink-0 text-sm ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : isDark
                        ? 'bg-[#16181c] text-gray-400 hover:bg-gray-800 active:scale-95'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                    {isUserInterest && selectedCategory !== category.id && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Scroll indicators */}
            <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${isDark ? 'from-black/95' : 'from-white/95'} to-transparent pointer-events-none lg:hidden`}></div>
            <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${isDark ? 'from-black/95' : 'from-white/95'} to-transparent pointer-events-none lg:hidden`}></div>
          </div>
        </div>
      </div>
      
      <div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : predictions.length > 0 ? (
          predictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} onProfileClick={onProfileClick} onUpdate={fetchPredictions} />
          ))
        ) : (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No predictions found in this category
          </div>
        )}
      </div>
    </div>
  );
}