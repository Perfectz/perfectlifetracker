/**
 * backend/src/models/FileModel.ts
 * Model for file metadata operations using Cosmos DB
 */
import { v4 as uuidv4 } from 'uuid';
import { FileDocument } from './types';
import databaseService from '../services/DatabaseService';

export class FileModel {
  /**
   * Create a file metadata record
   */
  async createFile(fileData: Omit<FileDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<FileDocument> {
    try {
      const now = new Date().toISOString();
      
      const newFile: FileDocument = {
        id: uuidv4(),
        ...fileData,
        createdAt: now,
        updatedAt: now
      };
      
      const container = databaseService.getContainer('files');
      if (!container) {
        throw new Error('Files container not available');
      }
      
      await container.items.create(newFile);
      return newFile;
    } catch (error) {
      console.error('Error creating file record:', error);
      throw error;
    }
  }
  
  /**
   * Get file metadata by ID
   */
  async getFileById(fileId: string): Promise<FileDocument | null> {
    try {
      const container = databaseService.getContainer('files');
      if (!container) {
        throw new Error('Files container not available');
      }
      
      const { resource } = await container.item(fileId, fileId).read();
      return resource || null;
    } catch (error) {
      console.error('Error getting file by ID:', error);
      return null;
    }
  }
  
  /**
   * Get files by user ID
   */
  async getFilesByUserId(userId: string): Promise<FileDocument[]> {
    try {
      const container = databaseService.getContainer('files');
      if (!container) {
        throw new Error('Files container not available');
      }
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting files by user ID:', error);
      throw error;
    }
  }
  
  /**
   * Get files related to a specific entity
   */
  async getFilesByRelatedEntity(relatedEntityId: string): Promise<FileDocument[]> {
    try {
      const container = databaseService.getContainer('files');
      if (!container) {
        throw new Error('Files container not available');
      }
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.relatedEntityId = @relatedEntityId',
        parameters: [{ name: '@relatedEntityId', value: relatedEntityId }]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting files by related entity:', error);
      throw error;
    }
  }
  
  /**
   * Update file metadata
   */
  async updateFile(fileId: string, updates: Partial<FileDocument>): Promise<FileDocument | null> {
    try {
      const container = databaseService.getContainer('files');
      if (!container) {
        throw new Error('Files container not available');
      }
      
      // First get the existing file
      const { resource: existingFile } = await container.item(fileId, fileId).read();
      if (!existingFile) {
        return null;
      }
      
      const updateData = {
        ...existingFile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const { resource } = await container.item(fileId, fileId).replace(updateData);
      return resource;
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }
  
  /**
   * Delete file metadata
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const container = databaseService.getContainer('files');
      if (!container) {
        throw new Error('Files container not available');
      }
      
      await container.item(fileId, fileId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting file metadata:', error);
      return false;
    }
  }
  
  /**
   * Get files by category
   */
  async getFilesByCategory(userId: string, category: string): Promise<FileDocument[]> {
    try {
      const container = databaseService.getContainer('files');
      if (!container) {
        throw new Error('Files container not available');
      }
      
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.category = @category',
        parameters: [
          { name: '@userId', value: userId },
          { name: '@category', value: category }
        ]
      };
      
      const { resources } = await container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting files by category:', error);
      throw error;
    }
  }
}

export default new FileModel(); 