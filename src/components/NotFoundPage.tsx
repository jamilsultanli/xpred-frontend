import { useNavigate } from 'react-router-dom';
import { Home, Search, TrendingUp, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full ${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl p-8 lg:p-12 text-center`}>
        <div className="mb-6">
          <div className="relative inline-block">
            <div className={`text-8xl lg:text-9xl font-bold ${isDark ? 'text-gray-800' : 'text-gray-200'}`}>
              404
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <TrendingUp className="w-16 h-16 lg:w-20 lg:h-20 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>

        <h1 className={`text-2xl lg:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          I predict you're on the wrong page! 🎯
        </h1>
        
        <p className={`text-base lg:text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          The page you're looking for doesn't exist. Maybe it was moved, deleted, or you typed the wrong URL.
        </p>

        <div className={`p-4 rounded-xl mb-8 ${isDark ? 'bg-black/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-sm lg:text-base font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Do you want to go to the home page?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <Home className="w-5 h-5" />
              Yes, take me home
            </button>
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              No, go back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/explore')}
            className={`p-4 rounded-xl border transition-all hover:scale-105 ${
              isDark 
                ? 'border-gray-800 hover:bg-gray-800' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Search className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Explore</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Discover predictions
            </div>
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className={`p-4 rounded-xl border transition-all hover:scale-105 ${
              isDark 
                ? 'border-gray-800 hover:bg-gray-800' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Leaderboard</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Top predictors
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

