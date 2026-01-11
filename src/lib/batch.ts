/**
 * Batch Request Utility
 * Combines multiple API requests into a single batch call
 * Reduces network overhead and improves performance
 */

import { apiClient } from './api/client';

interface BatchRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
}

interface BatchResponse<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
}

class BatchRequestManager {
  private queue: BatchRequest[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // ms - wait before executing batch
  private readonly MAX_BATCH_SIZE = 10;
  private requestCallbacks = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();

  /**
   * Add a request to the batch queue
   */
  add<T = any>(method: string, endpoint: string, data?: any): Promise<T> {
    const id = `${method}:${endpoint}:${Date.now()}:${Math.random()}`;
    
    const promise = new Promise<T>((resolve, reject) => {
      this.requestCallbacks.set(id, { resolve, reject });
    });

    this.queue.push({
      id,
      method: method as any,
      endpoint,
      data,
    });

    // Schedule batch execution
    this.scheduleBatch();

    return promise;
  }

  /**
   * Schedule batch execution
   */
  private scheduleBatch() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Execute immediately if queue is full
    if (this.queue.length >= this.MAX_BATCH_SIZE) {
      this.executeBatch();
      return;
    }

    // Otherwise wait for more requests
    this.timeout = setTimeout(() => {
      this.executeBatch();
    }, this.BATCH_DELAY);
  }

  /**
   * Execute all queued requests
   */
  private async executeBatch() {
    if (this.queue.length === 0) return;

    const requests = [...this.queue];
    this.queue = [];
    this.timeout = null;

    console.log(`📦 Batch executing ${requests.length} requests`);

    // Execute each request individually (for now)
    // In a real implementation, you'd send this to a backend batch endpoint
    const results = await Promise.allSettled(
      requests.map(async (req) => {
        try {
          let result;
          switch (req.method) {
            case 'GET':
              result = await apiClient.get(req.endpoint);
              break;
            case 'POST':
              result = await apiClient.post(req.endpoint, req.data);
              break;
            case 'PUT':
              result = await apiClient.put(req.endpoint, req.data);
              break;
            case 'DELETE':
              result = await apiClient.delete(req.endpoint);
              break;
          }
          return { id: req.id, success: true, data: result };
        } catch (error: any) {
          return { id: req.id, success: false, error: error.message };
        }
      })
    );

    // Resolve/reject promises
    results.forEach((result, index) => {
      const requestId = requests[index].id;
      const callbacks = this.requestCallbacks.get(requestId);
      
      if (callbacks) {
        if (result.status === 'fulfilled') {
          const response = result.value as BatchResponse;
          if (response.success) {
            callbacks.resolve(response.data);
          } else {
            callbacks.reject(new Error(response.error));
          }
        } else {
          callbacks.reject(result.reason);
        }
        
        this.requestCallbacks.delete(requestId);
      }
    });
  }

  /**
   * Get batch statistics
   */
  stats() {
    return {
      queueSize: this.queue.length,
      pendingCallbacks: this.requestCallbacks.size,
    };
  }
}

// Export singleton instance
export const batchRequestManager = new BatchRequestManager();

/**
 * Helper function to batch multiple GET requests
 */
export async function batchGet<T = any>(endpoints: string[]): Promise<T[]> {
  console.log(`📦 Batching ${endpoints.length} GET requests`);
  return Promise.all(
    endpoints.map(endpoint => batchRequestManager.add<T>('GET', endpoint))
  );
}

/**
 * Helper to batch common page load requests
 */
export async function batchPageLoadRequests() {
  console.log('📦 Batching page load requests');
  
  const [user, wallet, notifications, messages] = await batchGet([
    '/users/me',
    '/wallet/balance',
    '/notifications?page=1&limit=1',
    '/messages/unread-count',
  ]);

  return {
    user,
    wallet,
    notifications,
    messages,
  };
}

