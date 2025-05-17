// backend/src/models/JournalEntry.ts
// Define the JournalEntry interface for tracking user journal entries with sentiment analysis

/**
 * JournalEntry interface representing a user's journal entry with sentiment analysis
 */
export interface JournalEntry {
  id: string;               // Unique identifier for the journal entry
  userId: string;           // ID of user who owns this entry (partition key)
  content: string;          // Content of the journal entry
  contentFormat: 'plain' | 'markdown'; // Format of the content
  date: Date;               // Date when the entry was created/recorded
  mood?: string;            // The user's mood when writing the entry
  sentimentScore: number;   // Sentiment score from 0 (negative) to 1 (positive)
  attachments: Attachment[]; // File attachments for the journal entry
  createdAt: Date;          // When the journal entry was created
  updatedAt: Date;          // When the journal entry was last updated
  tags?: string[];          // Optional tags for categorizing entries
}

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
 * JournalEntryCreateDTO - Data Transfer Object for creating a new journal entry
 * Omits system-generated fields like id, sentiment, and timestamps
 */
export interface JournalEntryCreateDTO {
  userId: string;           // ID of user who owns this entry
  content: string;          // Content of the journal entry
  contentFormat?: 'plain' | 'markdown'; // Format of the content (defaults to 'plain')
  date?: Date;              // Optional date - defaults to current date if not provided
  attachments?: Attachment[]; // Optional file attachments
  tags?: string[];          // Optional tags for categorizing entries
  mood?: string;            // Optional mood description
}

/**
 * JournalEntryUpdateDTO - Data Transfer Object for updating an existing journal entry
 * Makes all fields optional except those needed for identification
 */
export interface JournalEntryUpdateDTO {
  content?: string;         // Updated content
  contentFormat?: 'plain' | 'markdown'; // Updated content format
  date?: Date;              // Updated date
  attachments?: Attachment[]; // Updated attachments
  tags?: string[];          // Updated tags
  mood?: string;            // Updated mood description
}

/**
 * JournalEntryFilterOptions - Options for filtering journal entries
 */
export interface JournalEntryFilterOptions {
  startDate?: Date;         // Start date for filtering entries
  endDate?: Date;           // End date for filtering entries
  sentimentRange?: {        // Filter by sentiment score range
    min?: number;
    max?: number;
  };
  tags?: string[];          // Filter by specific tags
}

/**
 * Cursor for paginating journal entries
 * Contains information needed to fetch the next page of results
 */
export interface JournalCursor {
  lastId?: string;          // ID of the last item in the previous page
  lastDate?: string;        // Date of the last item for ordering
  limit: number;            // Number of items to return per page
}

/**
 * PaginatedResult - Generic interface for results that include pagination information
 */
export interface PaginatedResult<T> {
  items: T[];               // Array of items
  count?: number;           // Total count of items (for offset pagination)
  nextCursor?: string;      // Encoded cursor for the next page, null if no more pages
  hasMore?: boolean;        // Whether there are more items to fetch
} 