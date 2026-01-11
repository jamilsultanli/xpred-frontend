import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Loader2, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { betsApi } from '../lib/api/bets';

interface AllActivePredictionsPageProps {
  onBack?: () => void;
}

export function AllActivePredictionsPage({ onBack }: AllActivePredictionsPageProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [activeBets, setActiveBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadActiveBets();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadActiveBets = async () => {
    setIsLoading(true);
    try {
      const response = await betsApi.getActivePredictions();
      if (response.success) {
        setActiveBets(response.bets || []);
      }
    } catch (error: any) {
      console.error('Failed to load active bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to view your active predictions</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-3 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            All Active Predictions
          </h1>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : activeBets.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <h3 className="text-xl font-bold mb-2">No active predictions</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You don't have any active predictions at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBets.map((bet) => (
              <div
                key={bet.id}
                className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-4`}
              >
                <div className="mb-3">
                  <div className="font-semibold text-base mb-2">{bet.prediction?.question || 'Unknown prediction'}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3" />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Ends {bet.prediction?.deadline ? new Date(bet.prediction.deadline).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Your Prediction</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        bet.choice === 'yes'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {bet.choice.toUpperCase()}
                      </span>
                      <span className="font-semibold">{bet.amount.toLocaleString()} {bet.currency}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Potential Win</div>
                    <div className="font-bold text-green-400">
                      {bet.potentialPayout ? `${bet.potentialPayout.toFixed(2)} ${bet.currency}` : 'Calculating...'}
                    </div>
                  </div>
                </div>

                {bet.currentOdds && (
                  <>
                    <div className={`h-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: `${bet.currentOdds.yes}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-green-400">Y {bet.currentOdds.yes}%</span>
                      <span className="text-red-400">N {bet.currentOdds.no}%</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

