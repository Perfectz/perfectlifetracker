/**
 * backend/src/models/FileModel.ts
 * Model for file metadata operations
 */
import { v4 as uuidv4 } from 'uuid';
import { FileDocument } from './types';
import db from '../config/database';

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
      
      await db.files.insertOne(newFile);
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
      return await db.files.findOne({ id: fileId });
    } catch (error) {
      console.error('Error getting file by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get files by user ID
   */
  async getFilesByUserId(userId: string): Promise<FileDocument[]> {
    try {
      return await db.files.find({ userId }).toArray();
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
      return await db.files.find({ relatedEntityId }).toArray();
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
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const result = await db.files.findOneAndUpdate(
        { id: fileId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value;
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
      const result = await db.files.deleteOne({ id: fileId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting file metadata:', error);
      throw error;
    }
  }
  
  /**
   * Get files by category
   */
  async getFilesByCategory(userId: string, category: string): Promise<FileDocument[]> {
    try {
      return await db.files.find({ userId, category }).toArray();
    } catch (error) {
      console.error('Error getting files by category:', error);
      throw error;
    }
  }
}

export default new FileModel(); 