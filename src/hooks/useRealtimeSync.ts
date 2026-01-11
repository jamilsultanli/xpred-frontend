/**
 * Enhanced WebSocket Manager with React Query Integration
 * Handles real-time updates and automatic cache invalidation
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import { requestCache } from '../lib/cache';

/**
 * Hook to setup real-time cache invalidation via WebSocket
 * Automatically updates React Query cache when server events occur
 */
export function useRealtimeInvalidation() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const setupRef = useRef(false);

  useEffect(() => {
    if (!socket || !isConnected || setupRef.current) return;

    console.log('🔌 Setting up real-time cache invalidation...');
    setupRef.current = true;

    // ==================== PREDICTION EVENTS ====================
    
    // New prediction created
    socket.on('prediction_created', (data: any) => {
      console.log('🆕 New prediction created:', data.prediction?.id);
      
      // Invalidate predictions list
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions.all });
      
      // Clear Phase 1 cache
      requestCache.invalidatePattern(/predictions/);
    });

    // Prediction updated (new bet placed)
    socket.on('prediction_updated', (data: any) => {
      console.log('🔄 Prediction updated:', data.predictionId);
      
      // Invalidate specific prediction
      if (data.predictionId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.predictions.detail(data.predictionId) 
        });
      }
      
      // Invalidate lists (pot size changed)
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions.list() });
    });

    // Prediction resolved
    socket.on('prediction_resolved', (data: any) => {
      console.log('✅ Prediction resolved:', data.predictionId);
      
      // Invalidate prediction and related queries
      if (data.predictionId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.predictions.detail(data.predictionId) 
        });
      }
      
      // Invalidate wallet (user may have won)
      invalidateQueries.wallet();
      
      // Invalidate predictions lists
      invalidateQueries.predictions();
    });

    // ==================== MESSAGE EVENTS ====================
    
    // New message received
    socket.on('new_message_notification', (data: any) => {
      console.log('💬 New message notification:', data.conversationId);
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
      
      // Invalidate specific conversation
      if (data.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.messages.conversation(data.conversationId) 
        });
      }
      
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.unreadCount() });
      
      // Clear Phase 1 cache
      requestCache.clear('unread-counts');
      requestCache.invalidatePattern(/messages/);
    });

    // Message read
    socket.on('message_read', (data: any) => {
      console.log('👁️ Message read:', data.conversationId);
      
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.unreadCount() });
      requestCache.clear('unread-counts');
    });

    // ==================== NOTIFICATION EVENTS ====================
    
    // New notification
    socket.on('new_notification', (data: any) => {
      console.log('🔔 New notification:', data.type);
      
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      
      // Clear Phase 1 cache
      requestCache.clear('unread-counts');
    });

    // Notification read
    socket.on('notification_read', () => {
      console.log('👁️ Notification read');
      
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      requestCache.clear('unread-counts');
    });

    // ==================== WALLET EVENTS ====================
    
    // Wallet balance updated
    socket.on('wallet_updated', (data: any) => {
      console.log('💰 Wallet updated:', data.balance);
      
      // Update wallet cache immediately if data provided
      if (data.balance !== undefined) {
        queryClient.setQueryData(queryKeys.wallet.balance(), {
          success: true,
          balance: data.balance,
        });
      } else {
        // Otherwise just invalidate
        invalidateQueries.wallet();
      }
      
      // Clear Phase 1 cache
      requestCache.invalidatePattern(/wallet/);
    });

    // ==================== USER EVENTS ====================
    
    // User profile updated
    socket.on('user_updated', (data: any) => {
      console.log('👤 User updated:', data.userId);
      
      // Invalidate user queries
      if (data.userId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.user.profile(data.userId) 
        });
      }
      
      // If current user, invalidate "me"
      if (data.isCurrentUser) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
        requestCache.clear(cacheKeys.user());
      }
    });

    // User online status changed
    socket.on('user_status_updated', (data: { userId: string; isOnline: boolean }) => {
      console.log('🟢 User status updated:', data.userId, data.isOnline);
      
      // Update user profile cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.profile(data.userId) 
      });
    });

    // ==================== LEADERBOARD EVENTS ====================
    
    // Leaderboard updated
    socket.on('leaderboard_updated', () => {
      console.log('🏆 Leaderboard updated');
      
      // Invalidate leaderboard queries
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.all });
    });

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up real-time listeners...');
      
      socket.off('prediction_created');
      socket.off('prediction_updated');
      socket.off('prediction_resolved');
      socket.off('new_message_notification');
      socket.off('message_read');
      socket.off('new_notification');
      socket.off('notification_read');
      socket.off('wallet_updated');
      socket.off('user_updated');
      socket.off('user_status_updated');
      socket.off('leaderboard_updated');
      
      setupRef.current = false;
    };
  }, [socket, isConnected, queryClient]);

  return {
    isConnected,
    setupComplete: setupRef.current,
  };
}

/**
 * Hook to manually trigger cache updates
 */
export function useCacheSync() {
  const queryClient = useQueryClient();

  return {
    // Sync all caches
    syncAll: () => {
      console.log('🔄 Syncing all caches...');
      queryClient.invalidateQueries();
      requestCache.clear();
    },
    
    // Sync specific resource
    syncPredictions: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions.all });
      requestCache.invalidatePattern(/predictions/);
    },
    
    syncMessages: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      requestCache.invalidatePattern(/messages/);
    },
    
    syncWallet: () => {
      invalidateQueries.wallet();
      requestCache.invalidatePattern(/wallet/);
    },
    
    syncUser: () => {
      invalidateQueries.user();
      requestCache.clear(cacheKeys.user());
    },
  };
}

/**
 * Hook for optimistic updates
 * Updates cache immediately before server responds
 */
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  return {
    // Optimistically add new prediction to cache
    addPrediction: (prediction: any) => {
      queryClient.setQueryData(
        queryKeys.predictions.list(),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            predictions: [prediction, ...(old.predictions || [])],
          };
        }
      );
    },
    
    // Optimistically update wallet balance
    updateWalletBalance: (delta: number) => {
      queryClient.setQueryData(
        queryKeys.wallet.balance(),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            balance: (old.balance || 0) + delta,
          };
        }
      );
    },
    
    // Optimistically mark message as read
    markMessageRead: (conversationId: string, messageId: string) => {
      queryClient.setQueryData(
        queryKeys.messages.conversation(conversationId),
        (old: any) => {
          if (!old || !old.messages) return old;
          return {
            ...old,
            messages: old.messages.map((msg: any) => 
              msg.id === messageId ? { ...msg, is_read: true } : msg
            ),
          };
        }
      );
    },
  };
}

// Import cache keys
import { cacheKeys } from '../lib/cache';

