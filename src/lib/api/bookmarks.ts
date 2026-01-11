import { apiClient } from './client';

export interface Bookmark {
  id: string;
  user_id: string;
  prediction_id: string;
  created_at: string;
  prediction?: any;
}

export interface BookmarksResponse {
  success: boolean;
  bookmarks: Bookmark[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BookmarkStatusResponse {
  success: boolean;
  isBookmarked: boolean;
}

export const bookmarksApi = {
  bookmark: async (predictionId: string): Promise<{ success: boolean; message: string; bookmark: Bookmark }> => {
    return apiClient.post(`/bookmarks`, { predictionId });
  },

  unbookmark: async (predictionId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/bookmarks/${predictionId}`);
  },

  getBookmarks: async (page = 1, limit = 20): Promise<BookmarksResponse> => {
    return apiClient.get(`/bookmarks?page=${page}&limit=${limit}`);
  },

  getBookmarkStatus: async (predictionId: string): Promise<BookmarkStatusResponse> => {
    return apiClient.get(`/bookmarks/${predictionId}/status`);
  },
};

