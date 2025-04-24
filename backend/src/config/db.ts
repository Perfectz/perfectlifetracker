import { CosmosClient, Container } from "@azure/cosmos";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

// Environment variables or defaults
const cosmosEndpoint = process.env.COSMOS_ENDPOINT || "https://localhost:8081";
const cosmosKey = process.env.COSMOS_KEY || "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
const cosmosDatabase = process.env.COSMOS_DATABASE || "lifetracker";
const storageConnectionString = process.env.STORAGE_CONNECTION_STRING || 
  "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;";

// Configuration flags
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true" || false;
const MOCK_DATA_ON_FAILURE = process.env.MOCK_DATA_ON_FAILURE !== "false"; // Default to true for better dev experience

// Clients
let cosmosClient: CosmosClient | null = null;
let blobServiceClient: BlobServiceClient | null = null;

// Containers
let usersContainer: Container | null = null;
let goalsContainer: Container | null = null;
let avatarsContainer: ContainerClient | null = null;

// Initialization status
let cosmosInitialized = false;
let blobInitialized = false;

/**
 * Initialize the Cosmos DB client and containers
 */
export async function initializeCosmosClient(): Promise<void> {
  if (USE_MOCK_DATA) {
    console.log("⚠️ Using mock data instead of Cosmos DB");
    cosmosInitialized = false;
    return;
  }

  try {
    console.log("Initializing Cosmos DB client...");
    cosmosClient = new CosmosClient({ 
      endpoint: cosmosEndpoint, 
      key: cosmosKey,
      connectionPolicy: {
        requestTimeout: 10000 // 10 second timeout
      }
    });

    // Create database if it doesn't exist
    const { database } = await cosmosClient.databases.createIfNotExists({ id: cosmosDatabase });
    
    // Create containers if they don't exist
    const { container: users } = await database.containers.createIfNotExists({ id: "users" });
    usersContainer = users;
    console.log("Container 'users' ready");

    const { container: goals } = await database.containers.createIfNotExists({ id: "goals" });
    goalsContainer = goals;
    console.log("Container 'goals' ready");

    cosmosInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Cosmos DB:", error);
    if (MOCK_DATA_ON_FAILURE) {
      console.log("⚠️ Cosmos DB container unavailable, using in-memory store");
      cosmosInitialized = false;
    } else {
      throw error; // Re-throw if we don't want to fall back
    }
  }
}

/**
 * Initialize the Blob Storage client and containers
 */
export async function initializeBlobStorage(): Promise<void> {
  if (USE_MOCK_DATA) {
    console.log("⚠️ Using mock data instead of Blob Storage");
    blobInitialized = false;
    return;
  }

  try {
    console.log("Initializing Blob Storage...");
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
    
    // Create container if it doesn't exist
    avatarsContainer = blobServiceClient.getContainerClient("avatars");
    await avatarsContainer.createIfNotExists();
    console.log("Container 'avatars' ready");

    blobInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Blob Storage:", error);
    if (MOCK_DATA_ON_FAILURE) {
      console.log("⚠️ Blob Storage unavailable, using local file system");
      blobInitialized = false;
    } else {
      throw error; // Re-throw if we don't want to fall back
    }
  }
}

/**
 * Get the users container
 */
export function getUsersContainer(): Container | null {
  return usersContainer;
}

/**
 * Get the goals container
 */
export function getGoalsContainer(): Container | null {
  return goalsContainer;
}

/**
 * Get the avatars container
 */
export function getAvatarsContainer(): ContainerClient | null {
  return avatarsContainer;
}

/**
 * Check if Cosmos DB is initialized
 */
export function isCosmosInitialized(): boolean {
  return cosmosInitialized;
}

/**
 * Check if Blob Storage is initialized
 */
export function isBlobInitialized(): boolean {
  return blobInitialized;
}

/**
 * Initialize all database connections
 */
export async function initializeDatabase(): Promise<void> {
  await initializeCosmosClient();
  await initializeBlobStorage();
} 