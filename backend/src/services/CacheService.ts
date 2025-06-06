/**
 * backend/src/services/CacheService.ts
 * Caching service for query optimization and performance improvement
 */
import { logger } from '../utils/logger';

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
  hits: number;
}

// Cache statistics interface
interface CacheStats {
  size: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  totalRequests: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default
  private maxSize: number = 1000; // Maximum cache entries
  private hits: number = 0;
  private misses: number = 0;

  /**
   * Get singleton instance
   */
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Set cache entry with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    try {
      // Remove oldest entries if cache is full
      if (this.cache.size >= this.maxSize) {
        this.evictOldestEntries();
      }

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
        hits: 0
      };

      this.cache.set(key, entry);

      logger.debug('Cache entry set', {
        key,
        ttl: entry.ttl,
        cacheSize: this.cache.size
      });
    } catch (error) {
      logger.error('Failed to set cache entry', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.misses++;
        logger.debug('Cache miss', { key });
        return null;
      }

      // Check if entry has expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.misses++;
        logger.debug('Cache entry expired', { key });
        return null;
      }

      // Update hit count and return data
      entry.hits++;
      this.hits++;
      
      logger.debug('Cache hit', {
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp
      });

      return entry.data as T;
    } catch (error) {
      logger.error('Failed to get cache entry', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      this.misses++;
      return null;
    }
  }

  /**
   * Check if entry has expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      
      if (deleted) {
        logger.debug('Cache entry deleted', { key });
      }

      return deleted;
    } catch (error) {
      logger.error('Failed to delete cache entry', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      this.hits = 0;
      this.misses = 0;

      logger.info('Cache cleared', { clearedEntries: size });
    } catch (error) {
      logger.error('Failed to clear cache', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.hits,
      totalMisses: this.misses,
      totalRequests
    };
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldestEntries(): void {
    const entriesToEvict = Math.floor(this.maxSize * 0.1); // Remove 10% of entries
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, entriesToEvict);

    for (const [key] of entries) {
      this.cache.delete(key);
    }

    logger.debug('Cache entries evicted', {
      evicted: entriesToEvict,
      currentSize: this.cache.size
    });
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    try {
      const before = this.cache.size;
      const now = Date.now();

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }

      const after = this.cache.size;
      const removed = before - after;

      if (removed > 0) {
        logger.info('Cache cleanup completed', {
          removedEntries: removed,
          currentSize: after
        });
      }
    } catch (error) {
      logger.error('Failed to cleanup cache', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get or set cached value with a function
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch new data
      const data = await fetchFunction();
      
      // Store in cache
      this.set(key, data, ttl);

      logger.debug('Cache miss - data fetched and cached', { key });

      return data;
    } catch (error) {
      logger.error('Failed to get or set cache entry', {
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Generate cache key from query parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    const paramString = JSON.stringify(sortedParams);
    return `${prefix}:${Buffer.from(paramString).toString('base64')}`;
  }

  /**
   * Set multiple cache entries
   */
  setMany<T>(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    try {
      for (const entry of entries) {
        this.set(entry.key, entry.value, entry.ttl);
      }

      logger.debug('Multiple cache entries set', {
        count: entries.length
      });
    } catch (error) {
      logger.error('Failed to set multiple cache entries', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get multiple cache entries
   */
  getMany<T>(keys: string[]): Array<{ key: string; value: T | null }> {
    return keys.map(key => ({
      key,
      value: this.get<T>(key)
    }));
  }

  /**
   * Delete cache entries by pattern
   */
  deleteByPattern(pattern: string): number {
    try {
      const regex = new RegExp(pattern);
      let deleted = 0;

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          deleted++;
        }
      }

      logger.debug('Cache entries deleted by pattern', {
        pattern,
        deleted
      });

      return deleted;
    } catch (error) {
      logger.error('Failed to delete cache entries by pattern', {
        pattern,
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval(intervalMs: number = 60000): void {
    setInterval(() => {
      this.cleanup();
    }, intervalMs);

    logger.info('Cache cleanup interval started', {
      intervalMs
    });
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();
export default cacheService; 