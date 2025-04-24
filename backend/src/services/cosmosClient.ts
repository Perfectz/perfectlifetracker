// backend/src/services/cosmosClient.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Azure Cosmos DB client setup for database operations

import { CosmosClient, Database, Container, SqlQuerySpec } from '@azure/cosmos';
import * as https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Cosmos DB connection configuration
const cosmosConfig = {
  endpoint: process.env.COSMOS_ENDPOINT || 'https://localhost:8081',
  key: process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==', // Default local emulator key
  databaseId: process.env.COSMOS_DATABASE_ID || 'lifetracker',
  profilesContainerId: process.env.COSMOS_PROFILES_CONTAINER_ID || 'profiles',
  goalsContainerId: process.env.COSMOS_GOALS_CONTAINER_ID || 'goals',
  activitiesContainerId: process.env.COSMOS_ACTIVITIES_CONTAINER_ID || 'activities'
};

// Initialize with empty client that will be set during initializeCosmosDb
let client: CosmosClient = new CosmosClient({ endpoint: '', key: '' });
let database: Database;
let profilesContainer: Container;
let goalsContainer: Container;
let activitiesContainer: Container;

// Configuration options for initialization
interface CosmosDbInitOptions {
  allowInsecureConnection?: boolean;
  mockOnFailure?: boolean;
}

/**
 * Initialize the Cosmos DB database and containers
 */
export async function initializeCosmosDb(options: CosmosDbInitOptions = {}): Promise<{ 
  database: Database; 
  profilesContainer: Container;
  goalsContainer: Container;
  activitiesContainer: Container;
}> {
  try {
    console.log('Initializing Cosmos DB client...');

    // Configure HTTPS agent if insecure connections are allowed
    const httpsAgent = options.allowInsecureConnection 
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

    if (options.allowInsecureConnection) {
      console.log('⚠️ Warning: SSL certificate validation disabled for development');
    }

    // Create the client with configured agent
    client = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key,
      agent: httpsAgent
    });
    
    // Create or get the database
    const { database: db } = await client.databases.createIfNotExists({
      id: cosmosConfig.databaseId
    });
    database = db;
    console.log(`Database '${cosmosConfig.databaseId}' ready`);
    
    // Create or get the profiles container
    const { container: profilesCont } = await database.containers.createIfNotExists({
      id: cosmosConfig.profilesContainerId,
      partitionKey: {
        paths: ['/id']
      },
      throughput: 400 // Minimum throughput for development
    });
    profilesContainer = profilesCont;
    console.log(`Container '${cosmosConfig.profilesContainerId}' ready`);
    
    // Create or get the goals container
    const { container: goalsCont } = await database.containers.createIfNotExists({
      id: cosmosConfig.goalsContainerId,
      partitionKey: {
        paths: ['/userId']
      },
      indexingPolicy: {
        includedPaths: [
          { path: '/*' },
          { path: '/createdAt/?' } // Explicitly index createdAt for efficient sorting
        ]
      },
      throughput: parseInt(process.env.COSMOS_GOALS_RU || '400') // Make RU configurable
    });
    goalsContainer = goalsCont;
    console.log(`Container '${cosmosConfig.goalsContainerId}' ready`);
    
    // Create or get the activities container
    const { container: activitiesCont } = await database.containers.createIfNotExists({
      id: cosmosConfig.activitiesContainerId,
      partitionKey: {
        paths: ['/userId']
      },
      indexingPolicy: {
        includedPaths: [
          { path: '/*' },
          { path: '/date/?' }, // Explicitly index date for efficient filtering and sorting
          { path: '/type/?' }  // Explicitly index type for filtering
        ]
      },
      throughput: parseInt(process.env.COSMOS_ACTIVITIES_RU || '400') // Make RU configurable
    });
    activitiesContainer = activitiesCont;
    console.log(`Container '${cosmosConfig.activitiesContainerId}' ready`);
    
    return {
      database,
      profilesContainer,
      goalsContainer,
      activitiesContainer
    };
  } catch (error) {
    console.error('Error initializing Cosmos DB:', error);
    
    // For development, use an in-memory fallback if configured
    if (process.env.NODE_ENV === 'development' && options.mockOnFailure) {
      console.log('⚠️ Cosmos DB container unavailable, using in-memory store');
      return createInMemoryDbClient();
    }
    
    throw error;
  }
}

/**
 * Create an in-memory database client for development without Cosmos DB
 */
