import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Loader2, HelpCircle, FileText, Shield, Info, Mail, AlertTriangle, Scale, UserCheck, Gift } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { exploreApi } from '../lib/api/explore';
import { socialApi } from '../lib/api/social';
import { usersApi } from '../lib/api/users';
import { slugify } from '../lib/slugify';
import { toast } from 'sonner';

export function TrendingSidebar() {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal, userData } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [trendingPredictions, setTrendingPredictions] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTrending();
    if (isAuthenticated) {
      loadSuggestedUsers();
    } else {
      setIsLoadingSuggested(false);
    }
  }, [isAuthenticated]);

  const loadTrending = async () => {
    setIsLoadingTrending(true);
    try {
      const response = await exploreApi.getTrending('7d', 5);
      if (response.success && response.predictions) {
        setTrendingPredictions(response.predictions.slice(0, 5).map((p: any, index: number) => ({
          rank: index + 1,
          topic: p.category || 'General',
          question: p.question,
          // Trending should be XC-based
          xc: p.total_pot_xc ? (p.total_pot_xc >= 1000 ? `${(p.total_pot_xc / 1000).toFixed(1)}K` : p.total_pot_xc.toString()) : '0',
          id: p.id,
        })));
      }
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const loadSuggestedUsers = async () => {
    setIsLoadingSuggested(true);
    try {
      // Use backend suggestions: excludes already-followed users, returns ~3-4 good options
      const response = await usersApi.getSuggestedUsers(undefined, 4);
      if (response.success && (response as any).users) {
        const suggested = (response as any).users
          .filter((u: any) => u.username !== userData?.username && !u.isFollowing)
          .slice(0, 4)
          .map((u: any) => ({
            name: u.displayName || u.username,
            username: u.username,
            avatar: u.avatar_url,
            title: u.title,
            tag: u.title || 'Suggested',
            id: u.id,
          }));

        setSuggestedUsers(suggested);
        // none should be followed already
        const statuses: Record<string, boolean> = {};
        suggested.forEach((u) => (statuses[u.id] = false));
        setFollowingStatus(statuses);
      }
    } catch (error) {
      console.error('Error loading suggested users:', error);
    } finally {
      setIsLoadingSuggested(false);
    }
  };

  const handleFollow = async (userId: string, username: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const isFollowing = followingStatus[userId];
    try {
      const response = isFollowing
        ? await socialApi.unfollowUser(userId)
        : await socialApi.followUser(userId);
      
      if (response.success) {
        setFollowingStatus(prev => ({ ...prev, [userId]: response.following }));
        toast.success(isFollowing ? 'Unfollowed' : 'Following');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    }
  };

  return (
    <aside className="w-[350px] px-4 py-2 sticky top-[] h-[] hidden xl:block">
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4">
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-50 border-gray-200'} rounded-2xl overflow-hidden border`}>
          <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Now
            </h2>
          </div>
          <div>
            {isLoadingTrending ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : trendingPredictions.length > 0 ? (
              trendingPredictions.map((item) => (
                <button
                  key={item.id || item.rank}
                  onClick={() => {
                    navigate(`/prediction/${item.id}/${slugify(item.question)}`);
                  }}
                  className={`w-full px-4 py-3 ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} transition-colors text-left border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} last:border-b-0`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-1 flex items-center gap-1`}>
                        <span>{item.topic}</span>
                        <span>•</span>
                        <span className="text-blue-500">Trending</span>
                      </div>
                      <div className="font-semibold text-sm line-clamp-2">{item.question}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>{item.xc} XC</div>
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>#{item.rank}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className={`p-4 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                No trending predictions
              </div>
            )}
          </div>
          <button className={`w-full px-4 py-3 text-blue-500 ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} text-sm transition-colors`}>
            Show more
          </button>
        </div>
        
        <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-50 border-gray-200'} rounded-2xl overflow-hidden border`}>
          <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Suggested for you
            </h2>
          </div>
          <div>
            {isLoadingSuggested ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : suggestedUsers.length > 0 ? (
              suggestedUsers.map((user) => (
                <div
                  key={user.username}
                  className={`px-4 py-3 ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} transition-colors border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} last:border-b-0`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => {
                        navigate(`/user/${user.username}`);
                      }}
                      className="flex gap-3 flex-1 text-left"
                    >
                      <div 
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 overflow-hidden"
                        style={{
                          backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      ></div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm flex items-center gap-1">
                          {user.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>@{user.username}</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleFollow(user.id, user.username)}
                      className={`${
                        followingStatus[user.id]
                          ? isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                      } font-bold px-4 py-1.5 rounded-full text-sm transition-colors`}
                    >
                      {followingStatus[user.id] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`p-4 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {isAuthenticated ? 'No suggestions available' : 'Login to see suggestions'}
              </div>
            )}
          </div>
          <button className={`w-full px-4 py-3 text-blue-500 ${isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} text-sm transition-colors`}>
            Show more
          </button>
        </div>
        </div>
        
        {/* Footer Links */}
        <div className={`mt-auto pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} space-y-1 flex-shrink-0`}>
          <div className={`text-xs font-semibold px-4 py-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Company</div>
          <Link 
            to="/about"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </Link>
          <Link 
            to="/contact"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Us</span>
          </Link>
          
          <div className={`text-xs font-semibold px-4 py-2 mt-3 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Legal & Policies</div>
          <Link 
            to="/terms"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </Link>
          <Link 
            to="/privacy"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </Link>
          <Link 
            to="/disclaimer"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Disclaimer</span>
          </Link>
          <Link 
            to="/aml-policy"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Scale className="w-4 h-4" />
            <span>AML Policy</span>
          </Link>
          <Link 
            to="/kyc-policy"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <UserCheck className="w-4 h-4" />
            <span>KYC Policy</span>
          </Link>
          <Link 
            to="/sweepstake-policy"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Gift className="w-4 h-4" />
            <span>Sweepstake Policy</span>
          </Link>
          
          <div className={`text-xs font-semibold px-4 py-2 mt-3 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Support</div>
          <Link 
            to="/help"
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </Link>
          
          <div className={`text-xs px-4 py-2 mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} Xpred. All rights reserved.
          </div>
        </div>
      </div>
    </aside>
  );
}