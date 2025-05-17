// frontend/src/services/journals/journalApi.ts
// API client for journal endpoints

import apiClient from '../apiService';
import { 
  JournalEntry, 
  JournalEntryCreateDTO,
  JournalEntryUpdateDTO,
  JournalEntryFilterOptions,
  SearchQuery,
  SearchResult,
  Attachment
} from '../../types/journal';
import { createJournalQueryParams, createJournalSearchParams } from '../../utils/journal';
import { ApiResponse } from '../../types/api';

// Base API URL for journals
const JOURNALS_API = '/journals';

/**
 * Interface for paginated journal entry response
 */
interface PaginatedJournalResponse {
  items: JournalEntry[];
  nextCursor?: string;
  hasMore: boolean;
  count: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// Journal insights interfaces
interface TopicAnalysis {
  topTopics: Array<{ topic: string, frequency: number }>;
  topicSentiment: Array<{ topic: string, sentiment: number }>;
}

interface SentimentTrend {
  trendByDay: Array<{ date: string, sentiment: number }>;
  trendByWeek: Array<{ weekStart: string, sentiment: number }>;
  trendByMonth: Array<{ month: string, sentiment: number }>;
}

interface MoodRecommendation {
  moodSummary: string;
  recommendations: string[];
  positivePatterns: string[];
  negativePatterns: string[];
}

/**
 * Get journal entries with filtering and pagination
 * @param filters Optional filters for journal entries
 * @param limit Maximum entries per page
 * @param cursor Optional cursor for pagination
 * @returns Paginated journal entries
 */
const getJournalEntries = async (
  filters?: JournalEntryFilterOptions,
  limit = 10,
  cursor?: string
): Promise<PaginatedJournalResponse> => {
  try {
    // Build query params
    const params: Record<string, string> = { limit: limit.toString() };
    
    if (cursor) {
      params.cursor = cursor;
    }
    
    // Add filter parameters if provided
    if (filters) {
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
      
      if (filters.sentimentRange) {
        if (filters.sentimentRange.min !== undefined) {
          params.minSentiment = filters.sentimentRange.min.toString();
        }
        
        if (filters.sentimentRange.max !== undefined) {
          params.maxSentiment = filters.sentimentRange.max.toString();
        }
      }
      
      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }
    }
    
    // Convert params object to URL query string
    const queryString = new URLSearchParams(params).toString();
    
    const response = await apiClient.get(`${JOURNALS_API}?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

/**
 * Get a specific journal entry by ID
 * @param id Journal entry ID
 * @returns Journal entry
 */
const getJournalEntry = async (id: string): Promise<JournalEntry> => {
  try {
    const response = await apiClient.get(`${JOURNALS_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching journal entry ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new journal entry
 * @param data Journal entry data
 * @returns Created journal entry
 */
const createJournalEntry = async (data: JournalEntryCreateDTO): Promise<JournalEntry> => {
  try {
    const response = await apiClient.post(JOURNALS_API, data);
    return response.data;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

/**
 * Update an existing journal entry
 * @param id Journal entry ID
 * @param data Updated journal entry data
 * @returns Updated journal entry
 */
const updateJournalEntry = async (id: string, data: JournalEntryUpdateDTO): Promise<JournalEntry> => {
  try {
    const response = await apiClient.put(`${JOURNALS_API}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating journal entry ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a journal entry
 * @param id Journal entry ID
 * @returns Success status
 */
const deleteJournalEntry = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${JOURNALS_API}/${id}`);
  } catch (error) {
    console.error(`Error deleting journal entry ${id}:`, error);
    throw error;
  }
};

/**
 * Get topic analysis for journal entries
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 * @returns Topic analysis data
 */
const getTopicAnalysis = async (startDate?: string, endDate?: string): Promise<TopicAnalysis> => {
  try {
    const params: Record<string, string> = {};
    
    if (startDate) {
      params.startDate = startDate;
    }
    
    if (endDate) {
      params.endDate = endDate;
    }
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${JOURNALS_API}/insights/topic-analysis${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching topic analysis:', error);
    throw error;
  }
};

/**
 * Get sentiment trends for journal entries
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 * @returns Sentiment trend data
 */
const getSentimentTrends = async (startDate?: string, endDate?: string): Promise<SentimentTrend> => {
  try {
    const params: Record<string, string> = {};
    
    if (startDate) {
      params.startDate = startDate;
    }
    
    if (endDate) {
      params.endDate = endDate;
    }
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${JOURNALS_API}/insights/sentiment-trends${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching sentiment trends:', error);
    throw error;
  }
};

/**
 * Get mood recommendations based on journal entries
 * @returns Mood recommendations data
 */
const getMoodRecommendations = async (): Promise<MoodRecommendation> => {
  try {
    const response = await apiClient.get(`${JOURNALS_API}/insights/mood-recommendations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mood recommendations:', error);
    throw error;
  }
};

/**
 * Search journal entries
 * @param query Search query
 * @param limit Maximum entries per page
 * @param cursor Optional cursor for pagination
 * @returns Paginated search results
 */
const searchJournalEntries = async (
  query: SearchQuery,
  limit = 10,
  cursor?: string
): Promise<PaginatedJournalResponse> => {
  try {
    // Build query params
    const params: Record<string, string> = { 
      q: query.q,
      limit: limit.toString()
    };
    
    if (cursor) {
      params.cursor = cursor;
    }
    
    // Add other search parameters
    if (query.startDate) {
      params.startDate = query.startDate;
    }
    
    if (query.endDate) {
      params.endDate = query.endDate;
    }
    
    if (query.minSentiment !== undefined) {
      params.minSentiment = query.minSentiment.toString();
    }
    
    if (query.maxSentiment !== undefined) {
      params.maxSentiment = query.maxSentiment.toString();
    }
    
    // Proper handling of tags parameter
    if (query.tags && Array.isArray(query.tags) && query.tags.length > 0) {
      params.tags = query.tags.join(',');
    } else if (query.tags && typeof query.tags === 'string') {
      params.tags = query.tags;
    }
    
    // Convert params object to URL query string
    const queryString = new URLSearchParams(params).toString();
    
    const response = await apiClient.get(`${JOURNALS_API}/search?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error searching journal entries:', error);
    throw error;
  }
};

/**
 * Upload an attachment to a journal entry
 * @param file The file to upload
 * @returns Attachment metadata
 */
const uploadAttachment = async (file: File): Promise<Attachment> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`${JOURNALS_API}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

// Export individual functions
export {
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
  uploadAttachment,
  getTopicAnalysis,
  getSentimentTrends,
  getMoodRecommendations
};

// Export as default object
const journalApi = {
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
  uploadAttachment,
  getTopicAnalysis,
  getSentimentTrends,
  getMoodRecommendations
};

export default journalApi; 