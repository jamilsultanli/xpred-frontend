import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Trophy, Bell, Bookmark, Users, User, PlusCircle, LogOut, Mail, Settings, Wallet, Store } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadCounts, formatCount } from '../hooks/useUnreadCounts';

interface SidebarProps {
  onCreateClick: () => void;
}

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Users, label: 'Community', path: '/communities' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Mail, label: 'Messages', path: '/messages' },
  { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
  { icon: Store, label: 'XP Market', path: '/xp-market' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ onCreateClick }: SidebarProps) {
  const { theme } = useTheme();
  const { isAuthenticated, logout, setShowLoginModal, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const { counts } = useUnreadCounts();

  const getUnreadCount = (path: string) => {
    if (path === '/notifications') return counts.notifications;
    if (path === '/messages') return counts.messages;
    return 0;
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleMenuClick = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate(path);
  };

  return (
    <aside className="w-[275px] px-4 py-2 sticky top-[] h-[] hidden lg:flex flex-col">
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const requiresAuth = ['/notifications', '/bookmarks', '/settings'].includes(item.path);
          const active = isActive(item.path);
          
          if (requiresAuth && !isAuthenticated) {
            return (
              <button
                key={item.label}
                onClick={() => setShowLoginModal(true)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all font-medium ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xl">{item.label}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all relative ${
                active
                  ? 'font-bold'
                  : `font-medium ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`
              }`}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : ''}`} />
                {getUnreadCount(item.path) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {formatCount(getUnreadCount(item.path))}
                  </span>
                )}
              </div>
              <span className="text-xl">{item.label}</span>
            </Link>
          );
        })}
        
        <button 
          onClick={() => {
            if (!isAuthenticated) {
              setShowLoginModal(true);
            } else {
              onCreateClick();
            }
          }}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold mt-4 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create</span>
        </button>
        
        {isAuthenticated && (
          <button 
            onClick={logout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all font-medium ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'}`}
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xl">Log Out</span>
          </button>
        )}
      </nav>
      
      {isAuthenticated && userData && userData.username && (
        <Link 
          to={`/user/${userData.username}`}
          className={`mt-8 w-full ${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-100 border-gray-200'} rounded-2xl p-4 border hover:bg-opacity-80 transition-colors block`}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0"
              style={{ 
                backgroundImage: userData.avatar ? `url(${userData.avatar})` : undefined, 
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-bold text-sm truncate">{userData.name || 'User'}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                @{userData.username || 'username'}
              </div>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}