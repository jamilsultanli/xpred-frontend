import { apiClient } from './client';

export interface NotificationParams {
  page?: number;
  limit?: number;
  unread_only?: boolean;
  type?: string;
}

export const notificationsApi = {
  getNotifications: async (params?: NotificationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unread_only) queryParams.append('unread_only', 'true');
    if (params?.type) queryParams.append('type', params.type);
    
    const queryString = queryParams.toString();
    return apiClient.get(`/notifications${queryString ? `?${queryString}` : ''}`);
  },

  markAsRead: async (id: string) => {
    return apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.put('/notifications/read-all');
  },

  deleteNotification: async (id: string) => {
    return apiClient.delete(`/notifications/${id}`);
  },
};

