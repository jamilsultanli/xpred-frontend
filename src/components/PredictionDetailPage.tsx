import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { predictionsApi } from '../lib/api/predictions';
import { slugify } from '../lib/slugify';
import { PredictionCard } from './PredictionCard';
import type { Prediction as UiPrediction } from '../types';

const mapApiPredictionToUi = (apiPred: any): UiPrediction => {
  const yesPercentXP =
    apiPred.total_pot_xp > 0 ? Math.round((apiPred.yes_pool_xp / apiPred.total_pot_xp) * 100) : 50;
  const noPercentXP = 100 - yesPercentXP;
  const yesPercentXC =
    apiPred.total_pot_xc > 0 ? Math.round((apiPred.yes_pool_xc / apiPred.total_pot_xc) * 100) : 50;
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

export function PredictionDetailPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { id, slug } = useParams<{ id: string; slug?: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [uiPrediction, setUiPrediction] = useState<UiPrediction | null>(null);
  const canonicalSlug = useMemo(() => (uiPrediction ? slugify(uiPrediction.question) : null), [uiPrediction]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setUiPrediction(null);

    (async () => {
      try {
        const resp = await predictionsApi.getPrediction(id);
        if (resp.success && resp.prediction) {
          setUiPrediction(mapApiPredictionToUi(resp.prediction));
        } else {
          setUiPrediction(null);
        }
      } catch {
        setUiPrediction(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  // Canonical slug redirect (no duplicates)
  useEffect(() => {
    if (!id || !canonicalSlug) return;
    const current = (slug || '').trim();
    if (current !== canonicalSlug) {
      navigate(`/prediction/${id}/${canonicalSlug}`, { replace: true });
    }
  }, [id, slug, canonicalSlug, navigate]);

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!uiPrediction) {
    return (
      <div className={`p-10 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Prediction not found.
      </div>
    );
  }

  return (
    <div className="pb-10">
      <PredictionCard
        prediction={uiPrediction}
        onProfileClick={(username) => navigate(`/user/${username}`)}
      />
    </div>
  );
}


