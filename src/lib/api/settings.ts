import { apiClient } from './client';

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  reposts: boolean;
  follows: boolean;
  wins: boolean;
  mentions: boolean;
}

export interface ProfileUpdateData {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
}

export const settingsApi = {
  getNotificationSettings: async (): Promise<{ success: boolean; settings: NotificationSettings }> => {
    return apiClient.get('/settings/notifications');
  },

  updateNotificationSettings: async (settings: Partial<NotificationSettings>): Promise<{ success: boolean; message?: string }> => {
    return apiClient.put('/settings/notifications', settings);
  },

  updateProfile: async (data: ProfileUpdateData): Promise<{ success: boolean; user?: any; message?: string }> => {
    return apiClient.put('/users/me', data);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    return apiClient.post('/settings/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  changeUsername: async (newUsername: string): Promise<{ success: boolean; message?: string }> => {
    return apiClient.put('/users/me', { username: newUsername });
  },

  changeEmail: async (newEmail: string, password: string): Promise<{ success: boolean; message?: string }> => {
    return apiClient.post('/settings/change-email', {
      new_email: newEmail,
      password,
    });
  },
};

