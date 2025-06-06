/**
 * backend/src/services/BaseService.ts
 * Base service class providing common functionality for all business services
 */
import { Container } from '@azure/cosmos';
import { logger } from '../utils/logger';
import { databaseService } from './DatabaseService';
import { DatabaseError, NotFoundError, ValidationError, createDatabaseError } from '../middleware/errorHandler';

// Generic pagination interface
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Generic pagination result
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Query options interface
export interface QueryOptions {
  select?: string[];
  where?: Record<string, any>;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
}

export abstract class BaseService<T extends BaseEntity> {
  protected containerName: string;
  protected container: Container | null = null;

  constructor(containerName: string) {
    this.containerName = containerName;
    this.initializeContainer();
  }

  /**
   * Initialize container connection
   */
  private initializeContainer(): void {
    this.container = (databaseService as any).getContainer(this.containerName);
    if (!this.container) {
      logger.error(`Failed to initialize container: ${this.containerName}`);
      throw createDatabaseError(`Container ${this.containerName} not available`);
    }
  }

  /**
   * Generate unique ID for new entities
   */
  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Create a new entity
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const now = new Date();
      const entity: T = {
        ...data,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now
      } as T;

      const { resource } = await this.container!.items.create(entity);
      
      logger.info(`Entity created in ${this.containerName}`, {
        entityId: entity.id,
        containerName: this.containerName
      });

