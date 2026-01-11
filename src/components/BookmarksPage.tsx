import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { PredictionCard } from './PredictionCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Prediction } from '../types';
import { bookmarksApi } from '../lib/api/bookmarks';
import { toast } from 'sonner';

interface BookmarksPageProps {
  onProfileClick?: (username: string) => void;
}

export function BookmarksPage({ onProfileClick }: BookmarksPageProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadBookmarks = async () => {
    setIsLoading(true);
    try {
      const response = await bookmarksApi.getBookmarks(1, 20);
      if (response.success) {
        // Map bookmarks to Prediction format
        const predictions = response.bookmarks.map((bookmark: any) => {
          const pred = bookmark.prediction || bookmark;
          return {
            id: pred.id,
            userId: pred.creator_id || pred.creator?.id,
            username: pred.creator?.username || 'unknown',
            displayName: pred.creator?.full_name || pred.creator?.username || 'Unknown',
            userAvatar: pred.creator?.avatar_url,
            date: new Date(pred.created_at).toLocaleDateString(),
            question: pred.question,
            description: pred.description,
            endDate: new Date(pred.deadline).toLocaleDateString(),
            mediaType: pred.market_video ? 'video' : pred.market_image ? 'photo' : 'text',
            mediaUrl: pred.market_video || pred.market_image,
            xpPool: (pred.total_pot_xp || 0).toLocaleString(),
            xcPool: (pred.total_pot_xc || 0).toLocaleString(),
            yesPercentXP: pred.total_pot_xp > 0 ? ((pred.yes_pool_xp || 0) / pred.total_pot_xp * 100) : 50,
            noPercentXP: pred.total_pot_xp > 0 ? ((pred.no_pool_xp || 0) / pred.total_pot_xp * 100) : 50,
            yesPercentXC: pred.total_pot_xc > 0 ? ((pred.yes_pool_xc || 0) / pred.total_pot_xc * 100) : 50,
            noPercentXC: pred.total_pot_xc > 0 ? ((pred.no_pool_xc || 0) / pred.total_pot_xc * 100) : 50,
            yesMultiplier: '1.0x',
            noMultiplier: '1.0x',
            comments: pred.comments_count || 0,
            reposts: pred.reposts_count || 0,
            likes: pred.likes_count || 0,
            isLiked: pred.is_liked || false,
            isReposted: pred.is_reposted || false,
            category: pred.category || 'technology',
          };
        });
        setBookmarks(predictions);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Bookmarks
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bookmark className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          <h3 className="text-xl font-bold mb-2">Please login to view bookmarks</h3>
        </div>
      ) : bookmarks.length > 0 ? (
        <div>
          {bookmarks.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} onProfileClick={onProfileClick} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Bookmark className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Save predictions to easily find them later
          </p>
        </div>
      )}
    </div>
  );
}
