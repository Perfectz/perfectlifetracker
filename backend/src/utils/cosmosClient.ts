/**
 * backend/src/utils/cosmosClient.ts
 * Updated Cosmos DB client configuration with Key Vault integration
 */
import { CosmosClient, Database, Container } from '@azure/cosmos';
import { secretsManager } from '../config/secrets';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we should use mock database
const isDevelopment = process.env.NODE_ENV === 'development';
const useKeyVault = process.env.USE_KEY_VAULT === 'true';

let useMockDatabase = process.env.USE_MOCK_DATABASE === 'true';

// Environment variables for Cosmos DB connection
let cosmosEndpoint: string = '';
let cosmosKey: string = '';

// Initialize Cosmos DB configuration
async function initCosmosConfig() {
  if (useKeyVault) {
    // Get secrets from Key Vault
    cosmosEndpoint = secretsManager.getCosmosDbEndpoint() || process.env.COSMOS_DB_ENDPOINT || '';
    cosmosKey = secretsManager.getCosmosDbKey() || process.env.COSMOS_DB_KEY || '';
  } else {
    // Fall back to environment variables
    cosmosEndpoint = process.env.COSMOS_DB_ENDPOINT || '';
    cosmosKey = process.env.COSMOS_DB_KEY || '';
  }

  console.log('Cosmos DB Configuration Check:');
  console.log(`  USE_MOCK_DATABASE: ${process.env.USE_MOCK_DATABASE}`);
  console.log(`  Endpoint available: ${!!cosmosEndpoint}`);
  console.log(`  Key available: ${!!cosmosKey}`);

  // Check if we have credentials
  const hasCosmosCredentials = !!(cosmosEndpoint && cosmosKey);
  
  // Update mock database decision - respect explicit USE_MOCK_DATABASE setting
  if (process.env.USE_MOCK_DATABASE === 'false' && hasCosmosCredentials) {
    useMockDatabase = false;
    console.log('✅ Using REAL Cosmos DB (USE_MOCK_DATABASE=false and credentials available)');
  } else {
    useMockDatabase = true;
    const reason = process.env.USE_MOCK_DATABASE === 'true' ? 'USE_MOCK_DATABASE=true' : 'missing credentials';
    console.log(`ℹ️  Using mock database (${reason})`);
  }
}

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

// Cosmos Client (lazy initialization)
let cosmosClient: CosmosClient | null = null;
let database: Database | null = null;
const containers: { [key: string]: Container } = {};

// Mock data stores for development
const mockDataStore = {
  users: new Map(),
  fitness: new Map(),
  tasks: new Map(),
  development: new Map(),
  analytics: new Map(),
  files: new Map()
};

// Mock database implementation
function createMockContainer(containerName: string) {
  return {
    id: containerName,
    items: {
      create: async (item: any) => {
        const id = item.id || Date.now().toString();
        item.id = id;
        const store = mockDataStore[containerName as keyof typeof mockDataStore];
        if (!store) {
          throw new Error(`Mock container '${containerName}' not found`);
        }
        store.set(id, item);
        return { resource: item };
      },
      query: (query: any) => ({
        fetchAll: async () => {
          const store = mockDataStore[containerName as keyof typeof mockDataStore];
          if (!store) {
            throw new Error(`Mock container '${containerName}' not found`);
          }
          return { resources: Array.from(store.values()) };
        }
      }),
      read: async (id: string) => {
        const store = mockDataStore[containerName as keyof typeof mockDataStore];
        if (!store) {
          throw new Error(`Mock container '${containerName}' not found`);
        }
        const item = store.get(id);
        return item ? { resource: item } : null;
      },
      replace: async (item: any) => {
        const store = mockDataStore[containerName as keyof typeof mockDataStore];
        if (!store) {
          throw new Error(`Mock container '${containerName}' not found`);
        }
        store.set(item.id, item);
        return { resource: item };
      },
      delete: async (id: string) => {
        const store = mockDataStore[containerName as keyof typeof mockDataStore];
        if (!store) {
          throw new Error(`Mock container '${containerName}' not found`);
        }
        const deleted = store.delete(id);
        return { resource: deleted ? { id } : null };
      }
    }
  };
}

// Initialize containers
async function initializeContainers() {
  if (useMockDatabase) {
    console.log('Using mock database for development');
    
    // Return mock containers
    const mockContainers: { [key: string]: any } = {};
    Object.keys(containersConfig).forEach(containerName => {
      mockContainers[containerName] = createMockContainer(containerName);
    });
    return mockContainers;
  }

  try {
    // Initialize Cosmos configuration
    await initCosmosConfig();
    
    if (!cosmosEndpoint || !cosmosKey) {
      throw new Error('Cosmos DB credentials not available');
    }

    // Initialize Cosmos client
    cosmosClient = new CosmosClient({
      endpoint: cosmosEndpoint,
      key: cosmosKey
    });

    // Get database reference
    database = cosmosClient.database(databaseId);

    // Initialize containers
    const initializedContainers: { [key: string]: Container } = {};
    for (const [containerKey, containerId] of Object.entries(containersConfig)) {
      initializedContainers[containerKey] = database.container(containerId);
    }

    console.log('Cosmos DB client initialized successfully');
    return initializedContainers;
  } catch (error) {
    console.error('Failed to initialize Cosmos DB client:', error);
    console.log('Falling back to mock database');
    
    // Fall back to mock database
    useMockDatabase = true;
    return await initializeContainers();
  }
}

// Export the initialization function and configuration
export { initCosmosConfig, initializeContainers, useMockDatabase, containersConfig };

// Container management
let initializedContainers: { [key: string]: any } = {};

// Get a container by name (lazy initialization)
export async function getContainer(containerName: string): Promise<any> {
  // If containers haven't been initialized yet, initialize them
  if (Object.keys(initializedContainers).length === 0) {
    initializedContainers = await initializeContainers();
  }

  const container = initializedContainers[containerName];
  if (!container) {
    throw new Error(`Container '${containerName}' not found or not configured`);
  }

  return container;
} 