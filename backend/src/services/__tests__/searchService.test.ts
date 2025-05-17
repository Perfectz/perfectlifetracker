// backend/src/services/__tests__/searchService.test.ts
// Unit tests for search service

import { AzureKeyCredential } from '@azure/search-documents';
import { JournalEntry } from '../../models/JournalEntry';
import * as searchService from '../searchService';
import { FeatureFlags } from '../../utils/featureFlags';

// Mock dependencies
jest.mock('@azure/search-documents', () => {
  const mockSearchClient = {
    search: jest.fn().mockImplementation(() => ({
      results: [
        {
          document: {
            id: 'journal-123',
            userId: 'user-123',
            content: 'This is a test journal entry about happiness',
            date: new Date('2023-01-01'),
            sentimentScore: 0.8
          }
        }
      ]
    })),
    mergeOrUploadDocuments: jest.fn().mockResolvedValue({}),
    deleteDocuments: jest.fn().mockResolvedValue({})
  };

  const SearchClient = jest.fn().mockImplementation(() => mockSearchClient);
  
  return {
    SearchClient,
    SearchIndexClient: jest.fn().mockImplementation(() => ({
      getIndex: jest.fn().mockResolvedValue({}),
      createIndex: jest.fn().mockResolvedValue({})
    })),
    AzureKeyCredential: jest.fn()
  };
});

// Mock environment config
jest.mock('../../utils/featureFlags', () => ({
  FeatureFlags: {
    get ENABLE_SEARCH() { return true; }
  }
}));

// Mock configs
jest.mock('../../services/searchService', () => {
  const originalModule = jest.requireActual('../../services/searchService');
  return {
    ...originalModule,
    FEATURE_SEARCH: true,
    searchConfig: {
      endpoint: 'https://test-search.search.windows.net',
      apiKey: 'test-key',
      indexName: 'test-index'
    }
  };
}, { virtual: true });

describe('Search Service', () => {
  // Mock data
  const mockUserId = 'user-123';
  const mockJournalId = 'journal-123';
  const mockDate = new Date('2023-01-01');
  
  // Sample journal entry
  const sampleJournal: JournalEntry = {
    id: mockJournalId,
    userId: mockUserId,
    content: 'Today was a great day!',
    contentFormat: 'plain',
    date: mockDate,
    sentimentScore: 0.8,
    attachments: [],
    createdAt: mockDate,
    updatedAt: mockDate,
    tags: ['daily']
  };
  
  // Mock search client
  const mockSearchClient = require('@azure/search-documents').SearchClient();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Make sure search feature is enabled by default for tests
    searchService.setFeatureSearchEnabled(true);
    
    // Directly set the mock client using the setter
    searchService.setSearchClient(mockSearchClient);
  });
  
  afterEach(() => {
    // Reset client to null after each test
    searchService.setSearchClient(null);
    jest.restoreAllMocks();
  });
  
  describe('initializeSearchService', () => {
    it('should initialize the search service', async () => {
      await searchService.initializeSearchService();
      
      // Verify SearchIndexClient and SearchClient were constructed
      expect(AzureKeyCredential).toHaveBeenCalled();
    });
  });
  
  describe('indexJournalEntry', () => {
    it('should index a journal entry', async () => {
      // Then index a journal entry
      await searchService.indexJournalEntry(sampleJournal);
      
      // Verify mergeOrUploadDocuments was called with the document
      expect(mockSearchClient.mergeOrUploadDocuments).toHaveBeenCalledWith([
        expect.objectContaining({
          id: mockJournalId,
          userId: mockUserId,
          content: 'Today was a great day!',
          date: mockDate,
          sentimentScore: 0.8,
          tags: ['daily']
        })
      ]);
    });
    
    it('should not throw if search client is not initialized', async () => {
      // Set client to undefined for this test
      searchService.setSearchClient(null);
      
      // Should not throw when indexing
      await expect(searchService.indexJournalEntry(sampleJournal)).resolves.not.toThrow();
    });
  });
  
  describe('deleteJournalEntryFromIndex', () => {
    it('should delete a journal entry from the index', async () => {
      // Then delete a journal entry
      await searchService.deleteJournalEntryFromIndex(mockJournalId);
      
      // Verify deleteDocuments was called with the ID
      expect(mockSearchClient.deleteDocuments).toHaveBeenCalledWith([
        expect.objectContaining({ id: mockJournalId })
      ]);
    });
  });
  
  describe('searchJournalEntries', () => {
    it('should search for journal entries', async () => {
      // Then search for journal entries
      const results = await searchService.searchJournalEntries(
        mockUserId,
        'happiness',
        { 
          startDate: new Date('2022-01-01'),
          endDate: new Date('2023-12-31') 
        }
      );
      
      // Verify search was called with the right parameters
      expect(mockSearchClient.search).toHaveBeenCalledWith(
        'happiness',
        expect.objectContaining({
          filter: expect.stringContaining(`userId eq '${mockUserId}'`),
          orderBy: ['date desc']
        })
      );
      
      // Verify results were returned
      expect(results.results).toHaveLength(1);
      expect(results.results[0].id).toBe(mockJournalId);
    });
    
    it('should throw if search service is not available', async () => {
      // 1. First disable the search feature
      searchService.setFeatureSearchEnabled(false);
      
      // 2. Then ensure the client is null to trigger both error conditions
      searchService.setSearchClient(null);
      
      // 3. Now the search call should throw with the correct error
      await expect(searchService.searchJournalEntries(mockUserId, 'test'))
        .rejects.toThrow('Search service not available');
    });
  });
}); 