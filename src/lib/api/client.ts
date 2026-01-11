import { requestCache, CacheTime } from '../cache';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface CacheOptions {
  enabled?: boolean;
  ttl?: number;
  key?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.token = parsed?.access_token || null;
        } catch {
          this.token = stored;
        }
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Refresh token from localStorage on each request
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.token = parsed?.access_token || null;
        } catch {
          // If parsing fails, try using the stored value directly
          this.token = stored;
        }
      } else {
        // Clear token if nothing is stored
        this.token = null;
      }
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          this.token = null;
        }
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const error: any = new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }

    return response.json();
  }

  async get<T>(endpoint: string, cacheOptions?: CacheOptions): Promise<T> {
    const cacheEnabled = cacheOptions?.enabled !== false;
    const cacheKey = cacheOptions?.key || `GET:${endpoint}`;
    const cacheTTL = cacheOptions?.ttl || CacheTime.MEDIUM;

    // Check cache first
    if (cacheEnabled) {
      const cached = requestCache.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Make request
    console.log(`📡 API Request: GET ${endpoint}`);
    const result = await this.request<T>(endpoint, { method: 'GET' });

    // Store in cache
    if (cacheEnabled) {
      requestCache.set(cacheKey, result, cacheTTL);
    }

    return result;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`📡 API Request: POST ${endpoint}`);
    
    // Invalidate related caches on POST
    if (endpoint.includes('/predictions')) {
      requestCache.invalidatePattern(/predictions/);
    } else if (endpoint.includes('/messages')) {
      requestCache.invalidatePattern(/messages/);
    } else if (endpoint.includes('/bets')) {
      requestCache.invalidatePattern(/predictions|wallet/);
    }
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`📡 API Request: PUT ${endpoint}`);
    
    // Invalidate related caches on PUT
    requestCache.invalidatePattern(new RegExp(endpoint.split('/')[1]));
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    console.log(`📡 API Request: DELETE ${endpoint}`);
    
    // Invalidate related caches on DELETE
    requestCache.invalidatePattern(new RegExp(endpoint.split('/')[1]));
    
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
  
  // Clear cache helper methods
  clearCache(key?: string) {
    requestCache.clear(key);
  }
  
  invalidateCache(pattern: RegExp) {
    requestCache.invalidatePattern(pattern);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

