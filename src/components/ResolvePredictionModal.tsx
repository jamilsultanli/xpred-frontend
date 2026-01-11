import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { predictionsApi } from '../lib/api/predictions';
import { toast } from 'sonner';

interface ResolvePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: {
    id: string;
    question: string;
    deadline: string;
  };
  onResolved?: () => void;
}

export function ResolvePredictionModal({ 
  isOpen, 
  onClose, 
  prediction,
  onResolved 
}: ResolvePredictionModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [reason, setReason] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOutcome(null);
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResolve = async () => {
    if (outcome === null) {
      toast.error('Please select an outcome');
      return;
    }

    setIsResolving(true);
    try {
      const response = await predictionsApi.resolvePrediction(
        prediction.id,
        outcome,
        reason.trim() || undefined
      );

      if (response.success) {
        toast.success(`Prediction resolved as ${outcome ? 'YES' : 'NO'}`);
        onResolved?.();
        onClose();
      } else {
        toast.error('Failed to resolve prediction');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.message || 'Failed to resolve prediction');
    } finally {
      setIsResolving(false);
    }
  };

  const deadlineDate = new Date(prediction.deadline);
  const isExpired = deadlineDate < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md mx-4 rounded-2xl shadow-2xl ${
        isDark ? 'bg-[#16181c] border border-gray-800' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-6 h-6 ${isExpired ? 'text-orange-500' : 'text-blue-500'}`} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Resolve Prediction
            </h2>
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
        <div className="p-6 space-y-6">
          {/* Prediction Question */}
          <div>
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Prediction Question
            </p>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {prediction.question}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Deadline: {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString()}
            </p>
          </div>

          {/* Outcome Selection */}
          <div>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              What was the outcome?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOutcome(true)}
                disabled={isResolving}
                className={`p-4 rounded-xl border-2 transition-all ${
                  outcome === true
                    ? 'border-green-500 bg-green-500/10'
                    : isDark
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                } ${isResolving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                  outcome === true ? 'text-green-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <span className={`font-semibold ${
                  outcome === true ? 'text-green-500' : isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  YES
                </span>
              </button>

              <button
                onClick={() => setOutcome(false)}
                disabled={isResolving}
                className={`p-4 rounded-xl border-2 transition-all ${
                  outcome === false
                    ? 'border-red-500 bg-red-500/10'
                    : isDark
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                } ${isResolving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <XCircle className={`w-6 h-6 mx-auto mb-2 ${
                  outcome === false ? 'text-red-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <span className={`font-semibold ${
                  outcome === false ? 'text-red-500' : isDark ? 'text-gray-900' : 'text-gray-900'
                }`}>
                  NO
                </span>
              </button>
            </div>
          </div>

          {/* Reason (Optional) */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isResolving}
              placeholder="Explain why this outcome was chosen..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                isDark 
                  ? 'bg-black border-gray-800 text-white placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              } ${isResolving ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            disabled={isResolving}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            } ${isResolving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={isResolving || outcome === null}
            className={`px-6 py-2 rounded-xl font-semibold text-white transition-colors flex items-center gap-2 ${
              outcome === null || isResolving
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isResolving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resolving...
              </>
            ) : (
              'Resolve Prediction'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

