import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import * as blobService from '../../src/services/blobStorageService';
import { initializeBlobStorage } from '../../src/services/blobStorageService';

// Mock environment
process.env.AZURE_STORAGE_CONNECTION_STRING = '';
process.env.NODE_ENV = 'test';

// Mock Azure SDK
jest.mock('@azure/storage-blob', () => {
  // Create mock create if not exists method that resolves to true
  const mockCreateIfNotExists = jest.fn().mockResolvedValue({ exists: true });
  
  // Create mock block blob client first
  const mockBlockBlobClient = {
    uploadData: jest.fn().mockResolvedValue({}),
    upload: jest.fn().mockResolvedValue({}),
    url: 'https://example.com/user123-123.jpg',
    delete: jest.fn().mockResolvedValue({}),
  };
  
  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn().mockReturnValue({
        getContainerClient: jest.fn().mockReturnValue({
          createIfNotExists: mockCreateIfNotExists,
          getBlockBlobClient: jest.fn().mockReturnValue(mockBlockBlobClient),
        }),
      }),
    },
  };
});

describe('Blob Storage Service', () => {
  let spy: jest.SpyInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Spy on console.log to avoid cluttering test output
    spy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  
  afterEach(() => {
    spy.mockRestore();
  });
  
  describe('initializeBlobStorage', () => {
    it('should initialize the container client', async () => {
      // Initialize blob storage
      const containerClient = await initializeBlobStorage();
      
      // Verify container client was returned
      expect(containerClient).toBeDefined();
      
      // In our new design, we return a mock client for testing
      expect(containerClient.getBlockBlobClient).toBeDefined();
    });
    
    it('should create a mock container client when no connection string provided', async () => {
      // Initialize blob storage
      const containerClient = await initializeBlobStorage();
      
      // Verify a mock client was created
      expect(containerClient).toBeDefined();
      expect(containerClient.getBlockBlobClient).toBeDefined();
    });
  });
  
  describe('uploadAvatar', () => {
    it('should upload avatar and return the URL', async () => {
      // Initialize storage first (needed in our implementation)
      await initializeBlobStorage();
      
      // Prepare test data
      const userId = 'user123';
      const imageData = Buffer.from('fake image data');
      const contentType = 'image/jpeg';
      
      // Upload avatar
      const url = await blobService.uploadAvatar(userId, imageData, contentType);
      
      // Verify URL returned
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });
  });
  
  describe('deleteAvatar', () => {
    it('should delete avatar and return success', async () => {
      // Initialize storage first
      await initializeBlobStorage();
      
      // Delete avatar
      const result = await blobService.deleteAvatar('https://example.com/user123-123.jpg');
      
      // Verify result
      expect(result).toBe(true);
    });
    
    it('should return false if URL is invalid', async () => {
      // Initialize storage first
      await initializeBlobStorage();
      
      // Delete with invalid URL
      const result = await blobService.deleteAvatar('invalid-url');
      
      // Verify result
      expect(result).toBe(false);
    });
  });
  
  describe('uploadAttachment', () => {
    it('should upload attachment and return metadata', async () => {
      // Initialize storage first
      await initializeBlobStorage();
      
      // Prepare test data
      const userId = 'user123';
      const fileData = Buffer.from('fake file data');
      const fileName = 'test-doc.pdf';
      const contentType = 'application/pdf';
      
      // Upload attachment with correct parameter order
      const attachment = await blobService.uploadAttachment(
        userId,
        fileData,
        fileName,
        contentType
      );
      
      // Verify attachment metadata
      expect(attachment).toBeDefined();
      expect(attachment.id).toBeDefined();
      expect(attachment.fileName).toBe(fileName);
      expect(attachment.contentType).toBe(contentType);
      expect(attachment.size).toBe(fileData.length);
      expect(attachment.url).toBeDefined();
    });
  });
  
  describe('deleteAttachment', () => {
    it('should delete attachment and return success', async () => {
      // Initialize storage first
      await initializeBlobStorage();
      
      // Delete attachment
      const result = await blobService.deleteAttachment('https://example.com/user123/attachment123.pdf');
      
      // Verify result
      expect(result).toBe(true);
    });
    
    it('should return false if URL is invalid', async () => {
      // Initialize storage first
      await initializeBlobStorage();
      
      // Delete with invalid URL
      const result = await blobService.deleteAttachment('invalid-url');
      
      // Verify result
      expect(result).toBe(false);
    });
  });
}); 