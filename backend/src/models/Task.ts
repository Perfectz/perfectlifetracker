/**
 * backend/src/models/Task.ts
 * Task model with optimized queries and caching
 */
import { Container } from '@azure/cosmos';
import { withQueryOptimization, QueryOptimizer, OptimizedQueryBuilder } from '../utils/queryOptimizer';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: string;
}

export class TaskModel {
  constructor(private container: Container) {}

  // Optimized query with caching - 5 minute cache
  async getUserTasks(
    userId: string, 
    filters: {
      status?: string;
      priority?: string;
      dateRange?: { start: Date; end: Date };
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ tasks: Task[]; total: number }> {
    const cacheKey = `tasks:${userId}:${JSON.stringify(filters)}:${page}:${limit}`;
    
    // Try cache first
    const { queryCache } = await import('../utils/queryOptimizer');
    const cached = queryCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for getUserTasks - ${userId}`);
      return cached;
    }

    const query = OptimizedQueryBuilder.buildTaskQuery(userId, filters);
    const optimizedQuery = QueryOptimizer.optimizePagination(query, page, limit);
    
    const { resources: tasks } = await this.container.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status = @status ORDER BY c.dueDate DESC',
        parameters: [
          { name: '@userId', value: userId },
          { name: '@status', value: filters.status || 'all' }
        ]
      })
      .fetchAll();

    // Get total count for pagination
    const { resources: countResult } = await this.container.items
      .query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }]
      })
      .fetchAll();

    const result = {
      tasks: tasks as Task[],
      total: countResult[0] || 0
    };

    // Cache the result for 5 minutes
    queryCache.set(cacheKey, result, 300000);
    
    return result;
  }

  // Cached task statistics
  async getTaskStatistics(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    const cacheKey = `taskStats:${userId}`;
    
    // Try cache first
    const { queryCache } = await import('../utils/queryOptimizer');
    const cached = queryCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for getTaskStatistics - ${userId}`);
      return cached;
    }

    const today = new Date();
    
    // Use aggregation for better performance
    const { resources: stats } = await this.container.items
      .query({
        query: `
          SELECT 
            COUNT(1) as total,
            SUM(c.status = 'completed' ? 1 : 0) as completed,
            SUM(c.status = 'pending' ? 1 : 0) as pending,
            SUM(c.dueDate < @today AND c.status != 'completed' ? 1 : 0) as overdue
          FROM c 
          WHERE c.userId = @userId
        `,
        parameters: [
          { name: '@userId', value: userId },
          { name: '@today', value: today.toISOString() }
        ]
      })
      .fetchAll();

    const result = stats[0] || { total: 0, completed: 0, pending: 0, overdue: 0 };
    
    // Cache for 10 minutes
    queryCache.set(cacheKey, result, 600000);
    
    return result;
  }

  // Optimized task creation with batch support
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { resource } = await this.container.items.create(newTask);
    
    // Invalidate cache for this user
    const { queryCache } = await import('../utils/queryOptimizer');
    queryCache.clear(); // Simple approach - in production, use targeted invalidation
    
    return resource as Task;
  }

  // Batch task operations for better performance
  async batchUpdateTasks(
    taskUpdates: Array<{ id: string; updates: Partial<Task> }>
  ): Promise<Task[]> {
    const updatedTasks: Task[] = [];

    // Use QueryOptimizer.batchInsert pattern for updates
    for (const { id, updates } of taskUpdates) {
      const { resource: currentTask } = await this.container.item(id).read();
      
      const updatedTask = {
        ...currentTask,
        ...updates,
        updatedAt: new Date()
      };

      const { resource } = await this.container.item(id).replace(updatedTask);
      updatedTasks.push(resource as Task);
    }

    // Invalidate relevant caches
    const { queryCache } = await import('../utils/queryOptimizer');
    queryCache.clear();

    return updatedTasks;
  }

  // High-performance search with caching
  async searchTasks(
    userId: string, 
    searchQuery: string, 
    limit: number = 10
  ): Promise<Task[]> {
    const cacheKey = `search:${userId}:${searchQuery}:${limit}`;
    
    // Try cache first
    const { queryCache } = await import('../utils/queryOptimizer');
    const cached = queryCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for searchTasks - ${userId}:${searchQuery}`);
      return cached;
    }

    const { resources: tasks } = await this.container.items
      .query({
        query: `
          SELECT * FROM c 
          WHERE c.userId = @userId 
          AND (CONTAINS(LOWER(c.title), LOWER(@search)) 
               OR CONTAINS(LOWER(c.description), LOWER(@search))
               OR ARRAY_CONTAINS(c.tags, @search))
          ORDER BY c.updatedAt DESC
          OFFSET 0 LIMIT @limit
        `,
        parameters: [
          { name: '@userId', value: userId },
          { name: '@search', value: searchQuery },
          { name: '@limit', value: limit }
        ]
      })
      .fetchAll();

    const result = tasks as Task[];
    
    // Cache for 3 minutes
    queryCache.set(cacheKey, result, 180000);
    
    return result;
  }
} 