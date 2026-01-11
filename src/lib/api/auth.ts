import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  access_token?: string;
  message?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/login', data);
    // Backend returns 'token' not 'access_token'
    const token = response.token || response.access_token;
    if (response.success && token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', JSON.stringify({ access_token: token }));
      // Update apiClient token
      apiClient.setToken(token);
    }
    return { ...response, access_token: token };
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/register', data);
    // Backend returns 'token' not 'access_token'
    const token = response.token || response.access_token;
    if (response.success && token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', JSON.stringify({ access_token: token }));
      // Update apiClient token
      apiClient.setToken(token);
    }
    return { ...response, access_token: token };
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    apiClient.setToken(null);
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: any }> => {
    return apiClient.get('/users/me');
  },
};

