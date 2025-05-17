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
  activitiesContainerId: process.env.COSMOS_ACTIVITIES_CONTAINER_ID || 'activities',
  habitsContainerId: process.env.COSMOS_HABITS_CONTAINER_ID || 'habits',
  journalsContainerId: process.env.COSMOS_JOURNALS_CONTAINER_ID || 'journals'
};

// Safely format endpoint URL
function formatEndpointUrl(endpoint: string): string {
  // If endpoint is empty or undefined, use a safe default
  if (!endpoint) {
    return 'https://localhost:8081';
  }
  
  try {
    // Ensure it's a valid URL by attempting to parse it
    new URL(endpoint);
    return endpoint;
  } catch (error) {
    // If parsing fails, try to fix common issues
    if (!endpoint.startsWith('http')) {
      return `https://${endpoint}`;
    }
    // Remove trailing path segments that might cause issues
    const baseUrl = endpoint.replace(/\/+$/, '');
    return `${baseUrl}/`;
  }
}

// Initialize with empty client that will be set during initializeCosmosDb
const safeEndpoint = formatEndpointUrl(cosmosConfig.endpoint);
let client: CosmosClient = new CosmosClient({ 
  endpoint: safeEndpoint, 
  key: cosmosConfig.key 
});
let database: Database;
let profilesContainer: Container;
let goalsContainer: Container;
let activitiesContainer: Container;
let habitsContainer: Container;
let journalsContainer: Container;

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
  habitsContainer: Container;
  journalsContainer: Container;
}> {
  try {
    console.log('Initializing Cosmos DB client...');
    console.log(`Using Cosmos DB endpoint: ${safeEndpoint}`);

    // Configure HTTPS agent if insecure connections are allowed
    const httpsAgent = options.allowInsecureConnection 
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

    if (options.allowInsecureConnection) {
      console.log('⚠️ Warning: SSL certificate validation disabled for development');
    }

    // Create the client with configured agent
    client = new CosmosClient({
      endpoint: safeEndpoint,
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
    
    // Create or get the habits container
    const { container: habitsCont } = await database.containers.createIfNotExists({
      id: cosmosConfig.habitsContainerId,
      partitionKey: {
        paths: ['/userId']
      },
      indexingPolicy: {
        includedPaths: [
          { path: '/*' },
          { path: '/createdAt/?' }, // Explicitly index createdAt for efficient sorting
          { path: '/name/?' },      // Explicitly index name for searching
          { path: '/frequency/?' }  // Explicitly index frequency for filtering
        ]
      },
      throughput: parseInt(process.env.COSMOS_HABITS_RU || '400') // Make RU configurable
    });
    habitsContainer = habitsCont;
    console.log(`Container '${cosmosConfig.habitsContainerId}' ready`);
    
    // Create or get the journals container
    const { container: journalsCont } = await database.containers.createIfNotExists({
      id: cosmosConfig.journalsContainerId,
      partitionKey: {
        paths: ['/userId']
      },
      indexingPolicy: {
        includedPaths: [
          { path: '/*' },
          { path: '/date/?' },      // Explicitly index date for efficient filtering and sorting
          { path: '/sentimentScore/?' }  // Explicitly index sentimentScore for filtering
        ]
        // NOTE: Composite indexes for ORDER BY queries with multiple fields should be configured via:
        // 1. Azure Portal: Container settings > Indexing Policy
        // 2. ARM Templates: As part of infrastructure deployment
        // 3. Terraform: Using the Azure Cosmos DB provider
        // 
        // Required composite index for journal entries:
        // {
        //   "compositeIndexes": [
        //     [
        //       { "path": "/date", "order": "descending" },
        //       { "path": "/id", "order": "descending" }
        //     ]
        //   ]
        // }
      },
      throughput: parseInt(process.env.COSMOS_JOURNALS_RU || '400') // Make RU configurable
    });
    journalsContainer = journalsCont;
    console.log(`Container '${cosmosConfig.journalsContainerId}' ready`);
    
    return {
      database,
      profilesContainer,
      goalsContainer,
      activitiesContainer,
      habitsContainer,
      journalsContainer
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
  habitsContainer: Container;
  journalsContainer: Container;
} {
  // Simple in-memory stores for development
  const inMemoryProfiles: any[] = [];
  const inMemoryGoals: any[] = [];
  const inMemoryActivities: any[] = [];
  const inMemoryHabits: any[] = [];
  const inMemoryJournals: any[] = [];
  
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
          return {
            fetchAll: async () => {
              // Very simple mock implementation of SQL query
              // This doesn't actually parse the SQL but just does basic filtering
              let results = [...dataStore];
              
              // Perform simple pattern matching on the query
              const query = querySpec.query.toLowerCase();
              
              // Basic WHERE clause filtering
              if (querySpec.parameters) {
                for (const param of querySpec.parameters) {
                  const paramName = param.name.replace('@', '');
                  const paramValue = param.value;
                  
                  if (typeof paramValue === 'string' || typeof paramValue === 'number' || paramValue instanceof Date) {
                    const stringValue = paramValue instanceof Date 
                      ? paramValue.toISOString() 
                      : String(paramValue);
                    
                    results = results.filter(item => {
                      // Skip offset/limit parameters
                      if (paramName === 'offset' || paramName === 'limit') {
                        return true;
                      }
                      
                      // Simple equality check
                      if (item[paramName] !== undefined) {
                        const itemValue = item[paramName] instanceof Date
                          ? item[paramName].toISOString()
                          : String(item[paramName]);
                        
                        return itemValue === stringValue;
                      }
                      return false;
                    });
                  }
                }
              }
              
              // Count query handling
              if (query.includes('select value count(1)')) {
                return { resources: [results.length] };
              }
              
              // Handle ORDER BY
              if (query.includes('order by')) {
                const orderMatch = query.match(/order by c\.(\w+) (asc|desc)/i);
                if (orderMatch) {
                  const [, field, direction] = orderMatch;
                  results.sort((a, b) => {
                    const valueA = a[field];
                    const valueB = b[field];
                    const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                    return direction.toLowerCase() === 'asc' ? comparison : -comparison;
                  });
                }
              }
              
              // Handle OFFSET and LIMIT for pagination
              if (querySpec.parameters) {
                const offsetParam = querySpec.parameters.find(p => p.name === '@offset');
                const limitParam = querySpec.parameters.find(p => p.name === '@limit');
                
                const offset = offsetParam ? Number(offsetParam.value) : 0;
                const limit = limitParam ? Number(limitParam.value) : results.length;
                
                results = results.slice(offset, offset + limit);
              }
              
              return { resources: results };
            }
          };
        }
      },
      item: (id: string, partitionKeyValue: string) => {
        return {
          read: async () => {
            const item = dataStore.find(i => 
              i.id === id && 
              i[pkField] === partitionKeyValue
            );
            
            if (!item) {
              throw { code: 404 };
            }
            
            return { resource: item };
          },
          delete: async () => {
            const index = dataStore.findIndex(i => 
              i.id === id && 
              i[pkField] === partitionKeyValue
            );
            
            if (index === -1) {
              throw { code: 404 };
            }
            
            dataStore.splice(index, 1);
            return { resource: null };
          },
          replace: async (newItem: any) => {
            const index = dataStore.findIndex(i => 
              i.id === id && 
              i[pkField] === partitionKeyValue
            );
            
            if (index === -1) {
              throw { code: 404 };
            }
            
            dataStore[index] = newItem;
            return { resource: newItem };
          }
        };
      }
    };
  };
  
  // Create mock containers
  const mockProfilesContainer = createMockContainer(inMemoryProfiles, '/id');
  const mockGoalsContainer = createMockContainer(inMemoryGoals, '/userId');
  const mockActivitiesContainer = createMockContainer(inMemoryActivities, '/userId');
  const mockHabitsContainer = createMockContainer(inMemoryHabits, '/userId');
  const mockJournalsContainer = createMockContainer(inMemoryJournals, '/userId');
  
  // Return mock implementation
  return {
    database: {} as Database,
    profilesContainer: mockProfilesContainer as unknown as Container,
    goalsContainer: mockGoalsContainer as unknown as Container,
    activitiesContainer: mockActivitiesContainer as unknown as Container,
    habitsContainer: mockHabitsContainer as unknown as Container,
    journalsContainer: mockJournalsContainer as unknown as Container
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

/**
 * Get the habits container
 * @returns The habits container
 */
export function getHabitsContainer(): Container {
  if (!habitsContainer) {
    throw new Error('Habits container not initialized. Call initializeCosmosDb first.');
  }
  return habitsContainer;
}

/**
 * Get the journals container for operations
 * @returns The journals container
 */
export function getJournalsContainer(): Container {
  if (!journalsContainer) {
    throw new Error('Cosmos DB client not initialized. Call initializeCosmosDb first.');
  }
  return journalsContainer;
}

// Export the Cosmos client for direct use
export default client; 

/* eslint-disable @typescript-eslint/no-explicit-any */ 