import { apiClient } from './client';

export interface Community {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  creator_id?: string;
  created_at: string;
  updated_at: string;
  creator?: any;
  members?: number;
  predictions?: number;
  isJoined?: boolean;
}

export interface CommunitiesResponse {
  success: boolean;
  communities: Community[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CommunityResponse {
  success: boolean;
  community: Community;
}

export interface CommunityMembersResponse {
  success: boolean;
  members: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const communitiesApi = {
  getBestCommunities: async (limit = 10): Promise<{ success: boolean; communities: Community[] }> => {
    return apiClient.get(`/communities/best?limit=${limit}`);
  },

  getCommunities: async (page = 1, limit = 20, search?: string, featured?: boolean): Promise<CommunitiesResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    if (featured) params.append('featured', 'true');
    return apiClient.get(`/communities?${params.toString()}`);
  },

  getCommunity: async (id: string): Promise<CommunityResponse> => {
    return apiClient.get(`/communities/${id}`);
  },

  createCommunity: async (data: { name: string; description?: string; avatar_url?: string; banner_url?: string }): Promise<{ success: boolean; message: string; community: Community }> => {
    return apiClient.post('/communities', data);
  },

  updateCommunity: async (id: string, data: { description?: string; avatar_url?: string; banner_url?: string }): Promise<{ success: boolean; message: string; community: Community }> => {
    return apiClient.put(`/communities/${id}`, data);
  },

  deleteCommunity: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/communities/${id}`);
  },

  joinCommunity: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post(`/communities/${id}/join`);
  },

  leaveCommunity: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/communities/${id}/join`);
  },

  getCommunityMembers: async (id: string, page = 1, limit = 20): Promise<CommunityMembersResponse> => {
    return apiClient.get(`/communities/${id}/members?page=${page}&limit=${limit}`);
  },

  getCommunityPredictions: async (id: string, page = 1, limit = 20): Promise<any> => {
    return apiClient.get(`/communities/${id}/predictions?page=${page}&limit=${limit}`);
  },

  getUserCommunities: async (username: string, page = 1, limit = 20): Promise<CommunitiesResponse> => {
    return apiClient.get(`/users/${username}/communities?page=${page}&limit=${limit}`);
  },
};

