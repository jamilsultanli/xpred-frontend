import { useState, useEffect } from 'react';
import { X, Send, Heart, MoreHorizontal, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Prediction } from '../types';
import { commentsApi } from '../lib/api/comments';
import { toast } from 'sonner';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: Prediction;
  onProfileClick?: (username: string) => void;
}

export function CommentsModal({ isOpen, onClose, prediction, onProfileClick }: CommentsModalProps) {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (isOpen && prediction.id) {
      loadComments();
    }
  }, [isOpen, prediction.id]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await commentsApi.getComments(prediction.id.toString());
      if (response.success) {
        // Organize comments into parent-child structure
        const parentComments = response.comments.filter(c => !c.parent_id);
        const repliesMap = new Map<string, any[]>();
        
        response.comments.filter(c => c.parent_id).forEach(reply => {
          const parentId = reply.parent_id!;
          if (!repliesMap.has(parentId)) {
            repliesMap.set(parentId, []);
          }
          repliesMap.get(parentId)!.push(reply);
        });

        const organized = parentComments.map(comment => ({
          ...comment,
          replies: repliesMap.get(comment.id) || [],
        }));

        setComments(organized);
      }
    } catch (error: any) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await commentsApi.addComment(
        prediction.id.toString(),
        comment.trim(),
        replyTo || undefined
      );

      if (response.success) {
        toast.success('Comment added successfully!');
        setComment('');
        setReplyTo(null);
        setReplyContent('');
        await loadComments();
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!content.trim()) return;

    try {
      const response = await commentsApi.addComment(
        prediction.id.toString(),
        content.trim(),
        parentId
      );

      if (response.success) {
        toast.success('Reply added successfully!');
        setReplyContent('');
        await loadComments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add reply');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">Comments</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prediction Preview */}
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4`}>
          <div className="flex gap-3">
            <button 
              onClick={() => onProfileClick?.(prediction.username)}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0"
            ></button>
            <div>
              <button 
                onClick={() => onProfileClick?.(prediction.username)}
                className="font-bold hover:underline"
              >
                {prediction.displayName}
              </button>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {prediction.question}
              </p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="space-y-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => onProfileClick?.(c.author?.username || 'unknown')}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"
                  ></button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => onProfileClick?.(c.author?.username || 'unknown')}
                        className="font-bold hover:underline"
                      >
                        {c.author?.full_name || c.author?.username || 'Unknown'}
                      </button>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        @{c.author?.username || 'unknown'}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>·</span>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        {formatTime(c.created_at)}
                      </span>
                    </div>
                    <p className="mb-2">{c.content}</p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          if (!replyTo || replyTo !== c.id) {
                            setReplyTo(c.id);
                            setReplyContent('');
                          } else {
                            setReplyTo(null);
                          }
                        }}
                        className={`text-sm ${isDark ? 'text-gray-500 hover:text-blue-500' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                      >
                        Reply
                      </button>
                    </div>
                    
                    {/* Reply Input */}
                    {replyTo === c.id && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                            isDark ? 'bg-black border-gray-700' : 'bg-gray-50 border-gray-300'
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReply(c.id, replyContent);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleReply(c.id, replyContent)}
                          disabled={!replyContent.trim()}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="ml-12 mt-2 space-y-2">
                        {c.replies.map((reply: any) => (
                          <div key={reply.id} className="flex gap-2">
                            <button 
                              onClick={() => onProfileClick?.(reply.author?.username || 'unknown')}
                              className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex-shrink-0"
                            ></button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <button 
                                  onClick={() => onProfileClick?.(reply.author?.username || 'unknown')}
                                  className="font-semibold text-sm hover:underline"
                                >
                                  {reply.author?.full_name || reply.author?.username || 'Unknown'}
                                </button>
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                  {formatTime(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} p-4`}>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className={`flex-1 px-4 py-2 rounded-full border focus:outline-none focus:border-blue-500 ${
                  isDark ? 'bg-[#16181c] border-gray-800' : 'bg-gray-100 border-gray-200'
                }`}
              />
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
