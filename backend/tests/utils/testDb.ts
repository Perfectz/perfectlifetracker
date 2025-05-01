import { CosmosClient, Database, Container } from '@azure/cosmos';

// Get configuration from environment variables with fallbacks
const testDbConfig = {
  endpoint: process.env.TEST_COSMOS_ENDPOINT || process.env.COSMOS_ENDPOINT || 'https://localhost:8081',
  key: process.env.TEST_COSMOS_KEY || process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==', // Default emulator key
  databaseId: process.env.TEST_COSMOS_DATABASE_ID || 'test-fitness-db',
  containers: {
    profile: {
      id: 'profile-test',
      partitionKey: { paths: ['/userId'] }
    },
    goals: {
      id: 'goals-test',
      partitionKey: { paths: ['/userId'] }
    },
    activities: {
      id: 'activities-test',
      partitionKey: { paths: ['/userId'] }
    },
  },
  maxRetries: 3,
  retryDelayMs: 1000
};

// Global client for test operations
let client: CosmosClient;
let database: Database;

/**
 * Create a container with retry logic
 */
const createContainerWithRetry = async (database: Database, containerDef: any, attempt = 1): Promise<Container> => {
  try {
    const { container } = await database.containers.createIfNotExists(containerDef);
    return container;
  } catch (error) {
    if (attempt >= testDbConfig.maxRetries) {
      console.error(`Failed to create container ${containerDef.id} after ${attempt} attempts`);
      throw error;
    }
    
    console.warn(`Attempt ${attempt} failed to create container ${containerDef.id}, retrying...`);
    await new Promise(resolve => setTimeout(resolve, testDbConfig.retryDelayMs));
    return createContainerWithRetry(database, containerDef, attempt + 1);
  }
};

/**
 * Setup test database and containers
 */
export const setupTestDb = async () => {
  try {
    // Create client
    client = new CosmosClient({
      endpoint: testDbConfig.endpoint,
      key: testDbConfig.key
    });

    // Create or get test database
    const { database: db } = await client.databases.createIfNotExists({
      id: testDbConfig.databaseId
    });
    database = db;

    // Create test containers with retry logic
    const containerPromises = Object.values(testDbConfig.containers).map(container => 
      createContainerWithRetry(database, container)
    );
    
    await Promise.all(containerPromises);
    
    console.log('Test database and containers set up');
  } catch (error) {
    console.error('Failed to set up test database:', error);
    throw error;
  }
};

/**
 * Tear down test database by removing all data
 */
export const teardownTestDb = async () => {
  if (!database) return;

  try {
    // Clean data from test containers instead of deleting them
    // This is faster for repeated test runs
    const containerPromises = Object.values(testDbConfig.containers).map(async container => {
      const { container: cont } = await database.containers.createIfNotExists(container);
      
      // Query all items
      const querySpec = {
        query: 'SELECT * FROM c'
      };
      
      const { resources: items } = await cont.items.query(querySpec).fetchAll();
      
      // Delete all items
      const deletePromises = items.map((item: any) => 
        cont.item(item.id, item.userId).delete()
      );
      
      await Promise.all(deletePromises);
    });
    
    await Promise.all(containerPromises);
    
    console.log('Test database data cleaned up');
  } catch (error) {
    console.error('Failed to clean up test database:', error);
  }
};

/**
 * Get test container by id
 */
export const getTestContainer = async (containerId: string) => {
  if (!database) {
    await setupTestDb();
  }
  
  try {
    const containerConfig = Object.values(testDbConfig.containers).find(c => c.id === containerId);
    const container = containerConfig || { id: containerId, partitionKey: { paths: ['/id'] } };
    
    return await createContainerWithRetry(database, container);
  } catch (error) {
    console.error(`Failed to get container ${containerId}:`, error);
    throw error;
  }
}; 