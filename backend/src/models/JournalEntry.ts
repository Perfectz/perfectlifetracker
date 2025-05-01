// backend/src/models/JournalEntry.ts
// Define the JournalEntry interface for tracking user journal entries with sentiment analysis

/**
 * JournalEntry interface representing a user's journal entry with sentiment analysis
 */
export interface JournalEntry {
  id: string;               // Unique identifier for the journal entry
  userId: string;           // ID of user who owns this entry (partition key)
  content: string;          // Content of the journal entry
  date: Date;               // Date when the entry was created/recorded
  sentimentScore: number;   // Sentiment score from 0 (negative) to 1 (positive)
  createdAt: Date;          // When the journal entry was created
  updatedAt: Date;          // When the journal entry was last updated
  tags?: string[];          // Optional tags for categorizing entries
}

/**
 * JournalEntryCreateDTO - Data Transfer Object for creating a new journal entry
 * Omits system-generated fields like id, sentiment, and timestamps
 */
export interface JournalEntryCreateDTO {
  userId: string;           // ID of user who owns this entry
  content: string;          // Content of the journal entry
  date?: Date;              // Optional date - defaults to current date if not provided
  tags?: string[];          // Optional tags for categorizing entries
}

/**
 * JournalEntryUpdateDTO - Data Transfer Object for updating an existing journal entry
 * Makes all fields optional except those needed for identification
 */
export interface JournalEntryUpdateDTO {
  content?: string;         // Updated content
  date?: Date;              // Updated date
  tags?: string[];          // Updated tags
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