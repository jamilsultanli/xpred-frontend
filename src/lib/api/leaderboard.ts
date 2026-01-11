import { apiClient } from './client';

export interface LeaderboardParams {
  type?: 'xp' | 'xc' | 'wins';
  period?: 'all_time' | 'monthly' | 'weekly';
  limit?: number;
}

export const leaderboardApi = {
  getLeaderboard: async (params?: LeaderboardParams) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.period) queryParams.append('period', params.period);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return apiClient.get(`/leaderboard${queryString ? `?${queryString}` : ''}`);
  },
};

