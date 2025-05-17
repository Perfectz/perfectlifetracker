// frontend/src/types/journal.ts
// Type definitions for journal entries

/**
 * Attachment interface for files attached to journal entries
 */
export interface Attachment {
  id: string;               // Unique identifier for the attachment
  fileName: string;         // Original file name
  contentType: string;      // MIME type of the file
  size: number;             // Size of the file in bytes
  url: string;              // URL to access the file
}

/**
 * JournalEntry interface representing a user's journal entry with sentiment analysis
 */
export interface JournalEntry {
  id: string;               // Unique identifier for the journal entry
  userId: string;           // ID of user who owns this entry
  content: string;          // Content of the journal entry
  contentFormat: 'plain' | 'markdown'; // Format of the content
  date: string;             // Date when the entry was created/recorded (ISO string)
  mood?: string;            // The user's mood when writing the entry
  sentimentScore: number;   // Sentiment score from 0 (negative) to 1 (positive)
  attachments: Attachment[]; // File attachments for the journal entry
  createdAt: string;        // When the journal entry was created (ISO string)
  updatedAt: string;        // When the journal entry was last updated (ISO string)
  tags?: string[];          // Optional tags for categorizing entries
}

/**
 * JournalEntryCreateDTO - Data Transfer Object for creating a new journal entry
 */
export interface JournalEntryCreateDTO {
  content: string;          // Content of the journal entry
  contentFormat?: 'plain' | 'markdown'; // Format of the content (defaults to 'plain')
  date?: string;            // Optional date - defaults to current date if not provided
  attachments?: Attachment[]; // Optional file attachments
  tags?: string[];          // Optional tags for categorizing entries
  mood?: string;            // Optional mood description
}

/**
 * JournalEntryUpdateDTO - Data Transfer Object for updating an existing journal entry
 */
export interface JournalEntryUpdateDTO {
  content?: string;         // Updated content
  contentFormat?: 'plain' | 'markdown'; // Updated content format
  date?: string;            // Updated date
  attachments?: Attachment[]; // Updated attachments
  tags?: string[];          // Updated tags
  mood?: string;            // Updated mood description
}

/**
 * JournalEntryFilterOptions - Options for filtering journal entries
 */
export interface JournalEntryFilterOptions {
  startDate?: string;       // Start date for filtering entries
  endDate?: string;         // End date for filtering entries
  sentimentRange?: {        // Filter by sentiment score range
    min?: number;
    max?: number;
  };
  tags?: string[];          // Filter by specific tags
}

/**
 * PaginatedResponse interface for cursor-based pagination
 */
export interface PaginatedResponse<T> {
  items: T[];               // Array of items
  nextCursor?: string;      // Encoded cursor for the next page, undefined if no more pages
  hasMore: boolean;         // Whether there are more items to fetch
  count: number;            // Total count of items (for pagination)
  facets?: Record<string, Array<{ value: string; count: number }>>;  // Optional facets for filtering
}

/**
 * PaginatedJournalResponse interface for paginated journal entries
 */
export interface PaginatedJournalResponse extends PaginatedResponse<JournalEntry> {}

/**
 * SearchResult interface for the response from search API
 */
export interface SearchResult {
  items: JournalEntry[];    // Journal entries matching the search
  count: number;            // Total count of matching entries
  facets?: Record<string, Array<{ value: string; count: number }>>;  // Facets for filtering
}

/**
 * SearchQuery interface for search parameters
 */
export interface SearchQuery {
  q: string;                // Search query text
  startDate?: string;       // Start date filter
  endDate?: string;         // End date filter
  minSentiment?: number;    // Minimum sentiment score
  maxSentiment?: number;    // Maximum sentiment score
  tags?: string[];          // Tags filter
  limit?: number;           // Maximum number of results
  cursor?: string;          // Pagination cursor
} 