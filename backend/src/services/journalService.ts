// backend/src/services/journalService.ts
// Service for journal operations with sentiment analysis

import { v4 as uuidv4 } from 'uuid';
import { Container } from '@azure/cosmos';
import { getJournalsContainer } from './cosmosClient';
import { analyzeSentiment } from './textAnalyticsService';
import { JournalEntry, JournalEntryCreateDTO, JournalEntryUpdateDTO, JournalEntryFilterOptions } from '../models/JournalEntry';
import { ApiError } from '../utils/ApiError';

/**
 * Create a new journal entry with sentiment analysis
 * @param journalData Journal entry data from the client
 * @returns Created journal entry with sentiment score
 */
export async function createJournalEntry(journalData: JournalEntryCreateDTO): Promise<JournalEntry> {
  try {
    const container = getJournalsContainer();
    
    // Analyze sentiment of journal content
    const sentimentScore = await analyzeSentiment(journalData.content);
    
    const now = new Date();
    const journalEntry: JournalEntry = {
      id: uuidv4(),
      userId: journalData.userId,
      content: journalData.content,
      date: journalData.date || now,
      sentimentScore,
      createdAt: now,
      updatedAt: now,
      tags: journalData.tags || []
    };
    
    const { resource } = await container.items.create(journalEntry);
    return resource as JournalEntry;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw new ApiError('Failed to create journal entry', 500);
  }
}

/**
 * Get journal entries for a user with filtering and pagination
 * @param userId User ID
 * @param filters Optional filter parameters
 * @param limit Maximum number of entries to return
 * @param offset Pagination offset
 * @returns Journal entries and total count
 */
export async function getJournalEntriesByUserId(
  userId: string,
  filters: JournalEntryFilterOptions = {},
  limit = 50,
  offset = 0
): Promise<{ items: JournalEntry[]; count: number }> {
  try {
    const container = getJournalsContainer();
    
    // Build query conditions
    const conditions: string[] = [`c.userId = @userId`];
    const parameters: { name: string; value: any }[] = [{ name: '@userId', value: userId }];
    
    // Add date range filters
    if (filters.startDate) {
      conditions.push(`c.date >= @startDate`);
      parameters.push({ name: '@startDate', value: filters.startDate.toISOString() });
    }
    
    if (filters.endDate) {
      conditions.push(`c.date <= @endDate`);
      parameters.push({ name: '@endDate', value: filters.endDate.toISOString() });
    }
    
    // Add sentiment range filters
    if (filters.sentimentRange) {
      if (filters.sentimentRange.min !== undefined) {
        conditions.push(`c.sentimentScore >= @minSentiment`);
        parameters.push({ name: '@minSentiment', value: filters.sentimentRange.min });
      }
      
      if (filters.sentimentRange.max !== undefined) {
        conditions.push(`c.sentimentScore <= @maxSentiment`);
        parameters.push({ name: '@maxSentiment', value: filters.sentimentRange.max });
      }
    }
    
    // Add tag filters if provided
    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map((_, index) => {
        const param = `@tag${index}`;
        parameters.push({ name: param, value: filters.tags![index] });
        return `ARRAY_CONTAINS(c.tags, ${param})`;
      });
      
      conditions.push(`(${tagConditions.join(' OR ')})`);
    }
    
    // Build the query
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countQuery = `SELECT VALUE COUNT(1) FROM c ${whereClause}`;
    const itemsQuery = `SELECT * FROM c ${whereClause} ORDER BY c.date DESC OFFSET ${offset.toString()} LIMIT ${limit.toString()}`;
    
    // Execute count query
    const { resources: countResults } = await container.items.query({
      query: countQuery,
      parameters
    }).fetchAll();
    
    const count = countResults[0] as number;
    
    // Execute items query
    const { resources: items } = await container.items.query({
      query: itemsQuery,
      parameters
    }).fetchAll();
    
    return { items, count };
  } catch (error) {
    console.error('Error retrieving journal entries:', error);
    throw new ApiError('Failed to retrieve journal entries', 500);
  }
}

/**
 * Get a specific journal entry by ID
 * @param id Journal entry ID
 * @param userId User ID for authorization
 * @returns Journal entry or null if not found
 */
export async function getJournalEntryById(id: string, userId: string): Promise<JournalEntry | null> {
  try {
    const container = getJournalsContainer();
    
    const query = {
      query: 'SELECT * FROM c WHERE c.id = @id AND c.userId = @userId',
      parameters: [
        { name: '@id', value: id },
        { name: '@userId', value: userId }
      ]
    };
    
    const { resources } = await container.items.query(query).fetchAll();
    
    return resources.length > 0 ? resources[0] as JournalEntry : null;
  } catch (error) {
    console.error('Error retrieving journal entry:', error);
    throw new ApiError('Failed to retrieve journal entry', 500);
  }
}

/**
 * Update an existing journal entry
 * @param id Journal entry ID
 * @param userId User ID for authorization
 * @param updates Update data
 * @returns Updated journal entry or null if not found
 */
export async function updateJournalEntry(
  id: string,
  userId: string,
  updates: JournalEntryUpdateDTO
): Promise<JournalEntry | null> {
  try {
    // First, get the existing entry
    const existingEntry = await getJournalEntryById(id, userId);
    
    if (!existingEntry) {
      return null;
    }
    
    const container = getJournalsContainer();
    
    // Analyze sentiment if content is updated
    let sentimentScore = existingEntry.sentimentScore;
    if (updates.content) {
      sentimentScore = await analyzeSentiment(updates.content);
    }
    
    // Build updated entry
    const updatedEntry: JournalEntry = {
      ...existingEntry,
      ...updates,
      sentimentScore,
      updatedAt: new Date()
    };
    
    // Update in Cosmos DB
    const { resource } = await container.item(id, userId).replace(updatedEntry);
    
    return resource as JournalEntry;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw new ApiError('Failed to update journal entry', 500);
  }
}

/**
 * Delete a journal entry
 * @param id Journal entry ID
 * @param userId User ID for authorization
 * @returns True if deleted, false if not found
 */
export async function deleteJournalEntry(id: string, userId: string): Promise<boolean> {
  try {
    const container = getJournalsContainer();
    
    // First check if entry exists and belongs to user
    const entry = await getJournalEntryById(id, userId);
    
    if (!entry) {
      return false;
    }
    
    // Delete the entry
    await container.item(id, userId).delete();
    
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw new ApiError('Failed to delete journal entry', 500);
  }
} 