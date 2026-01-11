import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, TrendingUp, Plus, Loader2, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Community } from '../types';
import { communitiesApi } from '../lib/api/communities';
import { CreateCommunityModal } from './CreateCommunityModal';
import { toast } from 'sonner';

export function CommunityPage() {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'joined' | 'discover'>('discover');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [bestCommunities, setBestCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBest, setIsLoadingBest] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCommunities();
    loadBestCommunities();
  }, [searchQuery, activeTab]);

  const loadBestCommunities = async () => {
    setIsLoadingBest(true);
    try {
      const response = await communitiesApi.getBestCommunities(10);
      if (response.success) {
        setBestCommunities(response.communities);
      }
    } catch (error: any) {
      console.error('Failed to load best communities:', error);
    } finally {
      setIsLoadingBest(false);
    }
  };

  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await communitiesApi.getCommunities(1, 100, searchQuery || undefined);
      if (response.success) {
        let filtered = response.communities;
        if (activeTab === 'joined') {
          filtered = filtered.filter(c => c.isJoined);
        }
        setCommunities(filtered);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinToggle = async (communityId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    const community = communities.find(c => c.id === communityId);
    if (!community) return;

    try {
      if (community.isJoined) {
        await communitiesApi.leaveCommunity(communityId);
        toast.success('Left community');
      } else {
        await communitiesApi.joinCommunity(communityId);
        toast.success('Joined community');
      }
      // Reload communities
      await loadCommunities();
    } catch (error: any) {
      // Handle 409 conflicts with specific reasons
      if (error.response?.status === 409) {
        const reason = error.response?.data?.error?.reason;
        if (reason === 'ALREADY_MEMBER') {
          toast.info('You are already a member of this community');
        } else {
          toast.error(error.response?.data?.error?.message || 'Already a member');
        }
      } else {
        toast.error(error.message || 'Failed to update community membership');
      }
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = !searchQuery || 
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Communities
          </h1>
          
          <div className="relative mb-3">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search communities..."
              className={`w-full pl-11 pr-4 py-2.5 rounded-full border focus:outline-none focus:border-blue-500 ${
                isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-100 border-gray-200'
              }`}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('joined')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'joined'
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'bg-[#16181c] text-gray-400 hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Communities
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'discover'
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'bg-[#16181c] text-gray-400 hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Discover
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Best Communities Section */}
        {activeTab === 'discover' && !searchQuery && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-lg font-bold">Best Communities</h2>
            </div>
            {isLoadingBest ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : bestCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {bestCommunities.map((community) => (
                  <div
                    key={community.id}
                    onClick={() => navigate(`/communities/${community.id}`)}
                    className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer`}
                  >
                    <div 
                      className="h-24 relative"
                      style={{
                        backgroundImage: community.banner_url ? `url(${community.banner_url})` : 'linear-gradient(to right, #3b82f6, #9333ea)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute top-2 right-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div 
                          className="w-12 h-12 rounded-xl border-2 border-black overflow-hidden"
                          style={{
                            backgroundImage: community.avatar_url ? `url(${community.avatar_url})` : 'linear-gradient(to bottom right, #a855f7, #ec4899)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="p-3 pt-6">
                      <h3 className="font-bold mb-1 truncate">{community.name}</h3>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className="font-semibold">{community.members?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className="font-semibold">{community.predictions?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* All Communities */}
        <div>
          {activeTab === 'discover' && !searchQuery && (
            <h2 className="text-lg font-bold mb-4">All Communities</h2>
          )}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No communities found
              </p>
            </div>
          ) : (
            filteredCommunities.map((community) => (
              <div
                key={community.id}
                onClick={() => navigate(`/communities/${community.id}`)}
                className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform cursor-pointer`}
              >
            <div 
              className="h-32 relative"
              style={{
                backgroundImage: community.banner_url ? `url(${community.banner_url})` : 'linear-gradient(to right, #3b82f6, #9333ea)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-4 left-4">
                <div 
                  className="w-20 h-20 rounded-2xl border-4 border-black overflow-hidden"
                  style={{
                    backgroundImage: community.avatar_url ? `url(${community.avatar_url})` : 'linear-gradient(to bottom right, #a855f7, #ec4899)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 pt-8">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold mb-1">{community.name}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {community.description}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinToggle(community.id);
                  }}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    community.isJoined
                      ? isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {community.isJoined ? 'Joined' : 'Join'}
                </button>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className="font-semibold">{community.members.toLocaleString()}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>members</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className="font-semibold">{community.predictions.toLocaleString()}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>predictions</span>
                </div>
              </div>
            </div>
          </div>
            ))
          )}
        </div>
      </div>

      {isAuthenticated && (
        <button 
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 z-20"
          title="Create Community"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <CreateCommunityModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadCommunities}
      />
    </div>
  );
}
