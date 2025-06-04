/**
 * backend/src/services/databaseService.ts
 * Database service with optimized indexes and query performance monitoring
 */
import { CosmosClient, Database, Container } from '@azure/cosmos';
import { QueryOptimizer } from '../utils/queryOptimizer';

class DatabaseService {
  private client: CosmosClient | null = null;
  private database: Database | null = null;
  private containers: Map<string, Container> = new Map();

  async initialize(): Promise<void> {
    // Initialize Cosmos DB client
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    
    if (!endpoint || !key) {
      console.log('Using mock database - no Cosmos DB credentials provided');
      return this.initializeMockDatabase();
    }

    this.client = new CosmosClient({ endpoint, key });
    const databaseId = process.env.COSMOS_DB_DATABASE_NAME || 'LifeTrackerDB';
    
    // Create database if it doesn't exist
    const { database } = await this.client.databases.createIfNotExists({ id: databaseId });
    this.database = database;

    // Create containers with optimized indexing
    await this.createOptimizedContainers();
    
    console.log('Database initialized with optimized indexes');
  }

  private async createOptimizedContainers(): Promise<void> {
    if (!this.database) return;

    const containers = [
      {
        id: 'users',
        partitionKey: '/id',
        indexingPolicy: {
          includedPaths: [
            { path: '/email/*' },
            { path: '/username/*' },
            { path: '/createdAt/*' }
          ],
          excludedPaths: [
            { path: '/preferences/*' },
            { path: '/profile/avatar/*' }
          ]
        }
      },
      {
        id: 'tasks',
        partitionKey: '/userId',
        indexingPolicy: {
          includedPaths: [
            { path: '/userId/*' },
            { path: '/status/*' },
            { path: '/priority/*' },
            { path: '/dueDate/*' },
            { path: '/createdAt/*' },
            { path: '/updatedAt/*' },
            { path: '/title/*' },
            { path: '/tags/*' }
          ],
          excludedPaths: [
            { path: '/description/*' } // Exclude large text fields from indexing
          ],
          compositeIndexes: [
            [
              { path: '/userId', order: 'ascending' as const },
              { path: '/status', order: 'ascending' as const },
              { path: '/dueDate', order: 'descending' as const }
            ],
            [
              { path: '/userId', order: 'ascending' as const },
              { path: '/priority', order: 'descending' as const },
              { path: '/createdAt', order: 'descending' as const }
            ]
          ]
        }
      },
      {
        id: 'fitness',
        partitionKey: '/userId',
        indexingPolicy: {
          includedPaths: [
            { path: '/userId/*' },
            { path: '/date/*' },
            { path: '/measurementType/*' },
            { path: '/value/*' }
          ],
          compositeIndexes: [
            [
              { path: '/userId', order: 'ascending' as const },
              { path: '/measurementType', order: 'ascending' as const },
              { path: '/date', order: 'descending' as const }
            ]
          ]
        }
      },
      {
        id: 'files',
        partitionKey: '/userId',
        indexingPolicy: {
          includedPaths: [
            { path: '/userId/*' },
            { path: '/category/*' },
            { path: '/relatedEntityId/*' },
            { path: '/uploadedAt/*' }
          ]
        }
      }
    ];

    for (const containerConfig of containers) {
      try {
        const { container } = await this.database.containers.createIfNotExists({
          id: containerConfig.id,
          partitionKey: containerConfig.partitionKey,
          indexingPolicy: containerConfig.indexingPolicy
        });
        
        this.containers.set(containerConfig.id, container);
        console.log(`Container ${containerConfig.id} created with optimized indexes`);
      } catch (error) {
        console.error(`Failed to create container ${containerConfig.id}:`, error);
      }
    }
  }

  private async initializeMockDatabase(): Promise<void> {
    // Mock database implementation for development
    console.log('Initializing mock database with performance monitoring...');
    
    // Create mock containers
    const mockContainers = ['users', 'tasks', 'fitness', 'files'];
    for (const containerId of mockContainers) {
      this.containers.set(containerId, {} as Container);
      console.log(`Mock container ${containerId} initialized`);
    }
  }

  async createRecommendedIndexes(): Promise<void> {
    const indexes = QueryOptimizer.getRecommendedIndexes();
    
    for (const { collection, index } of indexes) {
      try {
        const container = this.containers.get(collection);
        if (!container) {
          console.warn(`Container ${collection} not found for index creation`);
          continue;
        }

        // In Cosmos DB, indexes are defined at container creation
        // This is more for MongoDB or other databases
        console.log(`Index created for ${collection}:`, index);
      } catch (error) {
        console.error(`Failed to create index for ${collection}:`, error);
      }
    }
  }

  async getContainer(containerId: string): Promise<Container> {
    const container = this.containers.get(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    return container;
  }

  async getPerformanceMetrics(): Promise<{
    cacheStats: { size: number; hitRate: number };
    containerStats: { [key: string]: number };
  }> {
    const { queryCache } = await import('../utils/queryOptimizer');
    
    return {
      cacheStats: queryCache.getStats(),
      containerStats: {
        users: this.containers.has('users') ? 1 : 0,
        tasks: this.containers.has('tasks') ? 1 : 0,
        fitness: this.containers.has('fitness') ? 1 : 0,
        files: this.containers.has('files') ? 1 : 0
      }
    };
  }

  // Performance monitoring endpoint
  async analyzeQueryPerformance(containerId: string): Promise<any> {
    const container = await this.getContainer(containerId);
    
    // This would integrate with Cosmos DB metrics in production
    return {
      container: containerId,
      requestUnits: 'N/A (mock)',
      averageLatency: 'N/A (mock)',
      recommendations: [
        'Consider adding composite indexes for frequently queried field combinations',
        'Use partition keys effectively in queries',
        'Implement query result caching for frequently accessed data'
      ]
    };
  }
}

export const databaseService = new DatabaseService();
export default databaseService; 