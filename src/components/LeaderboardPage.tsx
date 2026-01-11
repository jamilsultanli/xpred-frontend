import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Award, Crown, Medal, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { leaderboardApi } from '../lib/api/leaderboard';
import { toast } from 'sonner';

type LeaderboardTab = 'all-time' | 'monthly' | 'weekly';

interface LeaderboardPageProps {
  onProfileClick?: (username: string) => void;
}

interface LeaderboardUser {
  rank: number;
  username: string;
  displayName: string;
  avatar?: string;
  xp: string;
  predictions: number;
  wins: number;
  accuracy: number;
  streak: number;
}

export function LeaderboardPage({ onProfileClick }: LeaderboardPageProps) {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<LeaderboardTab>('all-time');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTab]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const period = selectedTab === 'all-time' ? 'all_time' : selectedTab === 'monthly' ? 'monthly' : 'weekly';
      const response = await leaderboardApi.getLeaderboard({
        type: 'wins', // Changed to wins for winning predictions
        period: period as any,
        limit: 100,
      });
      
      if (response.success && response.leaderboard) {
        const mapped = response.leaderboard.map((entry: any, index: number) => ({
          rank: entry.rank || index + 1,
          username: entry.user.username,
          displayName: entry.user.full_name || entry.user.username,
          avatar: entry.user.avatar_url,
          xp: entry.balance_xp ? (entry.balance_xp >= 1000000 ? `${(entry.balance_xp / 1000000).toFixed(1)}M` : entry.balance_xp >= 1000 ? `${(entry.balance_xp / 1000).toFixed(0)}K` : entry.balance_xp.toString()) : '0',
          predictions: entry.total_predictions || entry.total_bets || 0,
          wins: entry.total_wins || entry.wins || 0,
          accuracy: Math.round((entry.win_rate || 0) * 100),
          streak: entry.current_streak || entry.streak || 0,
        }));
        setLeaderboard(mapped);
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast.error(error.message || 'Failed to load leaderboard');
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-700 to-amber-600';
    return isDark ? 'bg-[#16181c]' : 'bg-gray-100';
  };

  const handleUserClick = (username: string) => {
    if (onProfileClick) {
      onProfileClick(username);
    } else {
      navigate(`/user/${username}`);
    }
  };

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 lg:px-6 py-4 lg:py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <div className="relative">
                <Trophy className="w-6 h-6 lg:w-7 lg:h-7 text-blue-500" />
                <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span>Leaderboard</span>
            </h1>
          </div>
          <div className="flex gap-2 lg:gap-3">
            <button
              onClick={() => setSelectedTab('all-time')}
              className={`flex-1 py-2.5 lg:py-3 px-4 lg:px-5 rounded-xl font-semibold text-sm lg:text-base transition-all transform active:scale-95 ${
                selectedTab === 'all-time'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : isDark
                  ? 'bg-[#16181c] text-gray-400 hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedTab('monthly')}
              className={`flex-1 py-2.5 lg:py-3 px-4 lg:px-5 rounded-xl font-semibold text-sm lg:text-base transition-all transform active:scale-95 ${
                selectedTab === 'monthly'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : isDark
                  ? 'bg-[#16181c] text-gray-400 hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedTab('weekly')}
              className={`flex-1 py-2.5 lg:py-3 px-4 lg:px-5 rounded-xl font-semibold text-sm lg:text-base transition-all transform active:scale-95 ${
                selectedTab === 'weekly'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : isDark
                  ? 'bg-[#16181c] text-gray-400 hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 lg:p-6">
        {/* Top 3 Podium */}
        {selectedTab === 'all-time' && leaderboard.length >= 3 && !isLoading && (
          <div className="mb-8 lg:mb-12">
            <h2 className="text-lg lg:text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
              <span>Top Performers</span>
            </h2>
            <div className="flex items-end justify-center gap-3 lg:gap-6 mb-8">
              {/* 2nd Place */}
              <button 
                onClick={() => handleUserClick(leaderboard[1].username)} 
                className="flex flex-col items-center flex-1 max-w-[140px] lg:max-w-[180px] group"
              >
                <div className="relative mb-3">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mb-2 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Medal className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs lg:text-sm font-bold w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center">
                    #2
                  </div>
                </div>
                <div className="text-center mb-3 w-full">
                  <div className="font-bold text-sm lg:text-base truncate">{leaderboard[1].displayName}</div>
                  <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                    @{leaderboard[1].username}
                  </div>
                </div>
                <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-100 border-gray-200'} border-2 rounded-2xl px-4 lg:px-6 py-4 lg:py-5 text-center w-full group-hover:shadow-lg transition-shadow`}>
                  <div className="text-xl lg:text-2xl font-bold text-gray-400 mb-1">#2</div>
                  <div className="text-lg lg:text-xl font-bold">{leaderboard[1].wins}</div>
                  <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>Wins</div>
                </div>
              </button>

              {/* 1st Place */}
              <button 
                onClick={() => handleUserClick(leaderboard[0].username)} 
                className="flex flex-col items-center flex-1 max-w-[160px] lg:max-w-[200px] -mt-4 lg:-mt-6 group"
              >
                <div className="relative mb-3">
                  <Crown className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 mb-2 mx-auto animate-pulse" />
                  <div 
                    className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full mb-2 flex items-center justify-center ring-4 ring-yellow-500/30 shadow-2xl group-hover:scale-105 transition-transform overflow-hidden"
                    style={{
                      backgroundImage: leaderboard[0].avatar ? `url(${leaderboard[0].avatar})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!leaderboard[0].avatar && <Crown className="w-10 h-10 lg:w-12 lg:h-12 text-white" />}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-500 to-amber-600 text-white text-sm lg:text-base font-bold w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shadow-lg">
                    #1
                  </div>
                </div>
                <div className="text-center mb-3 w-full">
                  <div className="font-bold text-base lg:text-lg truncate">{leaderboard[0].displayName}</div>
                  <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                    @{leaderboard[0].username}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl px-5 lg:px-8 py-5 lg:py-6 text-center text-white w-full shadow-xl group-hover:shadow-2xl transition-shadow">
                  <div className="text-2xl lg:text-3xl font-bold mb-1">#1</div>
                  <div className="text-xl lg:text-2xl font-bold">{leaderboard[0].wins}</div>
                  <div className="text-xs lg:text-sm mt-1 opacity-90">Wins</div>
                </div>
              </button>

              {/* 3rd Place */}
              <button 
                onClick={() => handleUserClick(leaderboard[2].username)} 
                className="flex flex-col items-center flex-1 max-w-[140px] lg:max-w-[180px] group"
              >
                <div className="relative mb-3">
                  <div 
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full mb-2 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden"
                    style={{
                      backgroundImage: leaderboard[2].avatar ? `url(${leaderboard[2].avatar})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!leaderboard[2].avatar && <Award className="w-8 h-8 lg:w-10 lg:h-10 text-white" />}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs lg:text-sm font-bold w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center">
                    #3
                  </div>
                </div>
                <div className="text-center mb-3 w-full">
                  <div className="font-bold text-sm lg:text-base truncate">{leaderboard[2].displayName}</div>
                  <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                    @{leaderboard[2].username}
                  </div>
                </div>
                <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-100 border-gray-200'} border-2 rounded-2xl px-4 lg:px-6 py-4 lg:py-5 text-center w-full group-hover:shadow-lg transition-shadow`}>
                  <div className="text-xl lg:text-2xl font-bold text-amber-700 mb-1">#3</div>
                  <div className="text-lg lg:text-xl font-bold">{leaderboard[2].wins}</div>
                  <div className={`text-xs lg:text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>Wins</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const isTopThree = user.rank <= 3 && selectedTab === 'all-time';
              const startIndex = selectedTab === 'all-time' ? 3 : 0;
              const displayRank = index + startIndex + 1;
              
              return (
                <button
                  key={user.rank}
                  onClick={() => handleUserClick(user.username)}
                  className={`w-full ${getRankBadge(user.rank)} ${isDark && user.rank > 3 ? 'border border-gray-800' : ''} rounded-xl lg:rounded-2xl p-4 lg:p-5 transition-all hover:scale-[1.01] hover:shadow-lg group`}
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`w-10 lg:w-12 text-center font-bold text-base lg:text-lg flex items-center justify-center ${user.rank <= 3 ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {getRankIcon(user.rank) || (
                        <span className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10">
                          #{displayRank}
                        </span>
                      )}
                    </div>
                    
                    <div 
                      className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-white/20"
                      style={{
                        backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`font-bold text-sm lg:text-base flex items-center gap-2 ${user.rank <= 3 ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.displayName}
                        {user.rank === 1 && <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />}
                      </div>
                      <div className={`text-xs lg:text-sm ${user.rank <= 3 ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        @{user.username}
                      </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
                      <div className="text-center min-w-[60px] lg:min-w-[80px]">
                        <div className={`font-bold text-sm lg:text-base ${user.rank <= 3 ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>{user.wins}</div>
                        <div className={`${user.rank <= 3 ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wins</div>
                      </div>
                      <div className="text-center min-w-[60px] lg:min-w-[80px]">
                        <div className={`font-bold text-sm lg:text-base ${user.rank <= 3 ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>{user.predictions}</div>
                        <div className={`${user.rank <= 3 ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>Predictions</div>
                      </div>
                      <div className="text-center min-w-[60px] lg:min-w-[80px]">
                        <div className={`font-bold text-sm lg:text-base ${user.rank <= 3 ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>{user.accuracy}%</div>
                        <div className={`${user.rank <= 3 ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</div>
                      </div>
                      <div className="text-center min-w-[60px] lg:min-w-[80px]">
                        <div className={`font-bold text-sm lg:text-base flex items-center justify-center gap-1 ${user.rank <= 3 ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
                          <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
                          {user.streak}
                        </div>
                        <div className={`${user.rank <= 3 ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>Streak</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg lg:text-xl font-bold ${user.rank <= 3 ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>{user.wins}</div>
                      <div className={`text-xs lg:text-sm ${user.rank <= 3 ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wins</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={`p-8 lg:p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Trophy className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 opacity-50" />
            <p className="text-base lg:text-lg">No leaderboard data available</p>
          </div>
        )}
      </div>
    </div>
  );
}