function createInMemoryDbClient(): { 
  database: Database; 
  profilesContainer: Container;
  goalsContainer: Container;
  activitiesContainer: Container;
} {
  // Simple in-memory stores for development
  const inMemoryProfiles: any[] = [];
  const inMemoryGoals: any[] = [];
  const inMemoryActivities: any[] = [];
  
  /**
   * Helper function to create a mock container with generic implementation
   * @param dataStore Array to store items
   * @param partitionKeyPath Path to the partition key property
   * @returns Mock container object
   */
  const createMockContainer = (dataStore: any[], partitionKeyPath: string) => {
    const pkField = partitionKeyPath.replace('/', '');
    
    return {
      items: {
        create: async (item: any) => {
          dataStore.push(item);
          return { resource: item };
        },
        upsert: async (item: any) => {
          const index = dataStore.findIndex(i => i.id === item.id);
          if (index >= 0) {
            dataStore[index] = item;
          } else {
            dataStore.push(item);
          }
          return { resource: item };
        },
        query: (querySpec: SqlQuerySpec) => {
          // Common query patterns to support
          if (querySpec.query.includes('COUNT(1)')) {
            // Count query - supports userId, type, date filters
            let filtered = [...dataStore];
            
            // Apply filters from parameters
            if (querySpec.parameters) {
              // Handle userId filter first (most common)
              const userId = querySpec.parameters.find((p: any) => p.name === '@userId')?.value;
              if (userId) {
                filtered = filtered.filter((a: any) => a[pkField] === userId);
              }
              
              // Handle type filter (for activities)
              const type = querySpec.parameters.find((p: any) => p.name === '@type')?.value;
              if (type) {
                filtered = filtered.filter((a: any) => a.type === type);
              }
              
              // Handle date filters (for activities)
              const startDate = querySpec.parameters.find((p: any) => p.name === '@startDate')?.value;
              if (startDate) {
                const startDateObj = new Date(startDate as string);
                filtered = filtered.filter((a: any) => new Date(a.date) >= startDateObj);
              }
              
              const endDate = querySpec.parameters.find((p: any) => p.name === '@endDate')?.value;
              if (endDate) {
                const endDateObj = new Date(endDate as string);
                filtered = filtered.filter((a: any) => new Date(a.date) <= endDateObj);
              }
            }
            
            return {
              fetchAll: async () => ({ resources: [filtered.length] })
            };
          } else if (querySpec.query.includes(`c.${pkField}`)) {
            // Filter by partition key - with optional pagination and other filters
            let filtered = [...dataStore];
            
            // Apply filters
            if (querySpec.parameters) {
              // Handle partition key filter
              const pkValue = querySpec.parameters.find((p: any) => p.name === `@${pkField}`)?.value;
              if (pkValue) {
                filtered = filtered.filter((item: any) => item[pkField] === pkValue);
              }
              
              // Handle ID filter if present
              const id = querySpec.parameters.find((p: any) => p.name === '@id')?.value;
              if (id) {
                filtered = filtered.filter((item: any) => item.id === id);
              }
              
              // Handle type filter (for activities)
              const type = querySpec.parameters.find((p: any) => p.name === '@type')?.value;
              if (type) {
                filtered = filtered.filter((a: any) => a.type === type);
              }
              
              // Handle date filters (for activities)
              const startDate = querySpec.parameters.find((p: any) => p.name === '@startDate')?.value;
              if (startDate) {
                const startDateObj = new Date(startDate as string);
                filtered = filtered.filter((a: any) => a.date && new Date(a.date) >= startDateObj);
              }
              
              const endDate = querySpec.parameters.find((p: any) => p.name === '@endDate')?.value;
              if (endDate) {
                const endDateObj = new Date(endDate as string);
                filtered = filtered.filter((a: any) => a.date && new Date(a.date) <= endDateObj);
              }
            }
            
            // Apply sorting if specified
            if (querySpec.query.includes('ORDER BY c.createdAt DESC')) {
              filtered = filtered.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
              });
            } else if (querySpec.query.includes('ORDER BY c.date DESC')) {
              filtered = filtered.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
              });
            }
            
            // Apply pagination if needed
            if (querySpec.parameters) {
              const limit = Number(querySpec.parameters.find((p: any) => p.name === '@limit')?.value || 50);
              const offset = Number(querySpec.parameters.find((p: any) => p.name === '@offset')?.value || 0);
              filtered = filtered.slice(offset, offset + limit);
            }
            
            return {
              fetchAll: async () => ({ resources: filtered })
            };
          } else if (querySpec.query.includes('c.id') && querySpec.parameters) {
            // Simple ID filter
            const id = querySpec.parameters[0].value as string;
            const filtered = dataStore.filter((item: any) => item.id === id);
            return {
              fetchAll: async () => ({ resources: filtered })
            };
          }
          
          // Default - return all items
          return {
            fetchAll: async () => ({ resources: dataStore })
          };
        }
      },
      item: (id: string, partitionKeyValue: string) => ({
        delete: async () => {
          const index = dataStore.findIndex(item => 
            item.id === id && item[pkField] === partitionKeyValue);
          if (index >= 0) {
            dataStore.splice(index, 1);
            return { resource: { id } };
          }
          throw new Error('Item not found');
        }
      })
    };
  };
  
  // Create mock containers with reusable implementation
  const mockProfilesContainer = createMockContainer(inMemoryProfiles, '/id');
  const mockGoalsContainer = createMockContainer(inMemoryGoals, '/userId');
  const mockActivitiesContainer = createMockContainer(inMemoryActivities, '/userId');
  
  // Return mock implementation
  return {
    database: {} as Database,
    profilesContainer: mockProfilesContainer as unknown as Container,
    goalsContainer: mockGoalsContainer as unknown as Container,
    activitiesContainer: mockActivitiesContainer as unknown as Container
  };
}

/**
 * Get the profiles container
 */
export function getProfilesContainer(): Container {
  if (!profilesContainer) {
    throw new Error('Cosmos DB not initialized. Call initializeCosmosDb first.');
  }
  return profilesContainer;
}

/**
 * Get the goals container
 */
export function getGoalsContainer(): Container {
  if (!goalsContainer) {
    throw new Error('Cosmos DB not initialized. Call initializeCosmosDb first.');
  }
  return goalsContainer;
}

/**
 * Get the activities container
 */
export function getActivitiesContainer(): Container {
  if (!activitiesContainer) {
    throw new Error('Cosmos DB not initialized. Call initializeCosmosDb first.');
  }
  return activitiesContainer;
}

// Export the Cosmos client for direct use
export default client; 

/* eslint-disable @typescript-eslint/no-explicit-any */ 