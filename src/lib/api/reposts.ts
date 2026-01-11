import { apiClient } from './client';

export interface Repost {
  id: string;
  user_id: string;
  prediction_id: string;
  created_at: string;
  user?: any;
}

export interface RepostsResponse {
  success: boolean;
  reposts: Repost[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const repostsApi = {
  repost: async (predictionId: string): Promise<{ success: boolean; message: string; repost: Repost }> => {
    return apiClient.post(`/predictions/${predictionId}/repost`);
  },

  unrepost: async (predictionId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/predictions/${predictionId}/repost`);
  },

  getReposts: async (predictionId: string, page = 1, limit = 20): Promise<RepostsResponse> => {
    return apiClient.get(`/predictions/${predictionId}/reposts?page=${page}&limit=${limit}`);
  },

  getUserReposts: async (username: string, page = 1, limit = 20): Promise<RepostsResponse> => {
    return apiClient.get(`/users/${username}/reposts?page=${page}&limit=${limit}`);
  },
};

