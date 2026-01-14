import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Trophy, Users, Bell, Mail, Bookmark, TrendingUp, Wallet, Store, Settings, PlusCircle, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadCounts, formatCount } from '../hooks/useUnreadCounts';
import { Sheet, SheetContent } from './ui/sheet';

interface MobileSidebarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  { icon: TrendingUp, label: 'Active Predictions', path: '/active-predictions' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
  { icon: Store, label: 'XP Market', path: '/xp-market' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function MobileSidebarDrawer({ open, onOpenChange, onCreateClick }: MobileSidebarDrawerProps) {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal, logout, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const { counts } = useUnreadCounts();

  const getUnreadCount = (path: string) => {
    if (path === '/notifications') return counts.notifications;
    if (path === '/messages') return counts.messages;
    return 0;
  };

  const requiresAuth = (path: string) =>
    ['/notifications', '/bookmarks', '/settings', '/active-predictions', '/messages', '/wallet'].includes(path);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className={`${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} p-0`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg text-white">
              X
            </div>
            <div className="text-lg font-bold">Xpred</div>
          </div>
        </div>

        <div className="p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

            const onClick = () => {
              if (requiresAuth(item.path) && !isAuthenticated) {
                onOpenChange(false);
                setShowLoginModal(true);
                return;
              }
              onOpenChange(false);
              navigate(item.path);
            };

            return (
              <button
                key={item.label}
                onClick={onClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  active ? (isDark ? 'bg-gray-900' : 'bg-gray-100') : isDark ? 'hover:bg-gray-900/60' : 'hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {getUnreadCount(item.path) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                      {formatCount(getUnreadCount(item.path))}
                    </span>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenChange(false);
                setShowLoginModal(true);
                return;
              }
              onCreateClick();
            }}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Share Prediction
          </button>

          {isAuthenticated && userData?.username && (
            <Link
              to={`/user/${userData.username}`}
              onClick={() => onOpenChange(false)}
              className={`mt-4 block rounded-2xl border p-3 ${isDark ? 'border-gray-800 bg-[#16181c]' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
                  style={{
                    backgroundImage: userData.avatar ? `url(${userData.avatar})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{userData.name || 'User'}</div>
                  <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>@{userData.username}</div>
                </div>
              </div>
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={() => {
                onOpenChange(false);
                logout();
              }}
              className={`w-full mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isDark ? 'hover:bg-gray-900/60' : 'hover:bg-gray-100'
              }`}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


