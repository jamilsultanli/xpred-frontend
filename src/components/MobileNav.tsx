import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Trophy, Bell, User, PlusCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavProps {
  onCreateClick: () => void;
}

export function MobileNav({ onCreateClick }: MobileNavProps) {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: PlusCircle, label: 'Create', path: null, action: onCreateClick },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: userData?.username ? `/user/${userData.username}` : '/profile' },
  ];

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t z-50 safe-area-bottom`}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const isCreateButton = item.label === 'Create';
          
          if (isCreateButton) {
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginModal(true);
                  } else {
                    item.action?.();
                  }
                }}
                className="flex flex-col items-center justify-center relative"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-90">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          }

          if (!item.path || (item.path === '/notifications' && !isAuthenticated)) {
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginModal(true);
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className="flex flex-col items-center justify-center flex-1 py-2 relative group"
              >
                <div className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-500/10' : ''}`}>
                  <item.icon 
                    className={`w-6 h-6 transition-all ${
                      active 
                        ? 'text-blue-500 stroke-[2.5]' 
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} 
                  />
                </div>
                {active && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 py-2 relative group"
            >
              <div className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-500/10' : ''}`}>
                <item.icon 
                  className={`w-6 h-6 transition-all ${
                    active 
                      ? 'text-blue-500 stroke-[2.5]' 
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} 
                />
              </div>
              {active && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
