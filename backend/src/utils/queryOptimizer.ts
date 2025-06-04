/**
 * backend/src/utils/queryOptimizer.ts
 * Database query optimization and caching utilities
 */

// Query performance monitoring
export interface QueryPerformanceMetrics {
  queryName: string;
  executionTime: number;
  rowsReturned: number;
  cacheHit: boolean;
  timestamp: Date;
}

// In-memory cache for frequently accessed data
class QueryCache {
  private cache = new Map<string, { data: any; expiry: number; hits: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      hits: 0
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    item.hits++;
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate: number } {
    const totalHits = Array.from(this.cache.values()).reduce((sum, item) => sum + item.hits, 0);
    const totalRequests = this.cache.size;
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0
    };
  }
}

export const queryCache = new QueryCache();

// Query optimization decorator
export const withQueryOptimization = (
  queryName: string,
  cacheKey?: string,
  cacheTTL?: number
) => {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const startTime = Date.now();
      const actualCacheKey = cacheKey || `${queryName}:${JSON.stringify(args)}`;

      // Try cache first
      const cachedResult = queryCache.get(actualCacheKey);
      if (cachedResult) {
        console.log(`Cache hit for ${queryName}`);
        return cachedResult;
      }

      try {
        // Execute original method
        const result = await method.apply(this, args);
        const executionTime = Date.now() - startTime;

        // Cache the result
        queryCache.set(actualCacheKey, result, cacheTTL);

        // Log performance metrics
        console.log(`Query ${queryName}: ${executionTime}ms, ${result?.length || 'N/A'} rows`);

        return result;
      } catch (error) {
        console.error(`Query ${queryName} failed:`, error);
        throw error;
      }
    };

    return descriptor;
  };
};

// Database query optimizations
export class QueryOptimizer {
  // Optimize pagination queries
  static optimizePagination(query: any, page: number, limit: number) {
    // Use cursor-based pagination for better performance
    const offset = (page - 1) * limit;
    
    return {
      ...query,
      skip: offset,
      limit: Math.min(limit, 100), // Cap at 100 items
      sort: { _id: -1 } // Ensure consistent ordering
    };
  }

  // Add indexes for common query patterns
  static getRecommendedIndexes() {
    return [
      // User queries
      { collection: 'users', index: { email: 1 } },
      { collection: 'users', index: { username: 1 } },
      
      // Task queries  
      { collection: 'tasks', index: { userId: 1, status: 1 } },
      { collection: 'tasks', index: { userId: 1, priority: 1 } },
      { collection: 'tasks', index: { userId: 1, dueDate: 1 } },
      
      // Fitness queries
      { collection: 'fitness', index: { userId: 1, date: -1 } },
      { collection: 'fitness', index: { userId: 1, measurementType: 1 } },
      
      // File queries
      { collection: 'files', index: { userId: 1, category: 1 } },
      { collection: 'files', index: { relatedEntityId: 1 } },
    ];
  }

  // Batch operations for better performance
  static async batchInsert<T>(
    collection: any, 
    documents: T[], 
    batchSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await collection.insertMany(batch);
    }
  }

  // Aggregate query optimizer
  static optimizeAggregation(pipeline: any[]) {
    // Move $match stages to the beginning
    const matchStages = pipeline.filter(stage => stage.$match);
    const otherStages = pipeline.filter(stage => !stage.$match);
    
    return [
      ...matchStages,
      ...otherStages
    ];
  }

  // Query performance analyzer
  static async analyzeQuery(
    collection: any,
    query: any,
    options: any = {}
  ): Promise<QueryPerformanceMetrics> {
    const startTime = Date.now();
    const queryName = collection.collectionName;

    try {
      const result = await collection.find(query, options).toArray();
      const executionTime = Date.now() - startTime;

      const metrics: QueryPerformanceMetrics = {
        queryName,
        executionTime,
        rowsReturned: result.length,
        cacheHit: false,
        timestamp: new Date()
      };

      // Log slow queries
      if (executionTime > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${executionTime}ms`);
      }

      return metrics;
    } catch (error) {
      console.error(`Query analysis failed for ${queryName}:`, error);
      throw error;
    }
  }
}

// Connection pooling optimizer
export class ConnectionPoolOptimizer {
  private static instance: ConnectionPoolOptimizer;
  private activeConnections = 0;
  private maxConnections = 10;

  static getInstance(): ConnectionPoolOptimizer {
    if (!ConnectionPoolOptimizer.instance) {
      ConnectionPoolOptimizer.instance = new ConnectionPoolOptimizer();
    }
    return ConnectionPoolOptimizer.instance;
  }

  async withConnection<T>(operation: () => Promise<T>): Promise<T> {
    if (this.activeConnections >= this.maxConnections) {
      throw new Error('Connection pool exhausted');
    }

    this.activeConnections++;
    try {
      return await operation();
    } finally {
      this.activeConnections--;
    }
  }

  getConnectionStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      utilization: this.activeConnections / this.maxConnections
    };
  }
}

// Query builder for common patterns
export class OptimizedQueryBuilder {
  static buildUserQuery(filters: {
    email?: string;
    status?: string;
    search?: string;
  }) {
    const query: any = {};

    if (filters.email) {
      query.email = filters.email;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { username: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return query;
  }

  static buildTaskQuery(userId: string, filters: {
    status?: string;
    priority?: string;
    dateRange?: { start: Date; end: Date };
  }) {
    const query: any = { userId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.dateRange) {
      query.dueDate = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }

    return query;
  }

  static buildFitnessQuery(userId: string, filters: {
    measurementType?: string;
    dateRange?: { start: Date; end: Date };
  }) {
    const query: any = { userId };

    if (filters.measurementType) {
      query.measurementType = filters.measurementType;
    }

    if (filters.dateRange) {
      query.date = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }

    return query;
  }
} 