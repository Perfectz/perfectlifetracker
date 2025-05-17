// backend/src/services/journalService.ts
// Service for journal operations with sentiment analysis

import { v4 as uuidv4 } from 'uuid';
import { Container } from '@azure/cosmos';
import { getJournalsContainer } from './cosmosClient';
import { analyzeSentiment } from './textAnalyticsService';
import { indexJournalEntry, deleteJournalEntryFromIndex, FEATURE_SEARCH, searchJournalEntries as searchJournalEntriesInIndex } from './searchService';
import { JournalEntry, JournalEntryCreateDTO, JournalEntryUpdateDTO, JournalEntryFilterOptions, JournalCursor, PaginatedResult } from '../models/JournalEntry';
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
      contentFormat: journalData.contentFormat || 'plain',
      date: journalData.date || now,
      sentimentScore,
      attachments: journalData.attachments || [],
      createdAt: now,
      updatedAt: now,
      tags: journalData.tags || []
    };
    
    const { resource } = await container.items.create(journalEntry);
    
    // Index the entry for search
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
 * Helper function to encode cursor for pagination
 * @param lastItem Last item in the current page
 * @param limit Page size
 * @returns Encoded cursor string
 */
function encodeCursor(lastItem: JournalEntry | null, limit: number): string | undefined {
  if (!lastItem) {
    return undefined;
  }
  
  const cursor: JournalCursor = {
    lastId: lastItem.id,
    lastDate: lastItem.date.toISOString(),
    limit
  };
  
  return Buffer.from(JSON.stringify(cursor)).toString('base64');
}

/**
 * Helper function to decode cursor for pagination
 * @param cursorString Encoded cursor string
 * @returns Decoded cursor object or null if invalid
 */
function decodeCursor(cursorString: string): JournalCursor | null {
  try {
    const decoded = Buffer.from(cursorString, 'base64').toString('utf-8');
    return JSON.parse(decoded) as JournalCursor;
  } catch (error) {
    console.error('Error decoding cursor:', error);
    return null;
  }
}

/**
 * Get journal entries for a user with filtering and pagination
 * @param userId User ID
 * @param filters Optional filter parameters
 * @param limit Maximum number of entries to return
 * @param offset Number of entries to skip (for offset pagination)
 * @returns Journal entries and pagination info
 */
