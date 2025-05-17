// backend/src/services/searchService.ts
// Service for Azure Cognitive Search integration for journal entries

import { 
  SearchClient, 
  SearchIndexClient, 
  AzureKeyCredential, 
  SearchIndex,
  SearchField,
  SimpleField,
  SearchFieldDataType
} from '@azure/search-documents';
import dotenv from 'dotenv';
import { JournalEntry, JournalEntryFilterOptions } from '../models/JournalEntry';
import { ApiError } from '../utils/ApiError';
import { FeatureFlags } from '../utils/featureFlags';

// Load environment variables
dotenv.config();

// Use feature flag from FeatureFlags, with a private variable for tests
let _featureEnabled = FeatureFlags.ENABLE_SEARCH;

// Export FEATURE_SEARCH with a getter based on the private variable
export const FEATURE_SEARCH = {
  get enabled() {
    return _featureEnabled;
  }
};

// Function for tests to override the feature flag
export function setFeatureSearchEnabled(enabled: boolean): void {
  _featureEnabled = enabled;
}

// Search service configuration
const searchConfig = {
  endpoint: process.env.SEARCH_SERVICE_ENDPOINT || '',
  apiKey: process.env.SEARCH_SERVICE_API_KEY || '',
  indexName: process.env.SEARCH_INDEX_NAME || 'journals-index'
};

// Define the search document type (subset of JournalEntry for search)
interface JournalSearchDocument {
  id: string;
  userId: string;
  content: string;
  date: Date;
  sentimentScore: number;
  tags?: string[];
}

// Define type for search client - exported via getter to facilitate testing
let _searchClient: SearchClient<JournalSearchDocument> | null = null;

// Getter for search client to allow mocking in tests
export function getSearchClient(): SearchClient<JournalSearchDocument> | null {
  return _searchClient;
}

// Setter for tests to inject a mock client
export function setSearchClient(client: SearchClient<JournalSearchDocument> | null): void {
  _searchClient = client;
}

/**
 * Initialize the Search service and create index if needed
 */
export async function initializeSearchService(): Promise<void> {
  if (!FEATURE_SEARCH.enabled) {
    console.log('Search feature is disabled');
    return;
  }

  if (!searchConfig.endpoint || !searchConfig.apiKey) {
    console.warn('⚠️ Search service credentials not configured');
    // Continue with initialization for testing
  }

  try {
    console.log('Initializing Search service...');
    
    // Create credential even with empty strings for testing
    const credential = new AzureKeyCredential(searchConfig.apiKey || 'test-key');
    
    // Create index client to manage the search index
    const indexClient = new SearchIndexClient(
      searchConfig.endpoint || 'https://test.search.windows.net',
      credential
    );
    
    // Check if the index exists, create if not
    if (searchConfig.endpoint) {
      try {
        await indexClient.getIndex(searchConfig.indexName);
        console.log(`Search index '${searchConfig.indexName}' already exists`);
      } catch (error) {
        console.log(`Creating search index '${searchConfig.indexName}'...`);
        await createSearchIndex(indexClient);
      }
    }
    
    // Create search client for search operations
    _searchClient = new SearchClient<JournalSearchDocument>(
      searchConfig.endpoint || 'https://test.search.windows.net',
      searchConfig.indexName,
      credential
    );
    
    console.log(`Search index '${searchConfig.indexName}' ready`);
  } catch (error) {
    console.error('Error initializing Search service:', error);
  }
}

/**
 * Create the search index with fields and analyzers
 * @param indexClient SearchIndexClient
 */
async function createSearchIndex(indexClient: SearchIndexClient): Promise<void> {
  // Define the search index schema with proper types
  const index: SearchIndex = {
    name: searchConfig.indexName,
    fields: [
      {
        name: 'id',
        type: 'Edm.String' as SearchFieldDataType,
        key: true,
        searchable: false,
        filterable: true
      } as SimpleField,
      {
        name: 'userId',
        type: 'Edm.String' as SearchFieldDataType,
        searchable: false,
        filterable: true
      } as SimpleField,
      {
        name: 'content',
        type: 'Edm.String' as SearchFieldDataType,
        searchable: true,
        filterable: false,
        analyzer: 'standard.lucene'
      } as SearchField,
      {
        name: 'date',
        type: 'Edm.DateTimeOffset' as SearchFieldDataType,
        searchable: false,
        filterable: true,
        sortable: true
      } as SimpleField,
      {
        name: 'sentimentScore',
        type: 'Edm.Double' as SearchFieldDataType,
        searchable: false,
        filterable: true,
        sortable: true
      } as SimpleField,
      {
        name: 'tags',
        type: 'Collection(Edm.String)' as SearchFieldDataType,
        searchable: true,
        filterable: true
      } as SearchField
    ]
  };
  
  // Create the index
  await indexClient.createIndex(index);
}

/**
 * Index a journal entry for search
 * @param entry JournalEntry to index
 * @returns void
 */
