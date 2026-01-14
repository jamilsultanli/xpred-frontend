import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { betsApi } from '../lib/api/bets';

interface ActiveBetsProps {
  variant?: 'home' | 'sidebar';
}

export function ActiveBets({ variant = 'home' }: ActiveBetsProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
        setActiveBets(response.bets);
      }
    } catch (error: any) {
      console.error('Failed to load active predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`${variant === 'home' ? `border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} p-4` : 'p-3'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          {variant === 'home' ? 'Your Active Predictions' : 'Active Predictions'}
        </h2>
        {activeBets.length > 2 && (
          <button
            onClick={() => {
              navigate('/active-predictions');
            }}
            className={`text-sm font-medium transition-colors hover:underline ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            View All
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : activeBets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active predictions
        </div>
      ) : (
        <div className="space-y-3">
          {activeBets.slice(0, 2).map((bet) => (
          <div
            key={bet.id}
            className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}
          >
            <div className="mb-3">
              <div className="font-semibold text-sm mb-2">{bet.prediction?.question || 'Unknown prediction'}</div>
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
  );
}
