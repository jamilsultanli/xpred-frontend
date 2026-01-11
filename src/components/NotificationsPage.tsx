import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Repeat2, TrendingUp, UserPlus, Award, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { notificationsApi } from '../lib/api/notifications';
import { toast } from 'sonner';

interface NotificationsPageProps {
  onProfileClick?: (username: string) => void;
}

export function NotificationsPage({ onProfileClick }: NotificationsPageProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setIsLoading(false);
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationsApi.getNotifications({ page: 1, limit: 50 });
      if (response.success && response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error(error.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-pink-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'repost':
        return <Repeat2 className="w-5 h-5 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'win':
      case 'bet_won':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'mention':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationMessage = (type: string) => {
    switch (type) {
      case 'like':
        return 'liked your prediction';
      case 'comment':
        return 'commented on your prediction';
      case 'repost':
        return 'reposted your prediction';
      case 'follow':
        return 'started following you';
      case 'bet_won':
        return 'You won from your prediction';
      case 'mention':
        return 'mentioned you in a prediction';
      default:
        return 'sent you a notification';
    }
  };

  return (
    <div>
      <div className={`border-b ${isDark ? 'border-gray-800 bg-black/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md`}>
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : !isAuthenticated ? (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Please login to view notifications
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              className={`p-4 border-b transition-colors cursor-pointer ${
                isDark ? 'border-gray-800 hover:bg-[#16181c]/30' : 'border-gray-200 hover:bg-gray-50'
              } ${!notification.is_read ? (isDark ? 'bg-blue-500/5' : 'bg-blue-50/50') : ''}`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {notification.actor && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onProfileClick?.(notification.actor.username); }}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"
                        style={{ backgroundImage: notification.actor.avatar_url ? `url(${notification.actor.avatar_url})` : undefined, backgroundSize: 'cover' }}
                      ></button>
                    )}
                    <div className="flex-1">
                      <p>
                        {notification.actor && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onProfileClick?.(notification.actor.username); }}
                            className="font-bold hover:underline"
                          >
                            {notification.actor.full_name || notification.actor.username}
                          </button>
                        )}{' '}
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {notification.message || getNotificationMessage(notification.type)}
                        </span>
                      </p>
                      {notification.metadata?.prediction_question && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          "{notification.metadata.prediction_question}"
                        </p>
                      )}
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}
