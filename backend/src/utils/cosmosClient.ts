/**
 * backend/src/utils/cosmosClient.ts
 * Cosmos DB client configuration and initialization
 */
import { CosmosClient, Database, Container } from '@azure/cosmos';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we should use mock database:
// 1. Explicit setting in env var
// 2. Development environment without Cosmos credentials
// 3. Missing Cosmos credentials
const isDevelopment = process.env.NODE_ENV === 'development';
const hasCosmosCredentials = !!(process.env.COSMOS_DB_ENDPOINT && process.env.COSMOS_DB_KEY);
let useMockDatabase = 
  process.env.USE_MOCK_DATABASE === 'true' || 
  (isDevelopment && !hasCosmosCredentials) ||
  !hasCosmosCredentials;

// Environment variables for Cosmos DB connection
const cosmosEndpoint = process.env.COSMOS_DB_ENDPOINT || '';
const cosmosKey = process.env.COSMOS_DB_KEY || '';
const databaseId = process.env.COSMOS_DB_DATABASE || 'lifetrackpro-db';

// Container IDs
const containersConfig = {
  users: process.env.COSMOS_DB_USERS_CONTAINER || 'users',
  fitness: process.env.COSMOS_DB_FITNESS_CONTAINER || 'fitness',
  tasks: process.env.COSMOS_DB_TASKS_CONTAINER || 'tasks',
  development: process.env.COSMOS_DB_DEV_CONTAINER || 'development',
  analytics: process.env.COSMOS_DB_ANALYTICS_CONTAINER || 'analytics',
  files: process.env.COSMOS_DB_FILES_CONTAINER || 'files'
};

// Mock database implementation for local development
class MockContainer {
  private data: any[] = [];
  private id: string;

  constructor(id: string) {
    this.id = id;
    console.log(`Mock container ${id} created`);
  }

  // Fix items implementation to match Cosmos DB API more closely
  items = {
    create: async (item: any) => {
      const itemWithId = { ...item, id: item.id || Date.now().toString() };
      this.data.push(itemWithId);
      return { resource: itemWithId };
    },
    query: (query: any) => {
      return {
        fetchAll: async () => {
          // Very simple mock query implementation
          let filteredData = [...this.data];
          
          if (query && query.parameters) {
            for (const param of query.parameters) {
              const paramName = param.name.replace('@', '');
              filteredData = filteredData.filter(item => item[paramName] === param.value);
            }
          }
          
          return { resources: filteredData };
        }
      };
    },
    upsert: async (item: any) => {
      const index = this.data.findIndex(i => i.id === item.id);
      if (index >= 0) {
        this.data[index] = item;
      } else {
        this.data.push(item);
      }
      return { resource: item };
    }
  };

  // Add item method that supports direct item access
  item(id: string, partitionKey: string) {
    return {
      read: async () => {
        const item = this.data.find(i => i.id === id);
        if (!item) throw { code: 404, message: `Item with id ${id} not found` };
        return { resource: item };
      },
      replace: async (newItem: any) => {
        const index = this.data.findIndex(i => i.id === id);
        if (index >= 0) {
          this.data[index] = newItem;
          return { resource: newItem };
        }
        throw { code: 404, message: `Item with id ${id} not found` };
      },
      delete: async () => {
        const index = this.data.findIndex(i => i.id === id);
        if (index >= 0) {
          this.data.splice(index, 1);
          return { resource: {} };
        }
        throw { code: 404, message: `Item with id ${id} not found` };
      }
    };
  }
}

class MockDatabase {
  containers = {
    createIfNotExists: async ({ id }: { id: string }) => {
      if (!mockContainers[id]) {
        mockContainers[id] = new MockContainer(id);
      }
      return { container: mockContainers[id] };
    }
  };
}

// Initialize mock DB or Cosmos client
let client: CosmosClient;
let database: Database | MockDatabase;
let containers: { [key: string]: Container | MockContainer } = {};
let mockContainers: { [key: string]: MockContainer } = {};

