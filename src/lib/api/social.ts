import { apiClient } from './client';

export const socialApi = {
  followUser: async (userId: string) => {
    return apiClient.post(`/social/users/${userId}/follow`);
  },

  unfollowUser: async (userId: string) => {
    return apiClient.delete(`/social/users/${userId}/follow`);
  },

  getFollowStatus: async (userId: string) => {
    return apiClient.get(`/social/users/${userId}/follow-status`);
  },
};

