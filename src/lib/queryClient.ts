/**
 * React Query Configuration
 * Advanced caching, deduplication, and state management
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default options for all queries
const defaultOptions: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    
    // Keep unused data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Don't refetch on window focus (too aggressive)
    refetchOnWindowFocus: false,
    
    // Don't refetch on reconnect
    refetchOnReconnect: false,
    
    // Don't refetch on mount if data exists
    refetchOnMount: false,
    
    // Retry failed requests once
    retry: 1,
    
    // Retry delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Retry mutations once
    retry: 1,
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions,
  logger: {
    log: (...args) => {
      if (import.meta.env.DEV) {
        console.log('[React Query]', ...args);
      }
    },
    warn: (...args) => {
      console.warn('[React Query]', ...args);
    },
    error: (...args) => {
      console.error('[React Query]', ...args);
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
    profile: (id: string) => [...queryKeys.user.all, 'profile', id] as const,
    followers: (id: string) => [...queryKeys.user.all, 'followers', id] as const,
    following: (id: string) => [...queryKeys.user.all, 'following', id] as const,
  },
  
  // Wallet queries
  wallet: {
    all: ['wallet'] as const,
    balance: () => [...queryKeys.wallet.all, 'balance'] as const,
    transactions: (filters?: any) => [...queryKeys.wallet.all, 'transactions', filters] as const,
  },
  
  // Predictions queries
  predictions: {
    all: ['predictions'] as const,
    list: (filters?: any) => [...queryKeys.predictions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.predictions.all, 'detail', id] as const,
    stats: (id: string) => [...queryKeys.predictions.all, 'stats', id] as const,
    userPredictions: (userId: string) => [...queryKeys.predictions.all, 'user', userId] as const,
    expired: () => [...queryKeys.predictions.all, 'expired'] as const,
  },
  
  // Messages queries
  messages: {
    all: ['messages'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,
    conversation: (id: string) => [...queryKeys.messages.all, 'conversation', id] as const,
    unreadCount: () => [...queryKeys.messages.all, 'unread-count'] as const,
  },
  
  // Notifications queries
  notifications: {
    all: ['notifications'] as const,
    list: (page: number) => [...queryKeys.notifications.all, 'list', page] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
  
  // Leaderboard queries
  leaderboard: {
    all: ['leaderboard'] as const,
    list: (filters?: any) => [...queryKeys.leaderboard.all, 'list', filters] as const,
  },
  
  // XP Market queries
  xpMarket: {
    all: ['xp-market'] as const,
    items: () => [...queryKeys.xpMarket.all, 'items'] as const,
  },
} as const;

// Invalidation helpers
export const invalidateQueries = {
  user: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
  wallet: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all }),
  predictions: () => queryClient.invalidateQueries({ queryKey: queryKeys.predictions.all }),
  messages: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages.all }),
  notifications: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  all: () => queryClient.invalidateQueries(),
};

// Prefetch helpers
export const prefetchQueries = {
  userProfile: async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(id),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  predictions: async (filters?: any) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.predictions.list(filters),
      staleTime: 2 * 60 * 1000,
    });
  },
};

// Cache utilities
export const cacheUtils = {
  // Get cached data without triggering a fetch
  getCachedData: <T = any>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },
  
  // Set data in cache manually
  setQueryData: <T = any>(queryKey: readonly unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },
  
  // Remove specific query from cache
  removeQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear();
  },
  
  // Get cache statistics
  getStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.fetchStatus !== 'idle').length,
      staleQueries: queries.filter(q => q.isStale()).length,
      cacheSize: queries.reduce((acc, q) => {
        const dataSize = JSON.stringify(q.state.data).length;
        return acc + dataSize;
      }, 0),
    };
  },
};

// Development helpers
if (import.meta.env.DEV) {
  // Expose utilities in dev mode
  (window as any).__reactQuery = {
    queryClient,
    queryKeys,
    invalidateQueries,
    cacheUtils,
  };
  
  console.log('🔧 React Query DevTools available');
  console.log('Access via: window.__reactQuery');
}