      return resource;
    } catch (error) {
      logger.error(`Failed to create entity in ${this.containerName}`, {
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName
      });
      throw createDatabaseError(`Failed to create ${this.containerName} entity`, { originalError: error });
    }
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const { resource } = await this.container!.item(id).read<T>();
      
      if (!resource) {
        logger.info(`Entity not found in ${this.containerName}`, {
          entityId: id,
          containerName: this.containerName
        });
        return null;
      }

      logger.info(`Entity retrieved from ${this.containerName}`, {
        entityId: id,
        containerName: this.containerName
      });

      return resource;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      
      logger.error(`Failed to retrieve entity from ${this.containerName}`, {
        entityId: id,
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName
      });
      throw createDatabaseError(`Failed to retrieve ${this.containerName} entity`, { originalError: error });
    }
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError(`${this.containerName} entity not found`);
      }

      const updatedEntity: T = {
        ...existing,
        ...data,
        updatedAt: new Date()
      } as T;

      const { resource } = await this.container!.item(id).replace(updatedEntity);
      
      logger.info(`Entity updated in ${this.containerName}`, {
        entityId: id,
        containerName: this.containerName,
        updatedFields: Object.keys(data)
      });

      return resource;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Failed to update entity in ${this.containerName}`, {
        entityId: id,
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName
      });
      throw createDatabaseError(`Failed to update ${this.containerName} entity`, { originalError: error });
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError(`${this.containerName} entity not found`);
      }

      await this.container!.item(id).delete();
      
      logger.info(`Entity deleted from ${this.containerName}`, {
        entityId: id,
        containerName: this.containerName
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Failed to delete entity from ${this.containerName}`, {
        entityId: id,
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName
      });
      throw createDatabaseError(`Failed to delete ${this.containerName} entity`, { originalError: error });
    }
  }

  /**
   * Find entities with pagination
   */
  async findMany(options: PaginationOptions & { where?: Record<string, any> } = { page: 1, limit: 10 }): Promise<PaginatedResult<T>> {
    try {
      const { page, limit, sort = 'createdAt', order = 'desc', where } = options;
      const offset = (page - 1) * limit;

      // Build query
      let query = `SELECT * FROM c`;
      const parameters: any[] = [];

      // Add WHERE clause if provided
      if (where && Object.keys(where).length > 0) {
        const whereConditions = Object.entries(where).map(([key, value], index) => {
          parameters.push({ name: `@param${index}`, value });
          return `c.${key} = @param${index}`;
        });
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      // Add ORDER BY clause
      query += ` ORDER BY c.${sort} ${order.toUpperCase()}`;

      // Execute query for data
      const dataQuery = `${query} OFFSET ${offset} LIMIT ${limit}`;
      const { resources: data } = await this.container!.items.query<T>({
        query: dataQuery,
        parameters
      }).fetchAll();

      // Execute count query for total
      const countQuery = where && Object.keys(where).length > 0
        ? `SELECT VALUE COUNT(1) FROM c WHERE ${Object.entries(where).map(([key], index) => `c.${key} = @param${index}`).join(' AND ')}`
        : `SELECT VALUE COUNT(1) FROM c`;
      
      const { resources: countResult } = await this.container!.items.query<number>({
        query: countQuery,
        parameters
      }).fetchAll();

      const total = countResult[0] || 0;
      const totalPages = Math.ceil(total / limit);

      logger.info(`Entities retrieved from ${this.containerName}`, {
        containerName: this.containerName,
        page,
        limit,
        total,
        resultCount: data.length
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error(`Failed to retrieve entities from ${this.containerName}`, {
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName,
        options
      });
      throw createDatabaseError(`Failed to retrieve ${this.containerName} entities`, { originalError: error });
    }
  }

  /**
   * Execute custom query
   */
  async query(querySpec: { query: string; parameters?: any[] }): Promise<T[]> {
    try {
      const { resources } = await this.container!.items.query<T>(querySpec).fetchAll();
      
      logger.info(`Custom query executed on ${this.containerName}`, {
        containerName: this.containerName,
        resultCount: resources.length,
        query: querySpec.query
      });

      return resources;
    } catch (error) {
      logger.error(`Failed to execute query on ${this.containerName}`, {
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName,
        query: querySpec.query
      });
      throw createDatabaseError(`Failed to execute query on ${this.containerName}`, { originalError: error });
    }
  }

  /**
   * Count entities with optional filter
   */
  async count(where?: Record<string, any>): Promise<number> {
    try {
      let query = `SELECT VALUE COUNT(1) FROM c`;
      const parameters: any[] = [];

      if (where && Object.keys(where).length > 0) {
        const whereConditions = Object.entries(where).map(([key, value], index) => {
          parameters.push({ name: `@param${index}`, value });
          return `c.${key} = @param${index}`;
        });
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      const { resources } = await this.container!.items.query<number>({
        query,
        parameters
      }).fetchAll();

      const count = resources[0] || 0;
      
      logger.info(`Count query executed on ${this.containerName}`, {
        containerName: this.containerName,
        count,
        filter: where
      });

      return count;
    } catch (error) {
      logger.error(`Failed to count entities in ${this.containerName}`, {
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName,
        filter: where
      });
      throw createDatabaseError(`Failed to count ${this.containerName} entities`, { originalError: error });
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  /**
   * Find entities by field value
   */
  async findBy(field: keyof T, value: any): Promise<T[]> {
    return this.query({
      query: `SELECT * FROM c WHERE c.${String(field)} = @value`,
      parameters: [{ name: '@value', value }]
    });
  }

  /**
   * Find first entity by field value
   */
  async findOneBy(field: keyof T, value: any): Promise<T | null> {
    const results = await this.query({
      query: `SELECT TOP 1 * FROM c WHERE c.${String(field)} = @value`,
      parameters: [{ name: '@value', value }]
    });
    
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Bulk create entities
   */
  async createMany(entities: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    const results: T[] = [];
    
    for (const entityData of entities) {
      const created = await this.create(entityData);
      results.push(created);
    }
    
    logger.info(`Bulk create completed for ${this.containerName}`, {
      containerName: this.containerName,
      count: results.length
    });
    
    return results;
  }

  /**
   * Get container health status
   */
  async getHealth(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      await this.count();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error(`Health check failed for ${this.containerName}`, {
        error: error instanceof Error ? error.message : String(error),
        containerName: this.containerName,
        responseTime
      });
      
      return {
        status: 'unhealthy',
        responseTime
      };
    }
  }
}

export default BaseService; 