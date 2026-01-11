import { apiClient } from './client';

export interface UserStats {
  totalXP: number;
  totalXC: number;
  activeBets: number;
  winRate: number;
  totalPredictions: number;
  totalBets: number;
  totalWinningsXP: number;
  totalWinningsXC: number;
}

export interface UserStatsResponse {
  success: boolean;
  stats: UserStats;
}

export const usersApi = {
  getStats: async (username?: string): Promise<UserStatsResponse> => {
    if (username) {
      return apiClient.get(`/users/${username}/stats`);
    }
    return apiClient.get('/users/me/stats');
  },

  getByUsername: async (username: string) => {
    return apiClient.get(`/users/${username}`);
  },

  getById: async (id: string) => {
    return apiClient.get(`/users/by-id/${id}`);
  },

  getPredictions: async (username: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(`/users/${username}/predictions?page=${page}&limit=${limit}`);
  },

  getFollowers: async (username: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(`/users/${username}/followers?page=${page}&limit=${limit}`);
  },

  getFollowing: async (username: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(`/users/${username}/following?page=${page}&limit=${limit}`);
  },
};

