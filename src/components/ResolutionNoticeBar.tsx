import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { resolutionsApi } from '../lib/api/resolutions';
import { useNavigate } from 'react-router-dom';

export function ResolutionNoticeBar() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [pendingCount, setPendingCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isDismissed) {
      loadPendingCount();
    }
  }, [isAuthenticated, isDismissed]);

  const loadPendingCount = async () => {
    try {
      const response = await resolutionsApi.getPendingResolutions();
      if (response.success) {
        setPendingCount(response.counts.pending);
      }
    } catch (error) {
      console.error('Failed to load pending resolutions:', error);
    }
  };

  if (!isAuthenticated || pendingCount === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm">
            {pendingCount} prediction{pendingCount !== 1 ? 's' : ''} need{pendingCount === 1 ? 's' : ''} your decision
          </p>
          <p className="text-xs opacity-90">
            These predictions have expired and require your final decision
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/resolution-center')}
          className="bg-white text-red-500 hover:bg-red-50 font-bold px-4 py-2 rounded-lg text-sm transition"
        >
          Add Decisions
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-red-600 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

