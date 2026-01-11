import { apiClient } from './client';

export interface Comment {
  id: string;
  post_id?: string;
  prediction_id?: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

export interface CommentsResponse {
  success: boolean;
  comments: Comment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const commentsApi = {
  getComments: async (predictionId: string, params?: { page?: number; limit?: number }): Promise<CommentsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    // Backend route: /api/v1/posts/:id/comments
    return apiClient.get(`/posts/${predictionId}/comments?${queryParams.toString()}`);
  },

  addComment: async (predictionId: string, content: string, parentId?: string): Promise<{ success: boolean; comment: Comment }> => {
    // Backend route: /api/v1/posts/:id/comments
    return apiClient.post(`/posts/${predictionId}/comments`, {
      content,
      parent_id: parentId,
    });
  },

  deleteComment: async (commentId: string): Promise<{ success: boolean; message: string }> => {
    // Backend route: /api/v1/posts/comments/:id
    return apiClient.delete(`/posts/comments/${commentId}`);
  },
};

