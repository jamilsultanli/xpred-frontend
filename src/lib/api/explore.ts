import { apiClient } from './client';

export interface ExploreSearchParams {
  q?: string;
  type?: 'all' | 'predictions' | 'users';
  category?: string;
  page?: number;
  limit?: number;
}

export interface Category {
  name: string;
  count: number;
  active_predictions: number;
}

export const exploreApi = {
  search: async (params: ExploreSearchParams) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.type) queryParams.append('type', params.type);
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    return apiClient.get(`/explore/search?${queryParams.toString()}`);
  },

  getCategories: async (): Promise<{ success: boolean; categories: Category[] }> => {
    return apiClient.get('/explore/categories');
  },

  getTrending: async (period?: string, limit?: number): Promise<{ success: boolean; predictions: any[] }> => {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);
    if (limit) queryParams.append('limit', limit.toString());
    
    return apiClient.get(`/explore/trending?${queryParams.toString()}`);
  },
};

