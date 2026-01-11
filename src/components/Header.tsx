import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Mail, Sun, Moon, LogIn, Wallet, User, Settings, Shield, LogOut, ChevronDown, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api/client';
import { predictionsApi } from '../lib/api/predictions';
import { ExpiredPredictionsModal } from './ExpiredPredictionsModal';
import { useUnreadCounts, formatCount } from '../hooks/useUnreadCounts';

interface HeaderProps {
  onCreateClick: () => void;
}

export function Header({ onCreateClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, setShowLoginModal, userData, logout } = useAuth();
  const isDark = theme === 'dark';
  const [balanceXP, setBalanceXP] = useState(0);
  const [balanceXC, setBalanceXC] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { counts } = useUnreadCounts();

  useEffect(() => {
    if (isAuthenticated) {
      loadBalance();
      checkExpiredPredictions();
      // Check every 5 minutes
      const interval = setInterval(checkExpiredPredictions, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkExpiredPredictions = async () => {
    try {
      const response = await predictionsApi.getExpiredPredictions();
      if (response.success) {
        const unresolved = (response.predictions || []).filter((p: any) => !p.is_resolved);
        setExpiredCount(unresolved.length);
      }
    } catch (error) {
      // Silently fail - this is a background check
    }
  };

  const loadBalance = async () => {
    try {
      const response = await apiClient.get('/wallet/balance');
      if (response.success) {
        const balance = response.balance || response;
        setBalanceXP(parseFloat(balance.balance_xp || '0'));
        setBalanceXC(parseFloat(balance.balance_xc || '0'));
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header className={`${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-4 py-3 sticky top-0 z-50`}>
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg text-white">
              X
            </div>
            <span className="text-xl font-bold hidden sm:block">Xpred</span>
          </Link>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-[600px] mx-4">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search predictions, users, communities..."
              className={`${isDark ? 'bg-[#16181c] border-gray-800 focus:bg-black' : 'bg-gray-100 border-gray-200 focus:bg-white'} border rounded-full pl-12 pr-4 py-2.5 w-full text-sm focus:outline-none focus:border-blue-500 transition-colors`}
            />
          </div>
        </form>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/wallet"
                className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'
                }`}
                title="Wallet"
              >
                <Wallet className="w-4 h-4" />
                <div className="text-right">
                  <div className="text-sm font-bold">
                    {balanceXP >= 1000000 
                      ? `${(balanceXP / 1000000).toFixed(1)}M` 
                      : balanceXP >= 1000 
                      ? `${(balanceXP / 1000).toFixed(0)}K` 
                      : balanceXP.toLocaleString()} XP
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {balanceXC.toFixed(2)} XC
                  </div>
                </div>
              </Link>
              
              {expiredCount > 0 && (
                <button
                  onClick={() => setShowExpiredModal(true)}
                  className={`p-2 rounded-full transition-colors relative ${
                    isDark ? 'hover:bg-gray-900 bg-orange-500/20' : 'hover:bg-gray-100 bg-orange-100'
                  }`}
                  title={`${expiredCount} expired prediction${expiredCount !== 1 ? 's' : ''} need${expiredCount === 1 ? 's' : ''} resolution`}
                >
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {expiredCount}
                  </span>
                </button>
              )}
              <Link 
                to="/notifications"
                className={`${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} p-2 rounded-full transition-colors relative`}
              >
                <Bell className="w-5 h-5" />
                {counts.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {formatCount(counts.notifications)}
                  </span>
                )}
              </Link>
              <Link 
                to="/messages"
                className={`${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} p-2 rounded-full transition-colors relative`}
              >
                <Mail className="w-5 h-5" />
                {counts.messages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {formatCount(counts.messages)}
                  </span>
                )}
              </Link>
              {userData?.username && (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                  >
                    <div 
                      className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full cursor-pointer hover:opacity-80 transition-opacity overflow-hidden flex-shrink-0"
                      style={{
                        backgroundImage: userData.avatar ? `url(${userData.avatar})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showProfileMenu && (
                    <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50 ${
                      isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full overflow-hidden flex-shrink-0"
                            style={{
                              backgroundImage: userData.avatar ? `url(${userData.avatar})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{userData.name || 'User'}</div>
                            <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              @{userData.username}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to={`/user/${userData.username}`}
                          onClick={() => setShowProfileMenu(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm">View Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowProfileMenu(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                        >
                          <Settings className="w-5 h-5" />
                          <span className="text-sm">Settings</span>
                        </Link>
                        <Link
                          to="/settings?tab=privacy"
                          onClick={() => setShowProfileMenu(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                        >
                          <Shield className="w-5 h-5" />
                          <span className="text-sm">Privacy & Security</span>
                        </Link>
                        <div className={`h-px my-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 ${isDark ? 'hover:bg-gray-800 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors text-left`}
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm">Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
          
          <button
            onClick={toggleTheme}
            className={`${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} p-2 rounded-full transition-colors`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}