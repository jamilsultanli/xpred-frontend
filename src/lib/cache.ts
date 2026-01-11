/**
 * Request Cache Utility
 * Implements in-memory caching with TTL (Time To Live)
 * Reduces redundant API calls and improves performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 60000; // 1 minute default

  /**
   * Store data in cache with expiration
   */
  set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
    
    console.log(`💾 Cache SET: ${key} (expires in ${expiresIn}ms)`);
  }

  /**
   * Retrieve data from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const isExpired = age > entry.expiresIn;

    if (isExpired) {
      console.log(`🗑️ Cache EXPIRED: ${key} (age: ${age}ms)`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT: ${key} (age: ${age}ms)`);
    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  /**
   * Clear specific key or entire cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`🗑️ Cache CLEARED: ${key}`);
    } else {
      this.cache.clear();
      console.log('🗑️ Cache CLEARED: All entries');
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    let count = 0;
    Array.from(this.cache.keys()).forEach(key => {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    });
    console.log(`🗑️ Cache INVALIDATED: ${count} entries matching ${pattern}`);
  }

  /**
   * Get cache statistics
   */
  stats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    const valid = entries.filter(([_, entry]) => 
      now - entry.timestamp < entry.expiresIn
    );
    
    const expired = entries.length - valid.length;
    
    return {
      total: entries.length,
      valid: valid.length,
      expired,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
    };
  }

  private hitCount = 0;
  private missCount = 0;

  /**
   * Get cache size in entries
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const requestCache = new RequestCache();

// Cache time constants (in milliseconds)
export const CacheTime = {
  NONE: 0,
  SHORT: 30 * 1000,        // 30 seconds
  MEDIUM: 2 * 60 * 1000,   // 2 minutes
  LONG: 5 * 60 * 1000,     // 5 minutes
  VERY_LONG: 15 * 60 * 1000, // 15 minutes
} as const;

// Helper to generate cache keys
export const cacheKeys = {
  user: (id?: string) => id ? `user:${id}` : 'user:me',
  wallet: () => 'wallet:balance',
  notifications: () => 'notifications:unread',
  messages: () => 'messages:unread',
  predictions: (filters?: string) => `predictions:${filters || 'all'}`,
  prediction: (id: string) => `prediction:${id}`,
} as const;

