import { useState, useEffect } from 'react';
import { MessageCircle, Repeat2, Heart, Share, MoreHorizontal, Clock, Play, Volume2, VolumeX, Bookmark, Flag, UserX, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { PlaceBetModal } from './PlaceBetModal';
import { CommentsModal } from './CommentsModal';
import { Prediction } from '../types';
import { toast } from 'sonner';
import { slugify } from '../lib/slugify';
import { bookmarksApi } from '../lib/api/bookmarks';
import { repostsApi } from '../lib/api/reposts';
import { reportsApi } from '../lib/api/reports';
import { blocksApi } from '../lib/api/blocks';
import { ReportModal } from './ReportModal';
import { ShareModal } from './ShareModal';
import { ConfirmationModal } from './ConfirmationModal';

interface PredictionCardProps {
  prediction: Prediction;
  onProfileClick?: (username: string) => void;
  onDelete?: (predictionId: string | number) => void;
}

export function PredictionCard({ prediction, onProfileClick, onDelete }: PredictionCardProps) {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal, userData } = useAuth();
  const isDark = theme === 'dark';
  const [isLiked, setIsLiked] = useState(prediction.isLiked || false);
  const [isReposted, setIsReposted] = useState(prediction.isReposted || false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(prediction.likes);
  const [reposts, setReposts] = useState(prediction.reposts);

  // Check if prediction is expired
  const deadlineDate = new Date(prediction.endDate);
  const isExpired = deadlineDate < new Date();
  const isResolved = (prediction as any).is_resolved;
  const resolutionStatus = (prediction as any).resolution_status || 'pending';
  const outcome = (prediction as any).outcome;

  // Check bookmark status on mount
  useEffect(() => {
    if (isAuthenticated && prediction.id) {
      bookmarksApi.getBookmarkStatus(prediction.id.toString())
        .then((response) => {
          if (response.success) {
            setIsBookmarked(response.isBookmarked);
          }
        })
        .catch(() => {
          // Silently fail - bookmark status check is optional
        });
    }
  }, [isAuthenticated, prediction.id]);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [betPrediction, setBetPrediction] = useState<'yes' | 'no'>('yes');
  const [isMuted, setIsMuted] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMyPost = userData?.id === prediction.userId;

  const handleInteraction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    handleInteraction(e, () => {
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
      if (!isLiked) {
        toast.success('Prediction liked!');
      }
    });
  };

  const handleRepost = async (e: React.MouseEvent) => {
    handleInteraction(e, async () => {
      try {
        if (isReposted) {
          await repostsApi.unrepost(prediction.id.toString());
          setIsReposted(false);
          setReposts(reposts - 1);
          toast.success('Repost removed');
        } else {
          await repostsApi.repost(prediction.id.toString());
          setIsReposted(true);
          setReposts(reposts + 1);
          toast.success('Prediction reposted!');
        }
      } catch (error: any) {
        // Handle 409 Conflict (already reposted/unreposted) with reasons
        if (error.status === 409 || error.response?.status === 409) {
          const reason = error.response?.data?.error?.reason;
          toast.info(error.response?.data?.error?.message || 'Already reposted');
          setIsReposted(true);
          setReposts(reposts + 1);
          return;
        }
        toast.error(error.message || 'Failed to repost');
      }
    });
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    handleInteraction(e, async () => {
      try {
        if (isBookmarked) {
          await bookmarksApi.unbookmark(prediction.id.toString());
          setIsBookmarked(false);
          toast.success('Removed from bookmarks');
        } else {
          await bookmarksApi.bookmark(prediction.id.toString());
          setIsBookmarked(true);
          toast.success('Added to bookmarks');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to bookmark');
      }
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/prediction/${prediction.id}/${slugify(prediction.question)}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowReportModal(true);
  };

  const handleBlockUser = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowBlockConfirm(true);
  };

  const confirmBlockUser = async () => {
    try {
      await blocksApi.blockUser(prediction.userId);
      toast.success(`@${prediction.username} has been blocked`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to block user');
    }
  };

  const handleDeleteClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const deletingToast = toast.loading('Deleting...', {
      description: 'Removing prediction'
    });

    try {
      const { predictionsApi } = await import('../lib/api/predictions');
      const response = await predictionsApi.deletePrediction(prediction.id.toString());
      toast.dismiss(deletingToast);
      
      if (response.success) {
        toast.success('Prediction deleted', {
          description: 'Successfully removed'
        });
        setShowDeleteConfirm(false);
        
        // Call parent to remove from feed
        if (onDelete) {
          onDelete(prediction.id);
        }
      }
    } catch (error: any) {
      toast.dismiss(deletingToast);
      if (error.response?.data?.error?.message) {
        toast.error('Delete failed', {
          description: error.response.data.error.message,
          duration: 5000
        });
      } else {
        toast.error('An error occurred', {
          description: error.message || 'Please try again'
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBet = (e: React.MouseEvent, pred: 'yes' | 'no') => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else if (isMyPost) {
      toast.error("You can't predict on your own posts", {
        description: "This would be considered fraudulent activity",
        duration: 4000,
      });
    } else {
      setBetPrediction(pred);
      setShowBetModal(true);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onProfileClick) {
      onProfileClick(prediction.username);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    handleInteraction(e, () => {
      setShowCommentsModal(true);
    });
  };

  return (
    <>
      <article className={`border-b ${isDark ? 'border-gray-800 hover:bg-[#16181c]/30' : 'border-gray-200 hover:bg-gray-50'} p-3 lg:p-4 transition-colors cursor-pointer break-words overflow-hidden ${isExpired && !isResolved ? 'opacity-60' : ''}`}>
        <div className="flex gap-2 lg:gap-3">
          <button 
            onClick={handleProfileClick} 
            className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0 overflow-hidden"
            style={{
              backgroundImage: prediction.userAvatar ? `url(${prediction.userAvatar})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
                <button onClick={handleProfileClick} className="font-bold hover:underline text-sm lg:text-base">{prediction.displayName}</button>
                {prediction.userBlueTick && (
                  <div className="w-3 h-3 lg:w-4 lg:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {prediction.userGreyTick && !prediction.userBlueTick && (
                  <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className={`text-xs lg:text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>@{prediction.username}</span>
                {prediction.userTitle && (
                  <span className={`text-xs lg:text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {prediction.userTitle}
                  </span>
                )}
                <span className={`text-xs lg:text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>·</span>
                <span className={`text-xs lg:text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{prediction.date}</span>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); }}
                  className={`${isDark ? 'hover:bg-blue-500/10 hover:text-blue-500' : 'hover:bg-blue-50 hover:text-blue-600'} p-1 lg:p-1.5 rounded-full transition-colors`}
                >
                  <MoreHorizontal className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
                {showMoreMenu && (
                  <div className={`absolute right-0 top-8 ${isDark ? 'bg-[#16181c]' : 'bg-white'} rounded-xl shadow-xl border ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-hidden z-20 w-48`}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(e);
                        setShowMoreMenu(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left text-sm`}
                    >
                      <Bookmark className="w-4 h-4" />
                      {isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink();
                        setShowMoreMenu(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left text-sm`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Copy link
                    </button>
                    {isMyPost && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick();
                          setShowMoreMenu(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left text-sm text-red-500`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                    {!isMyPost && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReport();
                            setShowMoreMenu(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left text-sm`}
                        >
                          <Flag className="w-4 h-4" />
                          Report
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlockUser();
                            setShowMoreMenu(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors text-left text-sm text-red-500`}
                        >
                          <UserX className="w-4 h-4" />
                          Block user
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-3 break-words">
              <p className="text-sm lg:text-base leading-relaxed mb-2 break-words">{prediction.question}</p>
              {prediction.description && (
                <p className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 break-words`}>
                  {prediction.description}
                </p>
              )}
              
              {/* Status Badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {isExpired && !isResolved && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    ⏰ Deadline Expired - Awaiting Decision
                  </span>
                )}
                {isResolved && (
                  <>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${outcome ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      ✓ Resolved: {outcome ? 'YES' : 'NO'}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      Winner: {outcome ? 'YES' : 'NO'}
                    </span>
                  </>
                )}
                {!isResolved && resolutionStatus === 'submitted' && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                    📝 Under Review
                  </span>
                )}
              </div>
              
              <div className={`flex items-center gap-1.5 text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Ends {prediction.endDate}</span>
              </div>
            </div>

            {/* Media Content */}
            {prediction.mediaType === 'photo' && prediction.mediaUrl && (
              <div className="mb-3 rounded-xl lg:rounded-2xl overflow-hidden border border-gray-800">
                <img 
                  src={prediction.mediaUrl} 
                  alt="Prediction media" 
                  className="w-full object-cover max-h-[400px] lg:max-h-[500px]"
                />
              </div>
            )}

            {prediction.mediaType === 'video' && prediction.mediaUrl && (
              <div className="mb-3 rounded-xl lg:rounded-2xl overflow-hidden border border-gray-800 relative group">
                <video 
                  src={prediction.mediaUrl}
                  poster={prediction.videoThumbnail}
                  className="w-full object-cover max-h-[400px] lg:max-h-[500px]"
                  controls
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    toast.error('Failed to load video');
                  }}
                />
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsMuted(!isMuted);
                    const video = e.currentTarget.parentElement?.querySelector('video');
                    if (video) {
                      video.muted = !isMuted;
                    }
                  }}
                  className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-8 h-8 lg:w-10 lg:h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors z-10"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 lg:w-5 lg:h-5" /> : <Volume2 className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
              </div>
            )}
            
            {/* Prediction Card */}
            <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-3`}>
              <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4 text-xs lg:text-sm">
                <div className={`${isDark ? 'bg-black/50' : 'bg-white'} rounded-lg p-2 lg:p-3`}>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>XP Pool</div>
                  <div className="font-bold text-base lg:text-lg">{prediction.xpPool}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`flex-1 h-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: `${prediction.yesPercentXP}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-green-400">Y {prediction.yesPercentXP}%</span>
                    <span className="text-blue-400">N {prediction.noPercentXP}%</span>
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-black/50' : 'bg-white'} rounded-lg p-2 lg:p-3`}>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>XC Pool</div>
                  <div className="font-bold text-base lg:text-lg">{prediction.xcPool}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`flex-1 h-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: `${prediction.yesPercentXC}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-green-400">Y {prediction.yesPercentXC}%</span>
                    <span className="text-blue-400">N {prediction.noPercentXC}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                <button 
                  onClick={(e) => !isExpired && !isMyPost && handleBet(e, 'yes')}
                  disabled={isExpired || isResolved || isMyPost}
                  className={`bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg lg:rounded-xl py-2 lg:py-3 px-3 lg:px-4 font-bold transition-all transform active:scale-95 text-white text-sm lg:text-base ${(isExpired || isResolved || isMyPost) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>Yes</span>
                    <span className="text-green-100 text-xs lg:text-sm">{prediction.yesMultiplier}</span>
                  </div>
                </button>
                <button 
                  onClick={(e) => !isExpired && !isMyPost && handleBet(e, 'no')}
                  disabled={isExpired || isResolved || isMyPost}
                  className={`bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg lg:rounded-xl py-2 lg:py-3 px-3 lg:px-4 font-bold transition-all transform active:scale-95 text-white text-sm lg:text-base ${(isExpired || isResolved || isMyPost) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>No</span>
                    <span className="text-blue-100 text-xs lg:text-sm">{prediction.noMultiplier}</span>
                  </div>
                </button>
              </div>
              
              {isMyPost && !isExpired && !isResolved && (
                <div className={`mt-2 text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  You cannot predict on your own post
                </div>
              )}
            </div>
            
            {/* Social Actions */}
            <div className={`flex items-center justify-between ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              <button 
                onClick={handleComment}
                className={`flex items-center gap-1 lg:gap-2 ${isDark ? 'hover:text-blue-500' : 'hover:text-blue-600'} group transition-colors`}
              >
                <div className={`${isDark ? 'group-hover:bg-blue-500/10' : 'group-hover:bg-blue-50'} p-1.5 lg:p-2 rounded-full transition-colors`}>
                  <MessageCircle className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                </div>
                <span className="text-xs lg:text-sm">{prediction.comments}</span>
              </button>
              
              <button 
                onClick={handleRepost}
                className={`flex items-center gap-1 lg:gap-2 group transition-colors ${
                  isReposted ? 'text-green-500' : isDark ? 'hover:text-green-500' : 'hover:text-green-600'
                }`}
              >
                <div className={`${isDark ? 'group-hover:bg-green-500/10' : 'group-hover:bg-green-50'} p-1.5 lg:p-2 rounded-full transition-colors`}>
                  <Repeat2 className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                </div>
                <span className="text-xs lg:text-sm">{reposts}</span>
              </button>
              
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 lg:gap-2 group transition-colors ${
                  isLiked ? 'text-pink-500' : isDark ? 'hover:text-pink-500' : 'hover:text-pink-600'
                }`}
              >
                <div className={`${isDark ? 'group-hover:bg-pink-500/10' : 'group-hover:bg-pink-50'} p-1.5 lg:p-2 rounded-full transition-colors`}>
                  <Heart className={`w-4 h-4 lg:w-[18px] lg:h-[18px] ${isLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-xs lg:text-sm">{likes}</span>
              </button>

              <button 
                onClick={handleBookmark}
                className={`group transition-colors ${
                  isBookmarked ? 'text-blue-500' : isDark ? 'hover:text-blue-500' : 'hover:text-blue-600'
                }`}
              >
                <div className={`${isDark ? 'group-hover:bg-blue-500/10' : 'group-hover:bg-blue-50'} p-1.5 lg:p-2 rounded-full transition-colors`}>
                  <Bookmark className={`w-4 h-4 lg:w-[18px] lg:h-[18px] ${isBookmarked ? 'fill-current' : ''}`} />
                </div>
              </button>
              
              <button 
                onClick={handleShare}
                className={`${isDark ? 'hover:text-blue-500' : 'hover:text-blue-600'} group transition-colors lg:flex hidden`}
              >
                <div className={`${isDark ? 'group-hover:bg-blue-500/10' : 'group-hover:bg-blue-50'} p-1.5 lg:p-2 rounded-full transition-colors`}>
                  <Share className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </article>

      <PlaceBetModal 
        isOpen={showBetModal}
        onClose={() => setShowBetModal(false)}
        question={prediction.question}
        prediction={betPrediction}
        predictionId={prediction.id.toString()}
        initialCurrency={prediction.xpPool && parseFloat(prediction.xpPool.replace(/,/g, '')) > 0 ? 'XP' : 'XC'}
      />

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        prediction={prediction}
        onProfileClick={onProfileClick}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        entityType="prediction"
        entityId={prediction.id.toString()}
        entityName={prediction.question}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`/prediction/${prediction.id}/${slugify(prediction.question)}`}
        title={prediction.question}
        description={prediction.description}
      />

      <ConfirmationModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={confirmBlockUser}
        title="Block User"
        message={`Are you sure you want to block @${prediction.username}? You won't see their content anymore.`}
        confirmText="Block"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Prediction"
        message="Are you sure you want to delete this prediction?"
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}