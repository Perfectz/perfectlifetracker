// frontend/src/utils/journal.ts
// Utility functions for journal entries

import { JournalEntryFilterOptions, SearchQuery } from '../types/journal';

/**
 * Maps sentiment score to an appropriate icon/emoji
 * @param score The sentiment score (-1 to 1)
 * @returns An emoji representing the sentiment
 */
export const getSentimentIcon = (score: number): string => {
  if (score >= 0.6) return '😁'; // Very positive
  if (score >= 0.3) return '😊'; // Positive
  if (score >= -0.3) return '😐'; // Neutral
  if (score >= -0.6) return '😔'; // Negative
  return '😢'; // Very negative
};

/**
 * Formats a date for display in the journal UI
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatJournalDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Creates URL search params for journal API calls
 * @param filters Optional filter criteria
 * @param limit Max number of items to return
 * @param offset Pagination offset
 * @returns URLSearchParams object with the query parameters
 */
export const createJournalQueryParams = (
  filters?: JournalEntryFilterOptions,
  limit?: number,
  offset?: number
): URLSearchParams => {
  const queryParams = new URLSearchParams();
  
  if (limit) queryParams.append('limit', limit.toString());
  if (offset) queryParams.append('offset', offset.toString());
  
  if (filters) {
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    if (filters.sentimentRange) {
      if (filters.sentimentRange.min !== undefined) {
        queryParams.append('minSentiment', filters.sentimentRange.min.toString());
      }
      if (filters.sentimentRange.max !== undefined) {
        queryParams.append('maxSentiment', filters.sentimentRange.max.toString());
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      queryParams.append('tags', filters.tags.join(','));
    }
  }
  
  return queryParams;
};

/**
 * Creates URL search params for journal search API calls
 * @param query Search query parameters
 * @returns URLSearchParams object with the search parameters
 */
export const createJournalSearchParams = (query: SearchQuery): URLSearchParams => {
  const queryParams = new URLSearchParams();
  
  queryParams.append('q', query.q);
  
  if (query.startDate) queryParams.append('startDate', query.startDate);
  if (query.endDate) queryParams.append('endDate', query.endDate);
  if (query.minSentiment !== undefined) queryParams.append('minSentiment', query.minSentiment.toString());
  if (query.maxSentiment !== undefined) queryParams.append('maxSentiment', query.maxSentiment.toString());
  
  // Handle tags properly - if it's an array join it, otherwise pass as is
  if (query.tags) {
    if (Array.isArray(query.tags)) {
      queryParams.append('tags', query.tags.join(','));
    } else if (typeof query.tags === 'string') {
      queryParams.append('tags', query.tags);
    }
  }
  
  if (query.limit) queryParams.append('limit', query.limit.toString());
  if (query.cursor) queryParams.append('cursor', query.cursor);
  
  return queryParams;
}; 