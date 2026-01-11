import { apiClient } from './client';

export interface Prediction {
  id: string;
  question: string;
  description?: string;
  deadline: string;
  category?: string;
  creator_id: string;
  total_pot_xp?: number;
  yes_pool_xp?: number;
  no_pool_xp?: number;
  total_pot_xc?: number;
  yes_pool_xc?: number;
  no_pool_xc?: number;
  market_image?: string;
  market_video?: string;
  created_at: string;
  creator?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  bets_count?: number;
  comments_count?: number;
  likes_count?: number;
  reposts_count?: number;
  is_liked?: boolean;
  is_reposted?: boolean;
}

export interface PredictionsResponse {
  success: boolean;
  predictions: Prediction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const predictionsApi = {
  getPredictions: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    sort?: string;
    search?: string;
  }): Promise<PredictionsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.search) queryParams.append('search', params.search);
    
    return apiClient.get(`/predictions?${queryParams.toString()}`);
  },

  getPrediction: async (id: string): Promise<{ success: boolean; prediction: Prediction }> => {
    return apiClient.get(`/predictions/${id}`);
  },

  createPrediction: async (data: {
    question: string;
    description?: string;
    deadline: string;
    category?: string;
    market_image?: string;
    market_video?: string;
    initial_pot_xp?: number;
  }): Promise<{ 
    success: boolean; 
    prediction: Prediction;
    ai_analysis?: {
      category: string;
      safe: boolean;
      reason: string;
      grammarFixed?: boolean;
      warnings?: string[];
    };
  }> => {
    return apiClient.post('/predictions', data);
  },

  getAISuggestions: async (topic?: string, category?: string): Promise<{
    success: boolean;
    suggestions: string[];
    improvedQuestion?: string;
    suggestedDescription?: string;
  }> => {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (category) params.append('category', category);
    return apiClient.get(`/predictions/ai/suggestions?${params.toString()}`);
  },

  improveQuestion: async (question: string, description?: string): Promise<{
    success: boolean;
    improvedQuestion: string;
    suggestedDescription?: string;
    reasoning?: string;
  }> => {
    return apiClient.post('/predictions/ai/improve', { question, description });
  },

  getExpiredPredictions: async (): Promise<{
    success: boolean;
    predictions: Prediction[];
    count: number;
  }> => {
    return apiClient.get('/predictions/expired');
  },

  resolvePrediction: async (id: string, outcome: boolean, reason?: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient.post(`/predictions/${id}/resolve`, { outcome, reason });
  },

  deletePrediction: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient.delete(`/predictions/${id}`);
  },
};
