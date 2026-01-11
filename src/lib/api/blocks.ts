import { apiClient } from './client';

export const blocksApi = {
  blockUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/blocks/block', { user_id: userId });
  },

  unblockUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/blocks/unblock', { user_id: userId });
  },

  getBlockedUsers: async (): Promise<{ success: boolean; blocked_users: any[] }> => {
    return apiClient.get('/blocks/blocked');
  },

  muteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/blocks/mute', { user_id: userId });
  },

  unmuteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/blocks/unmute', { user_id: userId });
  },

  getMutedUsers: async (): Promise<{ success: boolean; muted_users: any[] }> => {
    return apiClient.get('/blocks/muted');
  },
};

