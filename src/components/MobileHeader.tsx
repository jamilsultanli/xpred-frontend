import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Settings, LogIn, TrendingUp, Users, ChevronLeft, Trophy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export function MobileHeader() {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'For You';
    if (path.startsWith('/explore')) return 'Explore';
    if (path.startsWith('/leaderboard')) return 'Leaderboard';
    if (path.startsWith('/communities')) return 'Community';
    if (path.startsWith('/messages')) return 'Messages';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/bookmarks')) return 'Bookmarks';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/user/')) return 'Profile';
    return 'Xpred';
  };

  const getPageIcon = () => {
    const path = location.pathname;
    if (path.startsWith('/leaderboard')) return Trophy;
    if (path.startsWith('/communities')) return Users;
    return null;
  };

  const showBackButton = ['/messages', '/settings', '/bookmarks'].some(path => location.pathname.startsWith(path)) || location.pathname.startsWith('/user/');

  const PageIcon = getPageIcon();

  return (
    <header className={`lg:hidden ${isDark ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} sticky top-0 z-40 safe-area-top`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button 
                onClick={() => navigate(-1)}
                className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">X</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {PageIcon && <PageIcon className="w-5 h-5" />}
              <h1 className="text-lg font-bold">{getPageTitle()}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {!showBackButton && (
                  <button 
                    onClick={() => navigate('/settings')}
                    className={`p-2 rounded-full transition-colors active:scale-90 ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 bg-blue-500 text-white font-bold px-3 py-1.5 rounded-full text-sm active:scale-95 transition-transform"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
        
        {(location.pathname === '/' || location.pathname.startsWith('/explore')) && (
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search predictions, users..."
              className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-100 border-gray-200'} border rounded-full pl-10 pr-4 py-2.5 w-full text-sm focus:outline-none focus:border-blue-500 transition-colors`}
            />
          </div>
        )}
      </div>
    </header>
  );
}
