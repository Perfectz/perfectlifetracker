// backend/src/journalService.ts
// Journal entry service

import { Container } from '@azure/cosmos';
import { v4 as uuidv4 } from 'uuid';
import { JournalEntry, JournalEntryCreateDTO, JournalEntryUpdateDTO, JournalEntryFilterOptions } from '../models/JournalEntry';
import { getJournalsContainer } from './cosmosClient';
import { analyzeSentiment } from './textAnalyticsService';
import { indexJournalEntry, deleteJournalEntryFromIndex, FEATURE_SEARCH } from './searchService';
import { ApiError } from '../utils/ApiError';

/**
 * Create a new journal entry
 * @param journalData Journal entry data
 * @returns Created journal entry
 */
export async function createJournalEntry(journalData: JournalEntryCreateDTO): Promise<JournalEntry> {
  try {
    const container = getJournalsContainer();
    
    // Generate ID
    const id = uuidv4();
    
    // Get sentiment score
    const sentimentScore = await analyzeSentiment(journalData.content);
    
    // Prepare journal entry with default values
    const now = new Date();
    const entry: JournalEntry = {
      id,
      userId: journalData.userId,
      content: journalData.content,
      contentFormat: journalData.contentFormat || 'plain',
      date: journalData.date || now,
      sentimentScore,
      attachments: journalData.attachments || [],
      createdAt: now,
      updatedAt: now,
      tags: journalData.tags || []
    };
    
    // Create in Cosmos DB
    const { resource } = await container.items.create(entry);
    
    // Index for search
    if (FEATURE_SEARCH.enabled) {
      await indexJournalEntry(resource as JournalEntry);
    }
    
    return resource as JournalEntry;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw new ApiError('Failed to create journal entry', 500);
  }
}

/**
 * Get journal entries for a user with filtering and pagination
 * @param userId User ID
 * @param filters Filter options
 * @param limit Max number of entries to return
 * @param offset Number of entries to skip
 * @returns Journal entries and total count
 */
export async function getJournalEntriesByUserId(
  userId: string,
  filters: JournalEntryFilterOptions = {},
  limit: number = 50,
  offset: number = 0
): Promise<{ items: JournalEntry[], count: number }> {
  try {
    const container = getJournalsContainer();
    
    // Build query
    let query = `SELECT * FROM c WHERE c.userId = @userId`;
    const parameters = [{ name: '@userId', value: userId }];
    
    // Apply date range filter
    if (filters.startDate) {
      query += ` AND c.date >= @startDate`;
      parameters.push({ name: '@startDate', value: filters.startDate.toISOString() });
    }
    
    if (filters.endDate) {
      query += ` AND c.date <= @endDate`;
      parameters.push({ name: '@endDate', value: filters.endDate.toISOString() });
    }
    
    // Apply sentiment range filter
    if (filters.sentimentRange) {
      if (filters.sentimentRange.min !== undefined) {
        query += ` AND c.sentimentScore >= @minSentiment`;
        parameters.push({ name: '@minSentiment', value: filters.sentimentRange.min.toString() });
      }
      
      if (filters.sentimentRange.max !== undefined) {
        query += ` AND c.sentimentScore <= @maxSentiment`;
        parameters.push({ name: '@maxSentiment', value: filters.sentimentRange.max.toString() });
      }
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map((tag, index) => {
        const paramName = `@tag${index}`;
        parameters.push({ name: paramName, value: tag });
        return `ARRAY_CONTAINS(c.tags, ${paramName})`;
      });
      
      query += ` AND (${tagConditions.join(' OR ')})`;
    }
    
    // Add order and pagination
    query += ` ORDER BY c.date DESC OFFSET ${offset} LIMIT ${limit}`;
    
    // Execute query
    const querySpec = {
      query,
      parameters
    };
    
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    
    // Count total entries (without pagination)
    const countQuery = query.split('ORDER BY')[0];
    const countQuerySpec = {
      query: `SELECT COUNT(1) as count FROM c WHERE ${countQuery.split('WHERE')[1]}`,
      parameters
    };
    
    const { resources: countResult } = await container.items.query(countQuerySpec).fetchAll();
    const count = countResult[0]?.count || 0;
    
    return { items, count };
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw new ApiError('Failed to get journal entries', 500);
  }
}

/**
 * Get a journal entry by ID
 * @param id Journal entry ID
 * @param userId User ID
 * @returns Journal entry or null if not found
 */
export async function getJournalEntryById(id: string, userId: string): Promise<JournalEntry | null> {
  try {
    const container = getJournalsContainer();
    
    // Query by ID and user ID
    const querySpec = {
      query: `SELECT * FROM c WHERE c.id = @id AND c.userId = @userId`,
      parameters: [
        { name: '@id', value: id },
        { name: '@userId', value: userId }
      ]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    
    // Return first item or null
    return resources[0] || null;
  } catch (error) {
    console.error('Error getting journal entry:', error);
    throw new ApiError('Failed to get journal entry', 500);
  }
}

/**
 * Update a journal entry
 * @param id Journal entry ID
 * @param userId User ID
 * @param updateData Update data
 * @returns Updated journal entry or null if not found
 */
export async function updateJournalEntry(
  id: string,
  userId: string,
  updateData: JournalEntryUpdateDTO
): Promise<JournalEntry | null> {
  try {
    // Get existing entry
    const existing = await getJournalEntryById(id, userId);
    if (!existing) {
      return null;
    }
    
    // Prepare update
    const now = new Date();
    const updated: JournalEntry = {
      ...existing,
      ...updateData,
      updatedAt: now
    };
    
    // Update sentiment if content changed
    if (updateData.content) {
      updated.sentimentScore = await analyzeSentiment(updateData.content);
    }
    
    // Update in Cosmos DB
    const container = getJournalsContainer();
    const { resource } = await container.item(id, userId).replace(updated);
    
    // Update search index
    if (FEATURE_SEARCH.enabled) {
      await indexJournalEntry(resource as JournalEntry);
    }
    
    return resource as JournalEntry;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw new ApiError('Failed to update journal entry', 500);
  }
}

/**
 * Delete a journal entry
 * @param id Journal entry ID
 * @param userId User ID
 * @returns True if deleted, false if not found
 */
export async function deleteJournalEntry(id: string, userId: string): Promise<boolean> {
  try {
    // Get existing entry to verify ownership
    const existing = await getJournalEntryById(id, userId);
    if (!existing) {
      return false;
    }
    
    // Delete from Cosmos DB
    const container = getJournalsContainer();
    await container.item(id, userId).delete();
    
    // Delete from search index
    if (FEATURE_SEARCH.enabled) {
      await deleteJournalEntryFromIndex(id);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw new ApiError('Failed to delete journal entry', 500);
  }
} 