/**
 * backend/src/utils/cosmosClient.ts
 * Cosmos DB client configuration and initialization
 */
import { CosmosClient, Database, Container } from '@azure/cosmos';
import dotenv from 'dotenv';

dotenv.config();

// Flag to use mock database instead of Cosmos DB
const useMockDatabase = process.env.USE_MOCK_DATABASE === 'true';

// Environment variables for Cosmos DB connection
const cosmosEndpoint = process.env.COSMOSDB_ENDPOINT || '';
const cosmosKey = process.env.COSMOSDB_KEY || '';
const databaseId = process.env.COSMOSDB_DATABASE || 'lifetrackpro-db';

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

  async items() {
    return {
      create: async (item: any) => {
        const itemWithId = { ...item, id: item.id || Date.now().toString() };
        this.data.push(itemWithId);
        return { resource: itemWithId };
      },
      query: async (query: any) => {
        // Very simple mock query implementation
        return {
          fetchAll: async () => {
            // Filter based on a simple query condition if specified
            let filteredData = [...this.data];
            
            if (query && query.parameters) {
              for (const param of query.parameters) {
                if (param.name === '@userId') {
                  filteredData = filteredData.filter(item => item.userId === param.value);
                }
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
      },
      read: async (id: string) => {
        const item = this.data.find(i => i.id === id);
        if (!item) throw new Error(`Item with id ${id} not found`);
        return { resource: item };
      },
      delete: async (id: string) => {
        const index = this.data.findIndex(i => i.id === id);
        if (index >= 0) {
          this.data.splice(index, 1);
          return { resource: {} };
        }
        throw new Error(`Item with id ${id} not found`);
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

// Cosmos client instance or mock
let client: CosmosClient;
let database: Database | MockDatabase;
let containers: { [key: string]: Container | MockContainer } = {};
let mockContainers: { [key: string]: MockContainer } = {};

if (useMockDatabase) {
  console.log('Using mock in-memory database');
  database = new MockDatabase();
} else {
  console.log(`Using Cosmos DB at ${cosmosEndpoint}`);
  client = new CosmosClient({
    endpoint: cosmosEndpoint,
    key: cosmosKey,
    connectionPolicy: {
      requestTimeout: 30000 // 30 seconds timeout for requests
    }
  });
}

/**
 * Initializes the Cosmos DB database and containers
 */
export async function initializeCosmosDB() {
  try {
    if (useMockDatabase) {
      console.log('Initializing mock database...');
      
      // Create mock containers
      for (const [containerName, containerId] of Object.entries(containersConfig)) {
        const { container } = await database.containers.createIfNotExists({
          id: containerId
        });
        containers[containerName] = container;
        console.log(`Mock container ${containerId} initialized`);
      }
      
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
    
    console.log(useMockDatabase ? 'Mock database initialization complete' : 'Cosmos DB initialization complete');
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
  if (!containers[containerName]) {
    throw new Error(`Container ${containerName} not initialized`);
  }
  return containers[containerName];
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