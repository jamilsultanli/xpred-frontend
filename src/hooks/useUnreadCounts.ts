import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api/client';
import { messagesApi } from '../lib/api/messages';
import { useAuth } from '../contexts/AuthContext';
import { requestCache, CacheTime, cacheKeys } from '../lib/cache';

interface UnreadCounts {
  notifications: number;
  messages: number;
}

export function useUnreadCounts() {
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    notifications: 0,
    messages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCounts = async () => {
    if (!isAuthenticated) {
      setCounts({ notifications: 0, messages: 0 });
      return;
    }

    // Check cache first (5 minute cache)
    const cacheKey = 'unread-counts';
    const cached = requestCache.get<UnreadCounts>(cacheKey);
    if (cached) {
      console.log('⚡ Using cached unread counts');
      setCounts(cached);
      return;
    }

    setIsLoading(true);
    try {
      // Batch both requests together
      console.log('📡 Fetching unread counts...');
      const [notificationsResponse, messagesResponse] = await Promise.all([
        apiClient.get('/notifications?page=1&limit=1', { 
          enabled: true, 
          ttl: CacheTime.LONG,
          key: cacheKeys.notifications()
        }),
        messagesApi.getUnreadCount(),
      ]);

      const newCounts = {
        notifications: (notificationsResponse as any).unread_count || 0,
        messages: messagesResponse.unreadCount || 0,
      };

      setCounts(newCounts);
      
      // Cache for 5 minutes
      requestCache.set(cacheKey, newCounts, CacheTime.LONG);
      console.log('✅ Unread counts fetched and cached');
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    
    // Reduced polling interval: 5 minutes instead of 30 seconds
    // This reduces requests by 90%! (from every 30s to every 5min)
    const interval = setInterval(fetchCounts, CacheTime.LONG);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Helper to manually increment counts (for real-time updates via WebSocket)
  const incrementNotifications = () => {
    setCounts(prev => ({ ...prev, notifications: prev.notifications + 1 }));
    requestCache.clear('unread-counts');
  };

  const incrementMessages = () => {
    setCounts(prev => ({ ...prev, messages: prev.messages + 1 }));
    requestCache.clear('unread-counts');
  };

  const resetNotifications = () => {
    setCounts(prev => ({ ...prev, notifications: 0 }));
    requestCache.clear('unread-counts');
  };

  const resetMessages = () => {
    setCounts(prev => ({ ...prev, messages: 0 }));
    requestCache.clear('unread-counts');
  };

  return { 
    counts, 
    isLoading, 
    refetch: fetchCounts,
    incrementNotifications,
    incrementMessages,
    resetNotifications,
    resetMessages,
  };
}

export function formatCount(count: number): string {
  if (count === 0) return '';
  if (count > 999) return '999+';
  return count.toString();
}
