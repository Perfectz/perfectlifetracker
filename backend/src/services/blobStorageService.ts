// backend/src/services/blobStorageService.ts
// Service for Azure Blob Storage operations

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Blob Storage configuration
const blobConfig = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || 'UseDevelopmentStorage=true',
  containerName: process.env.AVATAR_CONTAINER_NAME || 'avatars'
};

// Initialize Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(blobConfig.connectionString);
let containerClient: ContainerClient;

/**
 * Initialize the Blob Storage container
 */
export async function initializeBlobStorage(): Promise<ContainerClient> {
  try {
    console.log('Initializing Blob Storage...');
    
    // Create the container if it doesn't exist
    containerClient = blobServiceClient.getContainerClient(blobConfig.containerName);
    const containerExists = await containerClient.exists();
    
    if (!containerExists) {
      console.log(`Creating container '${blobConfig.containerName}'...`);
      await containerClient.create({ access: 'blob' }); // 'blob' access level allows public read access for blobs
    }
    
    console.log(`Container '${blobConfig.containerName}' ready`);
    return containerClient;
  } catch (error) {
    console.error('Error initializing Blob Storage:', error);
    
    // For development, use a mock client if Azure Storage is not available
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock Blob Storage client for development');
      return createMockBlobClient();
    }
    
    throw error;
  }
}

/**
 * Create a mock blob client for development without Azure Storage
 */
function createMockBlobClient(): ContainerClient {
  // Simple in-memory store for development
  const inMemoryBlobs: Map<string, Buffer> = new Map();
  
  // Mock container with similar API to ContainerClient
  const mockContainerClient = {
    getBlockBlobClient: (blobName: string) => {
      return {
        uploadData: async (data: Buffer) => {
          inMemoryBlobs.set(blobName, data);
          return {
            etag: uuidv4(),
            lastModified: new Date()
          };
        },
        url: `http://localhost:10000/devstoreaccount1/${blobConfig.containerName}/${blobName}`
      };
    }
  };
  
  return mockContainerClient as unknown as ContainerClient;
}

/**
 * Get the container client
 */
export function getContainerClient() {
  return containerClient;
}

/**
 * Upload an avatar image for a user
 * @param userId The user ID
 * @param imageData The image data as a Buffer
 * @param contentType The content type of the image
 * @returns The URL of the uploaded avatar
 */
export async function uploadAvatar(userId: string, imageData: Buffer, contentType: string): Promise<string> {
  const container = getContainerClient();
  
  // Create a unique blob name with userId to ensure proper overwriting
  const blobName = `${userId}-${uuidv4()}.jpg`;
  const blockBlobClient = container.getBlockBlobClient(blobName);
  
  // Upload the image data
  await blockBlobClient.uploadData(imageData, {
    blobHTTPHeaders: {
      blobContentType: contentType
    }
  });
  
  // Return the URL to the blob
  return blockBlobClient.url;
}

/**
 * Delete an avatar image based on its URL
 * @param avatarUrl The URL of the avatar to delete
 * @returns True if successful, false if failed
 */
export async function deleteAvatar(avatarUrl: string): Promise<boolean> {
  try {
    const container = getContainerClient();
    
    // Extract the blob name from the URL
    const blobName = avatarUrl.split('/').pop();
    if (!blobName) {
      return false;
    }
    
    const blockBlobClient = container.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    
    return true;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return false;
  }
} 