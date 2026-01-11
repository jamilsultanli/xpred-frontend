/**
 * React Query Hooks for User, Wallet, and Messages
 * Comprehensive data fetching with caching and deduplication
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { messagesApi } from '../../lib/api/messages';
import { queryKeys, invalidateQueries } from '../../lib/queryClient';
import { toast } from 'sonner';

// ==================== USER QUERIES ====================

/**
 * Fetch current user data
 * Cached for 5 minutes
 */
export function useCurrentUser(options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      console.log('📡 Fetching current user...');
      const response = await apiClient.get('/users/me', { enabled: false });
      console.log('✅ Current user fetched');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    ...options,
  });
}

/**
 * Fetch user profile by ID
 */
export function useUserProfile(userId: string | undefined, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.user.profile(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      console.log('📡 Fetching user profile:', userId);
      const response = await apiClient.get(`/users/${userId}`, { enabled: false });
      return response;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log('📝 Updating profile...');
      const response = await apiClient.put('/users/me', data);
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Profile updated');
      toast.success('Profile updated successfully!');
      
      // Update cache immediately
      queryClient.setQueryData(queryKeys.user.me(), data);
      
      // Invalidate related queries
      invalidateQueries.user();
    },
    onError: (error: any) => {
      console.error('❌ Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

// ==================== WALLET QUERIES ====================

/**
 * Fetch wallet balance
 * Cached for 2 minutes
 */
export function useWalletBalance(options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: async () => {
      console.log('📡 Fetching wallet balance...');
      const response = await apiClient.get('/wallet/balance', { enabled: false });
      console.log('✅ Wallet balance fetched:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - balance changes with bets
    ...options,
  });
}

/**
 * Fetch wallet transactions
 */
export function useWalletTransactions(filters?: any, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.wallet.transactions(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      console.log('📡 Fetching wallet transactions...');
      const response = await apiClient.get(`/wallet/transactions?${params.toString()}`, { enabled: false });
      return response;
    },
    staleTime: 3 * 60 * 1000,
    ...options,
  });
}

// ==================== MESSAGES QUERIES ====================

/**
 * Fetch conversations list
 * Cached for 2 minutes
 */
export function useConversations(options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: async () => {
      console.log('📡 Fetching conversations...');
      const response = await messagesApi.getConversations();
      console.log('✅ Conversations fetched:', response.conversations?.length);
      return response;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch messages in a conversation
 */
export function useMessages(conversationId: string | undefined, page = 1, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.messages.conversation(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      console.log('📡 Fetching messages for conversation:', conversationId);
      const response = await messagesApi.getMessages(conversationId, page);
      return response;
    },
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute - messages change frequently
    ...options,
  });
}

/**
 * Fetch unread message count
 * Cached for 5 minutes
 */
export function useUnreadMessageCount(options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.messages.unreadCount(),
    queryFn: async () => {
      console.log('📡 Fetching unread message count...');
      const response = await messagesApi.getUnreadCount();
      console.log('✅ Unread count:', response.unreadCount);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
    ...options,
  });
}

/**
 * Send message mutation
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      console.log('📤 Sending message...');
      const response = await messagesApi.sendMessage(receiverId, content);
      return response;
    },
    onSuccess: () => {
      console.log('✅ Message sent');
      
      // Invalidate conversations and messages
      invalidateQueries.messages();
    },
    onError: (error: any) => {
      console.error('❌ Failed to send message:', error);
      toast.error(error.message || 'Failed to send message');
    },
  });
}

/**
 * Delete message mutation
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      console.log('🗑️ Deleting message:', messageId);
      const response = await messagesApi.deleteMessage(messageId);
      return { ...response, messageId };
    },
    onSuccess: (data) => {
      console.log('✅ Message deleted');
      toast.success('Message deleted');
      
      // Invalidate messages
      invalidateQueries.messages();
    },
    onError: (error: any) => {
      console.error('❌ Failed to delete message:', error);
      toast.error(error.message || 'Failed to delete message');
    },
  });
}

// ==================== NOTIFICATIONS QUERIES ====================

/**
 * Fetch notifications
 */
export function useNotifications(page = 1, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.notifications.list(page),
    queryFn: async () => {
      console.log('📡 Fetching notifications...');
      const response = await apiClient.get(`/notifications?page=${page}&limit=20`, { enabled: false });
      return response;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch unread notification count
 */
export function useUnreadNotificationCount(options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      console.log('📡 Fetching unread notification count...');
      const response = await apiClient.get('/notifications?page=1&limit=1', { enabled: false });
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
    ...options,
  });
}

// ==================== LEADERBOARD QUERIES ====================

/**
 * Fetch leaderboard
 */
export function useLeaderboard(filters?: any, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.leaderboard.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.period) params.append('period', filters.period);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      console.log('📡 Fetching leaderboard...');
      const response = await apiClient.get(`/leaderboard?${params.toString()}`, { enabled: false });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - leaderboard changes slowly
    ...options,
  });
}

// ==================== XP MARKET QUERIES ====================

/**
 * Fetch XP market items
 */
export function useXPMarketItems(options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.xpMarket.items(),
    queryFn: async () => {
      console.log('📡 Fetching XP market items...');
      const response = await apiClient.get('/xp-market/items', { enabled: false });
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - market items rarely change
    ...options,
  });
}

// ==================== COMBINED HOOKS ====================

/**
 * Fetch all critical page data at once
 * Use this on app initialization
 */
export function usePageLoadData() {
  const user = useCurrentUser();
  const wallet = useWalletBalance();
  const unreadMessages = useUnreadMessageCount();
  const unreadNotifications = useUnreadNotificationCount();

  return {
    user,
    wallet,
    unreadMessages,
    unreadNotifications,
    isLoading: user.isLoading || wallet.isLoading || unreadMessages.isLoading || unreadNotifications.isLoading,
    isError: user.isError || wallet.isError || unreadMessages.isError || unreadNotifications.isError,
  };
}

