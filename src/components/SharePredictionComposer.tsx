import { useTheme } from '../contexts/ThemeContext';
import { ImagePlus, Plus } from 'lucide-react';

interface SharePredictionComposerProps {
  isAuthenticated: boolean;
  avatarUrl?: string;
  displayName?: string;
  username?: string;
  onCompose: () => void;
}

export function SharePredictionComposer({
  isAuthenticated,
  avatarUrl,
  displayName,
  username,
  onCompose,
}: SharePredictionComposerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-4 py-4`}>
      <div className="flex gap-3">
        <div
          className={`w-10 h-10 rounded-full flex-shrink-0 ${isDark ? 'bg-[#16181c]' : 'bg-gray-100'}`}
          style={{
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-label="Your avatar"
        />

        <button
          onClick={onCompose}
          className={`flex-1 text-left rounded-2xl px-4 py-3 transition-colors ${
            isDark ? 'bg-[#16181c] hover:bg-[#1f2329]' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {isAuthenticated
              ? `Share a prediction${displayName || username ? `, ${displayName || username}` : ''}…`
              : 'Sign in to share a prediction…'}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Like Twitter/Meta: tap to open the composer
          </div>
        </button>

        <button
          onClick={onCompose}
          className="w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors flex-shrink-0"
          title="Share Prediction"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4 ml-12">
        <button
          onClick={onCompose}
          className={`inline-flex items-center gap-2 text-sm font-medium ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          <ImagePlus className="w-4 h-4" />
          Add photo / video
        </button>
      </div>
    </div>
  );
}