if (useMockDatabase) {
  console.log('Using mock in-memory database - no Cosmos DB connection required');
  database = new MockDatabase();
} else {
  if (!cosmosEndpoint || !cosmosKey) {
    console.warn('Cosmos DB endpoint or key is missing. Falling back to mock database');
    database = new MockDatabase();
    useMockDatabase = true;
  } else {
    console.log(`Using Cosmos DB at ${cosmosEndpoint}`);
    try {
      client = new CosmosClient({
        endpoint: cosmosEndpoint,
        key: cosmosKey,
        connectionPolicy: {
          requestTimeout: 30000 // 30 seconds timeout for requests
        }
      });
    } catch (error) {
      console.error('Failed to initialize Cosmos client:', error);
      console.log('Falling back to mock database');
      database = new MockDatabase();
      useMockDatabase = true;
    }
  }
}

/**
 * Initializes the Cosmos DB database and containers
 */
export async function initializeCosmosDB() {
  try {
    if (useMockDatabase) {
      console.log('Initializing mock database...');
      
      // Initialize mockContainers if needed
      if (!mockContainers) {
        mockContainers = {};
      }
      
      // Create mock containers
      for (const [containerName, containerId] of Object.entries(containersConfig)) {
        if (!mockContainers[containerId]) {
          mockContainers[containerId] = new MockContainer(containerId);
        }
        
        // Register container
        containers[containerName] = mockContainers[containerId];
        console.log(`Mock container ${containerId} initialized`);
      }
      
      console.log('Mock database initialization complete');
    } else {
      console.log(`Initializing Cosmos DB connection to ${cosmosEndpoint}...`);
      
      // Create database if it doesn't exist
      const { database: db } = await client.databases.createIfNotExists({ id: databaseId });
      database = db;
      console.log(`Database ${databaseId} initialized`);
      
      // Create containers if they don't exist
      for (const [containerName, containerId] of Object.entries(containersConfig)) {
        const { container } = await database.containers.createIfNotExists({
          id: containerId,
          partitionKey: {
            paths: ['/userId'],
            version: 2
          }
        });
        
        containers[containerName] = container;
        console.log(`Container ${containerId} initialized`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error initializing ${useMockDatabase ? 'mock database' : 'Cosmos DB'}:`, error);
    throw error;
  }
}

/**
 * Gets a specific container by name
 */
export function getContainer(containerName: string): Container | MockContainer {
  try {
    if (!containers[containerName]) {
      // Check if database is initialized
      if (!database) {
        throw new Error('Database not initialized');
      }
      
      // If mockContainers exists and we're in mock mode, check there
      if (useMockDatabase && mockContainers && mockContainers[containerName]) {
        containers[containerName] = mockContainers[containerName];
        return containers[containerName];
      }
      
      // Attempt to initialize the container dynamically
      console.log(`Container ${containerName} requested but not yet initialized, initializing now...`);
      if (useMockDatabase) {
        if (!mockContainers) {
          mockContainers = {};
        }
        mockContainers[containerName] = new MockContainer(containerName);
        containers[containerName] = mockContainers[containerName];
        console.log(`Mock container ${containerName} initialized on demand`);
      } else {
        // For real Cosmos, this should be handled differently
        throw new Error(`Container ${containerName} not initialized`);
      }
    }
    return containers[containerName];
  } catch (error) {
    console.error(`Error getting container ${containerName}:`, error);
    if (useMockDatabase) {
      // Auto-create mock container on demand
      console.log(`Creating mock container ${containerName} on demand due to error`);
      if (!mockContainers) {
        mockContainers = {};
      }
      mockContainers[containerName] = new MockContainer(containerName);
      containers[containerName] = mockContainers[containerName];
      return containers[containerName];
    }
    throw error;
  }
}

/**
 * Gets the database instance
 */
export function getDatabase(): Database | MockDatabase {
  if (!database) {
    throw new Error('Database not initialized');
  }
  return database;
}

export default {
  client,
  initializeCosmosDB,
  getContainer,
  getDatabase,
  containers: containersConfig
}; 