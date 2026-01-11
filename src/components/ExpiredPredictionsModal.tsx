import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { predictionsApi } from '../lib/api/predictions';
import { ResolvePredictionModal } from './ResolvePredictionModal';
import { toast } from 'sonner';

interface ExpiredPrediction {
  id: string;
  question: string;
  description?: string;
  deadline: string;
  category?: string;
  is_resolved: boolean;
}

interface ExpiredPredictionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpiredPredictionsModal({ isOpen, onClose }: ExpiredPredictionsModalProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [expiredPredictions, setExpiredPredictions] = useState<ExpiredPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<ExpiredPrediction | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadExpiredPredictions();
    }
  }, [isOpen, isAuthenticated]);

  const loadExpiredPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await predictionsApi.getExpiredPredictions();
      if (response.success) {
        setExpiredPredictions(response.predictions || []);
      }
    } catch (error: any) {
      console.error('Failed to load expired predictions:', error);
      toast.error('Failed to load expired predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = (prediction: ExpiredPrediction) => {
    setSelectedPrediction(prediction);
    setShowResolveModal(true);
  };

  const handleResolved = () => {
    loadExpiredPredictions();
    if (expiredPredictions.length === 1) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const unresolvedCount = expiredPredictions.filter(p => !p.is_resolved).length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`w-full max-w-2xl mx-4 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col ${
          isDark ? 'bg-[#16181c] border border-gray-800' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Expired Predictions
                </h2>
                {unresolvedCount > 0 && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {unresolvedCount} prediction{unresolvedCount !== 1 ? 's' : ''} need{unresolvedCount === 1 ? 's' : ''} resolution
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : expiredPredictions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  All caught up!
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You don't have any expired predictions that need resolution.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiredPredictions.map((prediction) => {
                  const deadlineDate = new Date(prediction.deadline);
                  const daysSinceExpired = Math.floor(
                    (Date.now() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={prediction.id}
                      className={`p-4 rounded-xl border ${
                        prediction.is_resolved
                          ? isDark
                            ? 'bg-gray-900/50 border-gray-800'
                            : 'bg-gray-50 border-gray-200'
                          : isDark
                          ? 'bg-orange-500/10 border-orange-500/30'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {prediction.is_resolved ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-orange-500" />
                            )}
                            <h3 className={`font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {prediction.question}
                            </h3>
                          </div>
                          {prediction.description && (
                            <p className={`text-sm mb-2 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {prediction.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs">
                            <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                              Expired: {deadlineDate.toLocaleDateString()}
                            </span>
                            {daysSinceExpired > 0 && (
                              <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                                {daysSinceExpired} day{daysSinceExpired !== 1 ? 's' : ''} ago
                              </span>
                            )}
                            {prediction.category && (
                              <span className={`px-2 py-1 rounded ${
                                isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {prediction.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {!prediction.is_resolved && (
                          <button
                            onClick={() => handleResolve(prediction)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {selectedPrediction && (
        <ResolvePredictionModal
          isOpen={showResolveModal}
          onClose={() => {
            setShowResolveModal(false);
            setSelectedPrediction(null);
          }}
          prediction={selectedPrediction}
          onResolved={handleResolved}
        />
      )}
    </>
  );
}

