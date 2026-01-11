/**
 * React Query Hooks for Predictions
 * Provides cached, deduplicated prediction data fetching
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import { toast } from 'sonner';

// Types
interface Prediction {
  id: string;
  question: string;
  description?: string;
  category: string;
  deadline: string;
  creator_id: string;
  total_pot_xp: number;
  is_resolved: boolean;
  // ... other fields
}

interface PredictionsFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: 'active' | 'resolved';
  sort?: string;
  search?: string;
  feedType?: 'for-you' | 'explore';
}

// ==================== QUERIES ====================

/**
 * Fetch predictions list with filters
 * Automatically cached and deduplicated
 */
export function usePredictions(filters?: PredictionsFilters, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.predictions.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.feedType) params.append('feedType', filters.feedType);

      const response = await apiClient.get(`/predictions?${params.toString()}`, {
        enabled: false, // Don't use our custom cache, React Query handles it
      });
      console.log('✅ Fetched predictions:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - predictions change frequently
    ...options,
  });
}

/**
 * Fetch single prediction details
 */
export function usePrediction(id: string | undefined, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.predictions.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Prediction ID is required');
      const response = await apiClient.get(`/predictions/${id}`, { enabled: false });
      console.log('✅ Fetched prediction:', id);
      return response;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options,
  });
}

/**
 * Fetch user's predictions
 */
export function useUserPredictions(userId: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.predictions.userPredictions(userId),
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/predictions`, { enabled: false });
      return response;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Fetch expired predictions needing resolution
 */
export function useExpiredPredictions(options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.predictions.expired(),
    queryFn: async () => {
      const response = await apiClient.get('/predictions/pending-resolutions', { enabled: false });
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - more fresh for pending actions
    ...options,
  });
}

// ==================== MUTATIONS ====================

/**
 * Create new prediction
 */
export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log('🚀 Creating prediction...');
      const response = await apiClient.post('/predictions', data);
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Prediction created:', data);
      toast.success('Prediction created successfully!');
      
      // Invalidate predictions lists
      invalidateQueries.predictions();
      
      // Optimistically add to cache
      if (data.prediction) {
        queryClient.setQueryData(
          queryKeys.predictions.detail(data.prediction.id),
          data
        );
      }
    },
    onError: (error: any) => {
      console.error('❌ Failed to create prediction:', error);
      toast.error(error.message || 'Failed to create prediction');
    },
  });
}

/**
 * Delete prediction
 */
export function useDeletePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (predictionId: string) => {
      console.log('🗑️ Deleting prediction:', predictionId);
      const response = await apiClient.delete(`/predictions/${predictionId}`);
      return { ...response, predictionId };
    },
    onSuccess: (data) => {
      console.log('✅ Prediction deleted:', data.predictionId);
      toast.success('Prediction deleted successfully!');
      
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.predictions.detail(data.predictionId) 
      });
      
      // Invalidate lists
      invalidateQueries.predictions();
    },
    onError: (error: any) => {
      console.error('❌ Failed to delete prediction:', error);
      toast.error(error.message || 'Failed to delete prediction');
    },
  });
}

/**
 * Place bet on prediction
 */
export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ predictionId, ...data }: any) => {
      console.log('💰 Placing bet on:', predictionId);
      const response = await apiClient.post(`/bets`, { prediction_id: predictionId, ...data });
      return { ...response, predictionId };
    },
    onSuccess: (data) => {
      console.log('✅ Bet placed:', data.predictionId);
      toast.success('Bet placed successfully!');
      
      // Invalidate prediction details and stats
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.predictions.detail(data.predictionId) 
      });
      
      // Invalidate wallet balance
      invalidateQueries.wallet();
      
      // Invalidate predictions list (pot size changed)
      invalidateQueries.predictions();
    },
    onError: (error: any) => {
      console.error('❌ Failed to place bet:', error);
      toast.error(error.message || 'Failed to place bet');
    },
  });
}

/**
 * Propose resolution for expired prediction
 */
export function useProposeResolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ predictionId, ...data }: any) => {
      console.log('📝 Proposing resolution for:', predictionId);
      const response = await apiClient.post(`/predictions/${predictionId}/propose-resolution`, data);
      return { ...response, predictionId };
    },
    onSuccess: (data) => {
      console.log('✅ Resolution proposed:', data.predictionId);
      toast.success('Resolution submitted for review!');
      
      // Invalidate prediction details
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.predictions.detail(data.predictionId) 
      });
      
      // Invalidate expired predictions list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.predictions.expired() 
      });
    },
    onError: (error: any) => {
      console.error('❌ Failed to propose resolution:', error);
      toast.error(error.message || 'Failed to submit resolution');
    },
  });
}

// ==================== HELPERS ====================

/**
 * Prefetch prediction details (for hover/navigation)
 */
export function usePrefetchPrediction() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.predictions.detail(id),
      queryFn: async () => {
        const response = await apiClient.get(`/predictions/${id}`, { enabled: false });
        return response;
      },
      staleTime: 3 * 60 * 1000,
    });
  };
}

/**
 * Get cached prediction without triggering fetch
 */
export function useGetCachedPrediction(id: string) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(queryKeys.predictions.detail(id));
}

