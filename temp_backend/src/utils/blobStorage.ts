/**
 * backend/src/utils/blobStorage.ts
 * Azure Blob Storage utilities for file operations
 */
import { BlobServiceClient, ContainerClient, BlobClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

// Blob Storage connection details
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'perfectltp-uploads';

// Ensure connection string is set
if (!connectionString) {
  console.error('Azure Storage connection string is not defined in environment variables');
}

/**
 * Get or create a container client
 */
export const getContainerClient = async (): Promise<ContainerClient> => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString!);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create the container if it doesn't exist
    if (!(await containerClient.exists())) {
      console.log(`Creating container: ${containerName}`);
      await containerClient.create({ access: 'blob' }); // 'blob' = public read access for blobs only
    }
    
    return containerClient;
  } catch (error) {
    console.error('Error initializing blob container client:', error);
    throw error;
  }
};

/**
 * Generate a unique file name to avoid collisions
 */
export const generateUniqueBlobName = (originalFileName: string): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 10);
  
  const extension = originalFileName.split('.').pop();
  const nameWithoutExtension = originalFileName.split('.').slice(0, -1).join('.');
  
  return `${nameWithoutExtension}-${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload a file to blob storage
 */
export const uploadBlob = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; blobName: string }> => {
  try {
    const containerClient = await getContainerClient();
    const blobName = generateUniqueBlobName(fileName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });
    
    return {
      url: blockBlobClient.url,
      blobName: blobName
    };
  } catch (error) {
    console.error('Error uploading file to blob storage:', error);
    throw error;
  }
};

/**
 * Get a blob's metadata and properties
 */
export const getBlobInfo = async (blobName: string): Promise<any> => {
  try {
    const containerClient = await getContainerClient();
    const blobClient = containerClient.getBlobClient(blobName);
    
    const properties = await blobClient.getProperties();
    
    return {
      name: blobName,
      url: blobClient.url,
      contentType: properties.contentType,
      contentLength: properties.contentLength,
      createdOn: properties.createdOn,
      lastModified: properties.lastModified,
      metadata: properties.metadata
    };
  } catch (error) {
    console.error(`Error getting blob info for ${blobName}:`, error);
    throw error;
  }
};

/**
 * Delete a blob from storage
 */
export const deleteBlob = async (blobName: string): Promise<void> => {
  try {
    const containerClient = await getContainerClient();
    const blobClient = containerClient.getBlobClient(blobName);
    
    await blobClient.delete();
  } catch (error) {
    console.error(`Error deleting blob ${blobName}:`, error);
    throw error;
  }
};

/**
 * List all blobs in the container
 */
export const listBlobs = async (prefix?: string): Promise<any[]> => {
  try {
    const containerClient = await getContainerClient();
    const blobs: any[] = [];
    
    const options = prefix ? { prefix } : undefined;
    
    for await (const blob of containerClient.listBlobsFlat(options)) {
      const blobClient = containerClient.getBlobClient(blob.name);
      blobs.push({
        name: blob.name,
        url: blobClient.url,
        lastModified: blob.properties.lastModified,
        contentType: blob.properties.contentType,
        contentLength: blob.properties.contentLength
      });
    }
    
    return blobs;
  } catch (error) {
    console.error('Error listing blobs:', error);
    throw error;
  }
}; 