// backend/src/services/__tests__/journalService.test.ts
// Unit tests for journal service with mocked sentiment analysis

import { Container, Item } from '@azure/cosmos';
import { v4 as uuidv4 } from 'uuid';
import * as journalService from '../journalService';
import { JournalEntry, JournalEntryCreateDTO } from '../../models/JournalEntry';
import * as cosmosClient from '../cosmosClient';
import * as textAnalyticsService from '../textAnalyticsService';

// Mock dependencies
jest.mock('../cosmosClient');
jest.mock('../textAnalyticsService');
jest.mock('uuid');

describe('Journal Service', () => {
  // Mock data
  const mockUserId = 'user-123';
  const mockJournalId = 'journal-123';
  const mockDate = new Date('2023-01-01T12:00:00Z');

  // Create mock types with jest.Mock
  const mockCreate = jest.fn();
  const mockQuery = jest.fn();
  const mockUpsert = jest.fn();
  const mockItemFn = jest.fn();
  const mockDelete = jest.fn();
  const mockReplace = jest.fn();

  // Mock container with methods to create, query, replace, delete
  const mockContainer = {
    items: {
      create: mockCreate,
      query: mockQuery,
      upsert: mockUpsert,
    },
    item: mockItemFn,
  } as unknown as Container;

  // Mock item object
  const mockItemObject = {
    delete: mockDelete,
    replace: mockReplace,
  };

  // Sample journal entry
  const sampleJournal: JournalEntry = {
    id: mockJournalId,
    userId: mockUserId,
    content: 'Today was a great day!',
    date: mockDate,
    sentimentScore: 0.8,
    createdAt: mockDate,
    updatedAt: mockDate,
    tags: ['daily']
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock UUID generation
    (uuidv4 as jest.Mock).mockReturnValue(mockJournalId);
    
    // Mock Date
    jest.useFakeTimers().setSystemTime(mockDate);
    
    // Mock cosmos container
    (cosmosClient.getJournalsContainer as jest.Mock).mockReturnValue(mockContainer);
    
    // Mock item method to return object with methods
    mockItemFn.mockReturnValue(mockItemObject);
    mockDelete.mockResolvedValue({});
    mockReplace.mockResolvedValue({ resource: sampleJournal });

    // Mock sentiment analysis
    (textAnalyticsService.analyzeSentiment as jest.Mock).mockResolvedValue(0.8);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createJournalEntry', () => {
    it('should create a new journal entry with sentiment analysis', async () => {
      // Mock container create
      mockCreate.mockResolvedValue({ resource: sampleJournal });
      
      // Test data
      const journalData: JournalEntryCreateDTO = {
        userId: mockUserId,
        content: 'Today was a great day!',
        tags: ['daily']
      };
      
      // Execute
      const result = await journalService.createJournalEntry(journalData);
      
      // Assert
      expect(textAnalyticsService.analyzeSentiment).toHaveBeenCalledWith(journalData.content);
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        id: mockJournalId,
        userId: mockUserId,
        content: journalData.content,
        sentimentScore: 0.8,
        tags: ['daily']
      }));
      expect(result).toEqual(sampleJournal);
    });

    it('should handle errors when creating a journal entry', async () => {
      // Mock error
      mockCreate.mockRejectedValue(new Error('Database error'));
      
      // Test data
      const journalData: JournalEntryCreateDTO = {
        userId: mockUserId,
        content: 'Today was a great day!',
      };
      
      // Execute and assert
      await expect(journalService.createJournalEntry(journalData)).rejects.toThrow('Failed to create journal entry');
    });
  });

  describe('getJournalEntriesByUserId', () => {
    it('should get journal entries for a user', async () => {
      // Mock query response
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [sampleJournal] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // For count query
      mockQueryIterator.fetchAll.mockResolvedValueOnce({ resources: [1] });
      
      // Execute
      const result = await journalService.getJournalEntriesByUserId(mockUserId);
      
      // Assert
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        items: [sampleJournal],
        count: 1
      });
    });

    it('should filter entries by date range', async () => {
      // Mock query response
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [sampleJournal] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // For count query
      mockQueryIterator.fetchAll.mockResolvedValueOnce({ resources: [1] });
      
      // Filter options
      const startDate = new Date('2022-12-01');
      const endDate = new Date('2023-01-31');
      
      // Execute
      await journalService.getJournalEntriesByUserId(mockUserId, {
        startDate,
        endDate
      });
      
      // Assert
      expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({
        query: expect.stringContaining('c.date >= @startDate'),
        parameters: expect.arrayContaining([
          { name: '@startDate', value: startDate.toISOString() },
          { name: '@endDate', value: endDate.toISOString() }
        ])
      }));
    });
  });

  describe('getJournalEntryById', () => {
    it('should get a journal entry by ID', async () => {
      // Mock query response
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [sampleJournal] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // Execute
      const result = await journalService.getJournalEntryById(mockJournalId, mockUserId);
      
      // Assert
      expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({
        query: expect.stringContaining('c.id = @id'),
        parameters: expect.arrayContaining([
          { name: '@id', value: mockJournalId },
          { name: '@userId', value: mockUserId }
        ])
      }));
      expect(result).toEqual(sampleJournal);
    });

    it('should return null if journal entry not found', async () => {
      // Mock empty response
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // Execute
      const result = await journalService.getJournalEntryById(mockJournalId, mockUserId);
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateJournalEntry', () => {
    it('should update a journal entry', async () => {
      // Mock query response for getJournalEntryById
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [sampleJournal] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // Execute
      const result = await journalService.updateJournalEntry(mockJournalId, mockUserId, {
        content: 'Updated content'
      });
      
      // Assert
      expect(textAnalyticsService.analyzeSentiment).toHaveBeenCalledWith('Updated content');
      expect(mockItemFn).toHaveBeenCalledWith(mockJournalId, mockUserId);
      expect(result).toEqual(sampleJournal);
    });

    it('should return null if journal entry not found', async () => {
      // Mock empty response for getJournalEntryById
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // Execute
      const result = await journalService.updateJournalEntry(mockJournalId, mockUserId, {
        content: 'Updated content'
      });
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteJournalEntry', () => {
    it('should delete a journal entry', async () => {
      // Mock query response for getJournalEntryById
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [sampleJournal] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // Execute
      const result = await journalService.deleteJournalEntry(mockJournalId, mockUserId);
      
      // Assert
      expect(mockItemFn).toHaveBeenCalledWith(mockJournalId, mockUserId);
      expect(result).toBe(true);
    });

    it('should return false if journal entry not found', async () => {
      // Mock empty response for getJournalEntryById
      const mockQueryIterator = {
        fetchAll: jest.fn().mockResolvedValue({ resources: [] })
      };
      mockQuery.mockReturnValue(mockQueryIterator);
      
      // Execute
      const result = await journalService.deleteJournalEntry(mockJournalId, mockUserId);
      
      // Assert
      expect(result).toBe(false);
    });
  });
}); 