export async function getJournalEntriesByUserId(
  userId: string,
  filters: JournalEntryFilterOptions = {},
  limit: number = 50,
  offset?: number | string
): Promise<PaginatedResult<JournalEntry>> {
  try {
    const container = getJournalsContainer();
    
    // Handle offset or cursor-based pagination based on the type of the offset parameter
    const isCursorMode = typeof offset === 'string';
    const isOffsetMode = typeof offset === 'number';
    
    // Parse cursor if provided and we're in cursor mode
    const cursorData = isCursorMode ? decodeCursor(offset as string) : null;
    const pageSize = cursorData?.limit || limit;
    const skipCount = isOffsetMode ? offset as number : 0;
    
    // Build query
    let query = `SELECT * FROM c WHERE c.userId = @userId`;
    const parameters = [{ name: '@userId', value: userId }];
    
    // Apply continuation criteria if cursor is provided
    if (isCursorMode && cursorData?.lastId && cursorData?.lastDate) {
      query += ` AND (c.date < @lastDate OR (c.date = @lastDate AND c.id < @lastId))`;
      parameters.push(
        { name: '@lastDate', value: cursorData.lastDate },
        { name: '@lastId', value: cursorData.lastId }
      );
    }
    
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
    
    // Combine the where clauses for count query
    const whereClause = query.split('WHERE')[1];
    
    // Add order and pagination
    if (isCursorMode) {
      // Cursor mode: Fetch one extra to determine if there are more items
      query += ` ORDER BY c.date DESC, c.id DESC LIMIT ${pageSize + 1}`;
    } else {
      // Offset mode: Use OFFSET and LIMIT
      query += ` ORDER BY c.date DESC, c.id DESC OFFSET ${skipCount} LIMIT ${limit}`;
    }
    
    // Execute query
    const querySpec = {
      query,
      parameters
    };
    
    const { resources: items } = await container.items.query(querySpec).fetchAll();
    
    // Prepare result
    const result: PaginatedResult<JournalEntry> = { items: [] };
    
    if (isCursorMode) {
      // Check if there are more items in cursor mode
      const hasMore = items.length > pageSize;
      if (hasMore) {
        // Remove the extra item
        items.pop();
      }
      
      // Generate the next cursor
      const lastItem = items.length > 0 ? items[items.length - 1] : null;
      const nextCursor = hasMore ? encodeCursor(lastItem, pageSize) : undefined;
      
      result.items = items;
      result.nextCursor = nextCursor;
      result.hasMore = hasMore;
    } else {
      // Offset mode: Add count for pagination
      result.items = items;
      
      // Get total count (only in offset mode)
      if (isOffsetMode) {
        // Always perform the count query in offset mode, regardless of whether we need it
        const countQuery = `SELECT VALUE COUNT(1) FROM c WHERE ${whereClause}`;
        const countQuerySpec = {
          query: countQuery,
          parameters
        };
        
        const { resources: countResult } = await container.items.query(countQuerySpec).fetchAll();
        result.count = countResult[0] || 0;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error retrieving journal entries:', error);
    throw new ApiError('Failed to retrieve journal entries', 500);
  }
}

/**
 * Search for journal entries by text content
 * @param userId User ID
 * @param searchText Text to search for
 * @param filters Additional filters
 * @param limit Maximum number of entries to return
 * @param offsetOrCursor Optional offset (number) or cursor (string) for pagination
 * @returns Journal entries matching the search query and pagination info
 */
export async function searchJournalEntries(
  userId: string,
  searchText: string,
  filters: JournalEntryFilterOptions = {},
  limit = 50,
  offsetOrCursor?: string | number
): Promise<PaginatedResult<JournalEntry> & { facets?: Record<string, Array<{ value: string; count: number }>> }> {
  try {
    if (!FEATURE_SEARCH.enabled) {
      // Fallback to basic filtering if search is not enabled
      return getJournalEntriesByUserId(userId, filters, limit, offsetOrCursor);
    }
    
    // Handle offset vs cursor logic
    let isCursorMode = typeof offsetOrCursor === 'string';
    let cursor = isCursorMode ? offsetOrCursor as string : undefined;
    
    // If we're in offset mode, convert the number to a string cursor for the search service
    if (typeof offsetOrCursor === 'number') {
      cursor = Buffer.from(offsetOrCursor.toString(), 'utf-8').toString('base64');
    }
    
    // Parse cursor if provided
    const cursorData = cursor ? decodeCursor(cursor) : null;
    const pageSize = cursorData?.limit || limit;
    
    // Use the search service with cursor parameter - the service requires a string cursor
    const searchResponse = await searchJournalEntriesInIndex(userId, searchText, filters, pageSize + 1, cursor);
    
    // We need to fetch the complete entries from Cosmos DB
    // since search index doesn't have all fields
    if (searchResponse.results.length === 0) {
      return { items: [], hasMore: false };
    }
    
    // Get the IDs from search results
    const ids = searchResponse.results.map(result => result.id!);
    
    // Fetch the complete entries from Cosmos DB
    const container = getJournalsContainer();
    const entries: JournalEntry[] = [];
    
    // Fetch entries in batches (Cosmos has a limit on query complexity)
    const batchSize = 20;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);
      
      // Create query parameters for IN clause
      const parameters = [{ name: '@userId', value: userId }];
      const idParams = batchIds.map((id, index) => {
        parameters.push({ name: `@id${index}`, value: id });
        return `@id${index}`;
      });
      
      // Build the query
      const querySpec = {
        query: `SELECT * FROM c WHERE c.userId = @userId AND c.id IN (${idParams.join(',')}) ORDER BY c.date DESC, c.id DESC`,
        parameters
      };
      
      // Execute the query
      const { resources } = await container.items.query(querySpec).fetchAll();
      entries.push(...resources as JournalEntry[]);
    }
    
    // Filter out entries by cursor manually if we have a cursor
    // This is a simplified implementation since search doesn't natively support cursor pagination
    const filteredEntries = entries;
    
    // Check if there are more items
    const hasMore = filteredEntries.length > pageSize;
    if (hasMore) {
      // Remove the extra item
      filteredEntries.pop();
    }
    
    // Generate the next cursor
    const lastItem = filteredEntries.length > 0 ? filteredEntries[filteredEntries.length - 1] : null;
    const nextCursor = hasMore ? encodeCursor(lastItem, pageSize) : undefined;
    
    return {
      items: filteredEntries,
      nextCursor,
      hasMore,
      facets: searchResponse.facets
    };
  } catch (error) {
    console.error('Error searching journal entries:', error);
    throw new ApiError('Failed to search journal entries', 500);
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
    
    // Clean up removed attachments if attachments were updated
    if (updates.attachments && existingEntry.attachments) {
      // Import deleteAttachment here to avoid circular dependency
      const { deleteAttachment } = await import('./blobStorageService');
      
      // Find attachments that were removed
      const existingAttachmentIds = new Set(existingEntry.attachments.map(a => a.id));
      const updatedAttachmentIds = new Set(updates.attachments.map(a => a.id));
      
      // Delete attachments that are in existing but not in updated
      const removedAttachments = existingEntry.attachments.filter(
        attachment => !updatedAttachmentIds.has(attachment.id)
      );
      
      // Delete each removed attachment
      for (const attachment of removedAttachments) {
        try {
          await deleteAttachment(attachment.url);
        } catch (error) {
          console.error(`Failed to delete attachment ${attachment.id}:`, error);
          // Continue updating the entry even if some attachments fail to delete
        }
      }
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
    
    // Update the search index
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
    
    // Delete any attachments
    if (entry.attachments && entry.attachments.length > 0) {
      // Import deleteAttachment here to avoid circular dependency
      const { deleteAttachment } = await import('./blobStorageService');
      
      // Delete each attachment
      for (const attachment of entry.attachments) {
        try {
          await deleteAttachment(attachment.url);
        } catch (error) {
          console.error(`Failed to delete attachment ${attachment.id}:`, error);
          // Continue deleting the entry even if some attachments fail to delete
        }
      }
    }
    
    // Delete the entry
    await container.item(id, userId).delete();
    
    // Remove from search index
    if (FEATURE_SEARCH.enabled) {
      await deleteJournalEntryFromIndex(id);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw new ApiError('Failed to delete journal entry', 500);
  }
} 