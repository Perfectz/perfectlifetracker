// backend/src/services/cosmosClient.ts
// Azure Cosmos DB client setup for database operations

import { CosmosClient, Database, Container, SqlQuerySpec } from '@azure/cosmos';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Cosmos DB connection configuration
const cosmosConfig = {
  endpoint: process.env.COSMOS_ENDPOINT || 'https://localhost:8081',
  key: process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==', // Default local emulator key
  databaseId: process.env.COSMOS_DATABASE_ID || 'lifetracker',
  profilesContainerId: process.env.COSMOS_PROFILES_CONTAINER_ID || 'profiles',
  goalsContainerId: process.env.COSMOS_GOALS_CONTAINER_ID || 'goals'
};

// Initialize the Cosmos client
const client = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key
});

let database: Database;
let profilesContainer: Container;
let goalsContainer: Container;

/**
 * Initialize the Cosmos DB database and containers
 */
export async function initializeCosmosDb(): Promise<{ 
  database: Database; 
  profilesContainer: Container;
  goalsContainer: Container;
}> {
  try {
    console.log('Initializing Cosmos DB client...');
    
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
      throughput: 400 // Minimum throughput for development
    });
    goalsContainer = goalsCont;
    console.log(`Container '${cosmosConfig.goalsContainerId}' ready`);
    
    return {
      database,
      profilesContainer,
      goalsContainer
    };
  } catch (error) {
    console.error('Error initializing Cosmos DB:', error);
    
    // For development, use an in-memory fallback if Cosmos DB is not available
    if (process.env.NODE_ENV === 'development') {
      console.log('Using in-memory database for development');
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
} {
  // Simple in-memory stores for development
  const inMemoryProfiles: any[] = [];
  const inMemoryGoals: any[] = [];
  
  // Mock container with similar API to Cosmos Container for profiles
  const mockProfilesContainer = {
    items: {
      create: async (item: any) => {
        inMemoryProfiles.push(item);
        return { resource: item };
      },
      upsert: async (item: any) => {
        const index = inMemoryProfiles.findIndex(p => p.id === item.id);
        if (index >= 0) {
          inMemoryProfiles[index] = item;
        } else {
          inMemoryProfiles.push(item);
        }
        return { resource: item };
      },
      query: (querySpec: SqlQuerySpec) => {
        // Very simple query parser for development
        // Only supports basic filtering on id
        if (querySpec.query.includes('c.id') && querySpec.parameters) {
          const id = querySpec.parameters![0].value as string;
          const filtered = inMemoryProfiles.filter((p: any) => p.id === id);
          return {
            fetchAll: async () => ({ resources: filtered })
          };
        }
        return {
          fetchAll: async () => ({ resources: inMemoryProfiles })
        };
      },
      delete: async (id: string) => {
        const index = inMemoryProfiles.findIndex(p => (p as any).id === id);
        if (index >= 0) {
          inMemoryProfiles.splice(index, 1);
        }
        return { resource: { id } };
      }
    }
  };
  
  // Mock container with similar API to Cosmos Container for goals
  const mockGoalsContainer = {
    items: {
      create: async (item: any) => {
        inMemoryGoals.push(item);
        return { resource: item };
      },
      upsert: async (item: any) => {
        const index = inMemoryGoals.findIndex(g => g.id === item.id);
        if (index >= 0) {
          inMemoryGoals[index] = item;
        } else {
          inMemoryGoals.push(item);
        }
        return { resource: item };
      },
      query: (querySpec: SqlQuerySpec) => {
        // Simple query parser for goals
        if (querySpec.query.includes('c.userId') && querySpec.parameters) {
          const userId = querySpec.parameters![0].value as string;
          const filtered = inMemoryGoals.filter((g: any) => g.userId === userId);
          return {
            fetchAll: async () => ({ resources: filtered })
          };
        }
        if (querySpec.query.includes('c.id') && querySpec.parameters) {
          const id = querySpec.parameters![0].value as string;
          const filtered = inMemoryGoals.filter((g: any) => g.id === id);
          return {
            fetchAll: async () => ({ resources: filtered })
          };
        }
        return {
          fetchAll: async () => ({ resources: inMemoryGoals })
        };
      },
      delete: async (id: string) => {
        const index = inMemoryGoals.findIndex(g => (g as any).id === id);
        if (index >= 0) {
          inMemoryGoals.splice(index, 1);
        }
        return { resource: { id } };
      }
    },
    item: (id: string, partitionKey: string) => ({
      delete: async () => {
        const index = inMemoryGoals.findIndex(g => 
          (g as any).id === id && (g as any).userId === partitionKey);
        if (index >= 0) {
          inMemoryGoals.splice(index, 1);
          return { resource: { id } };
        }
        throw new Error('Item not found');
      }
    })
  };
  
  return {
    database: {} as Database,
    profilesContainer: mockProfilesContainer as unknown as Container,
    goalsContainer: mockGoalsContainer as unknown as Container
  };
}

/**
 * Get the initialized profiles container
 */
export function getProfilesContainer(): Container {
  return profilesContainer;
}

/**
 * Get the initialized goals container
 */
export function getGoalsContainer(): Container {
  return goalsContainer;
}

// Export the Cosmos client for direct use
export default client; 