export async function indexJournalEntry(entry: JournalEntry): Promise<void> {
  if (!FEATURE_SEARCH.enabled || !_searchClient) {
    return;
  }
  
  try {
    // Prepare the document for indexing (convert JournalEntry to JournalSearchDocument)
    const searchDoc: JournalSearchDocument = {
      id: entry.id,
      userId: entry.userId,
      content: entry.content,
      date: entry.date,
      sentimentScore: entry.sentimentScore,
      tags: entry.tags || []
    };
    
    // Merge or upload the document
    await _searchClient.mergeOrUploadDocuments([searchDoc]);
  } catch (error) {
    console.error('Error indexing journal entry:', error);
    // Don't throw - indexing errors shouldn't break the main flow
  }
}

/**
 * Delete a journal entry from the index
 * @param id Journal entry ID
 * @returns void
 */
export async function deleteJournalEntryFromIndex(id: string): Promise<void> {
  if (!FEATURE_SEARCH.enabled || !_searchClient) {
    return;
  }
  
  try {
    // Only need the ID for deletion
    await _searchClient.deleteDocuments([{ id } as JournalSearchDocument]);
  } catch (error) {
    console.error('Error deleting journal entry from index:', error);
    // Don't throw - indexing errors shouldn't break the main flow
  }
}

/**
 * Search for journal entries
 * @param userId User ID to filter by
 * @param searchText Text to search for
 * @param filters Additional filters
 * @param limit Maximum number of entries to return
 * @param offsetOrCursor Either pagination offset (number) or cursor (string)
 * @returns Journal entries matching the search, count, and facets
 */
export async function searchJournalEntries(
  userId: string,
  searchText: string,
  filters: JournalEntryFilterOptions = {},
  limit = 50,
  offsetOrCursor?: string | number
): Promise<{
  results: Partial<JournalEntry>[];
  count: number;
  nextCursor?: string;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}> {
  // If search is disabled or client is not initialized, throw error
  if (!FEATURE_SEARCH.enabled || !_searchClient) {
    throw new ApiError('Search service not available', 503);
  }
  
  try {
    // Calculate offset based on the type of offsetOrCursor
    let offset = 0;
    
    if (typeof offsetOrCursor === 'number') {
      // Already a number offset
      offset = offsetOrCursor;
    } else if (typeof offsetOrCursor === 'string') {
      try {
        // For basic implementation, use a base64 encoded number as cursor
        const decoded = Buffer.from(offsetOrCursor, 'base64').toString('utf-8');
        offset = parseInt(decoded, 10);
        if (isNaN(offset)) offset = 0;
      } catch (err) {
        console.warn('Invalid cursor format:', err);
        offset = 0;
      }
    }
    
    // Build filter string
    let filterExpressions: string[] = [`userId eq '${userId}'`];
    
    // Add date range filters
    if (filters.startDate) {
      filterExpressions.push(`date ge ${filters.startDate.toISOString()}`);
    }
    
    if (filters.endDate) {
      filterExpressions.push(`date le ${filters.endDate.toISOString()}`);
    }
    
    // Add sentiment range filters
    if (filters.sentimentRange) {
      if (filters.sentimentRange.min !== undefined) {
        filterExpressions.push(`sentimentScore ge ${filters.sentimentRange.min}`);
      }
      
      if (filters.sentimentRange.max !== undefined) {
        filterExpressions.push(`sentimentScore le ${filters.sentimentRange.max}`);
      }
    }
    
    // Add tag filters if provided
    if (filters.tags && filters.tags.length > 0) {
      const tagFilters = filters.tags.map(tag => `tags/any(t: t eq '${tag}')`);
      filterExpressions.push(`(${tagFilters.join(' or ')})`);
    }
    
    // Combine all filters with AND
    const filterString = filterExpressions.join(' and ');
    
    // Execute search with facets and pagination
    const searchOptions = {
      filter: filterString,
      orderBy: ['date desc'],
      select: ['id', 'userId', 'content', 'date', 'sentimentScore', 'tags'],
      facets: ['tags', 'sentimentScore,interval:0.1'], // Add facets for tags and sentiment score buckets
      skip: offset,
      top: limit,
      includeTotalCount: true
    };
    
    // Perform the search
    const searchResults = await _searchClient.search(searchText, searchOptions);
    
    // Get the total count
    const count = searchResults.count || 0;
    
    // Get facets if available
    const facets: Record<string, Array<{ value: string; count: number }>> = {};
    if (searchResults.facets) {
      for (const [key, values] of Object.entries(searchResults.facets)) {
        facets[key] = [];
        for (const value of values) {
          facets[key].push({
            value: String(value.value),
            count: value.count || 0
          });
        }
      }
    }
    
    // Convert results to JournalEntry objects
    const entries: Partial<JournalEntry>[] = [];
    for await (const result of searchResults.results) {
      // The search results don't contain all fields of JournalEntry
      entries.push(result.document as Partial<JournalEntry>);
    }
    
    // Generate the next cursor (next offset encoded as base64)
    const nextCursor = offset + entries.length < count
      ? Buffer.from((offset + limit).toString(), 'utf-8').toString('base64')
      : undefined;
    
    return {
      results: entries,
      count,
      nextCursor, // Add next cursor for client use
      facets: Object.keys(facets).length > 0 ? facets : undefined
    };
  } catch (error) {
    console.error('Error searching journal entries:', error);
    throw new ApiError('Search failed', 500);
  }
} 