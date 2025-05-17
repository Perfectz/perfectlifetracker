// backend/src/services/blobStorageService.ts
// Service for Azure Blob Storage operations for file attachments

import { 
  BlobServiceClient, 
  ContainerClient,
  BlockBlobClient
} from '@azure/storage-blob';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Attachment } from '../models/JournalEntry';
import { ApiError } from '../utils/ApiError';
import path from 'path';

// Load environment variables
dotenv.config();

// Constants
const CONTAINERS = {
  AVATARS: 'avatars',
  ATTACHMENTS: 'attachments'
};

// Store container clients
let avatarContainerClient: ContainerClient | null = null;
let attachmentContainerClient: ContainerClient | null = null;

/**
 * Initialize the Blob Storage service
 * @returns ContainerClient for the avatars container
 */
export async function initializeBlobStorage(): Promise<ContainerClient> {
  console.log('Initializing Blob Storage...');
  
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    
    if (!connectionString) {
      console.warn('⚠️ Blob Storage connection string not configured');
      // Create mock container client for testing instead of throwing
      return createMockContainerClient();
    }
    
    // Create blob service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Get container client and create if not exists
    const containerClient = blobServiceClient.getContainerClient(CONTAINERS.AVATARS);
    await containerClient.createIfNotExists({
      access: 'blob' // Public read access for blobs only
    });
    
    // Get attachments container client
    attachmentContainerClient = blobServiceClient.getContainerClient(CONTAINERS.ATTACHMENTS);
    await attachmentContainerClient.createIfNotExists({
      access: 'blob'
    });
    
    // Save client for reuse
    avatarContainerClient = containerClient;
    
    console.log(`Blob Storage containers ready: ${CONTAINERS.AVATARS}, ${CONTAINERS.ATTACHMENTS}`);
    return containerClient;
  } catch (error) {
    console.error('Error initializing Blob Storage:', error);
    
    // For development, create a mock container client
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return createMockContainerClient();
    }
    
    throw new ApiError('Blob Storage initialization failed', 500);
  }
}

/**
 * Create a mock container client for testing
 * @returns Mock ContainerClient
 */
function createMockContainerClient(): ContainerClient {
  console.log('Creating mock Blob Storage client for testing');
  
  // Create simple mock implementations instead of using jest.fn()
  const mockUploadData = async () => ({ etag: 'mock-etag', lastModified: new Date() });
  const mockDelete = async () => ({ succeeded: true });
  const mockUploadStream = async () => ({ etag: 'mock-etag', lastModified: new Date() });
  const mockUpload = async () => ({ etag: 'mock-etag', lastModified: new Date() });
  const mockCreateIfNotExists = async () => ({ succeeded: true });
  
  // Create mock container client
  const mockContainerClient = {
    // Mock methods used by the service
    getBlockBlobClient: (blobName: string) => ({
      url: `https://example.com/${blobName}`,
      uploadData: mockUploadData,
      delete: mockDelete,
      uploadStream: mockUploadStream,
      upload: mockUpload
    }),
    createIfNotExists: mockCreateIfNotExists,
  } as unknown as ContainerClient;
  
  // Set clients for future use
  avatarContainerClient = mockContainerClient;
  attachmentContainerClient = mockContainerClient;
  
  return mockContainerClient;
}

/**
 * Get the avatar container client
 * @returns ContainerClient for avatars
 */
export async function getAvatarContainerClient(): Promise<ContainerClient> {
  if (!avatarContainerClient) {
    await initializeBlobStorage();
  }
  
  return avatarContainerClient as ContainerClient;
}

/**
 * Get the attachment container client
 * @returns ContainerClient for attachments
 */
export async function getAttachmentContainerClient(): Promise<ContainerClient> {
  if (!attachmentContainerClient) {
    await initializeBlobStorage();
  }
  
  return attachmentContainerClient as ContainerClient;
}

/**
 * Upload avatar image
 * @param userId User ID
 * @param data File buffer
 * @param fileNameOrContentType Either fileName or contentType
 * @param maybeContentType Optional contentType
 * @returns URL of the uploaded image
 */
export async function uploadAvatar(
  userId: string,
  data: Buffer,
  fileNameOrContentType: string,
  maybeContentType?: string
): Promise<string> {
  try {
    const containerClient = await getAvatarContainerClient();
    
    // Determine fileName and contentType based on arguments
    const fileName = maybeContentType ? fileNameOrContentType : undefined;
    const contentType = maybeContentType || fileNameOrContentType;
    // Use the file extension from the original filename or MIME type
    const fileExtension = path.extname(fileName || '') || getExtensionFromMimeType(contentType);
    const blobName = `${userId}/${uuidv4()}${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });
    
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new ApiError('Failed to upload avatar', 500);
  }
}

/**
 * Get file extension from MIME type
 * @param mimeType MIME type string
 * @returns File extension with leading dot
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp'
  };
  
  return mimeToExt[mimeType] || '.jpg'; // Default to jpg if unknown
}

/**
 * Upload file attachment
 * @param userId User ID
 * @param data File buffer
 * @param filename Original filename
 * @param contentType MIME type
 * @returns Attachment object with URL
 */
export async function uploadAttachment(
  userId: string,
  data: Buffer,
  filename: string,
  contentType: string
): Promise<{ id: string; fileName: string; contentType: string; size: number; url: string }> {
  try {
    const containerClient = await getAttachmentContainerClient();
    const id = uuidv4();
    const blobName = `${userId}/${id}${path.extname(filename)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });
    
    return {
      id,
      fileName: filename,
      contentType,
      size: data.length,
      url: blockBlobClient.url
    };
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw new ApiError('Failed to upload attachment', 500);
  }
}

/**
 * Delete avatar image
 * @param url URL of the avatar image
 * @returns true if deleted, false if not found
 */
export async function deleteAvatar(url: string): Promise<boolean> {
  try {
    // Extract blob name from URL
    const blobName = extractBlobNameFromUrl(url);
    if (!blobName) {
      return false;
    }
    
    const containerClient = await getAvatarContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.delete();
    return true;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return false;
  }
}

/**
 * Delete attachment file
 * @param url URL of the attachment
 * @returns true if deleted, false if not found
 */
export async function deleteAttachment(url: string): Promise<boolean> {
  try {
    // Extract blob name from URL
    const blobName = extractBlobNameFromUrl(url);
    if (!blobName) {
      return false;
    }
    
    const containerClient = await getAttachmentContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.delete();
    return true;
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return false;
  }
}

/**
 * Extract blob name from URL
 * @param url Blob URL
 * @returns Blob name or null if invalid URL
 */
function extractBlobNameFromUrl(url: string): string | null {
  try {
    // Parse URL
    const urlObj = new URL(url);
    
    // Check if this is a mock URL for testing
    if (urlObj.hostname === 'example.com') {
      return urlObj.pathname.replace(/^\//, '');
    }
    
    // Get blob path from URL
    const pathParts = urlObj.pathname.split('/');
    
    // Remove empty first element and container name
    if (pathParts.length >= 3) {
      // Remove first empty element and container name
      pathParts.splice(0, 2);
      return pathParts.join('/');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting blob name from URL:', error);
    return null;
  }
} 