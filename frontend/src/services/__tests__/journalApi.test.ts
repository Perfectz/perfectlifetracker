// frontend/src/services/__tests__/journalApi.test.ts
// Integration tests for journal API service

import axios from 'axios';
import journalApi from '../journals/journalApi';
import { JournalEntryCreateDTO, Attachment } from '../../types/journal';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('journalApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getJournalEntries', () => {
    it('fetches journal entries with default parameters', async () => {
      const mockResponse = { 
        data: {
          items: [{ id: '1', content: 'Test entry', date: new Date().toISOString() }],
          count: 1
        } 
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await journalApi.getJournalEntries();
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/^http.*\/api\/journals\?$/)
      );
      expect(result).toEqual(mockResponse.data);
    });
    
    it('applies filters, limit, and offset correctly', async () => {
      const mockResponse = { 
        data: {
          items: [{ id: '1', content: 'Test entry', date: new Date().toISOString() }],
          count: 1
        } 
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      await journalApi.getJournalEntries(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          sentimentRange: { min: 0.3, max: 0.8 },
          tags: ['tag1', 'tag2']
        },
        10,
        20
      );
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/^http.*\/api\/journals\?/)
      );
      
      const url = mockedAxios.get.mock.calls[0][0] as string;
      
      // Check URL contains expected parameters
      expect(url).toContain('limit=10');
      expect(url).toContain('offset=20');
      expect(url).toContain(`startDate=${encodeURIComponent(startDate.toISOString())}`);
      expect(url).toContain(`endDate=${encodeURIComponent(endDate.toISOString())}`);
      expect(url).toContain('minSentiment=0.3');
      expect(url).toContain('maxSentiment=0.8');
      expect(url).toContain('tags=tag1%2Ctag2');
    });
  });
  
  describe('searchJournalEntries', () => {
    it('searches journal entries with correct parameters', async () => {
      const mockResponse = { 
        data: {
          items: [{ id: '1', content: 'Test entry', date: new Date().toISOString() }],
          count: 1,
          facets: {
            tags: [{ value: 'tag1', count: 5 }]
          }
        } 
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await journalApi.searchJournalEntries({
        q: 'test query',
        startDate: '2023-01-01',
        minSentiment: 0.5,
        limit: 5,
        offset: 10
      });
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/^http.*\/api\/journals\/search\?/)
      );
      
      const url = mockedAxios.get.mock.calls[0][0] as string;
      
      // Check URL contains expected parameters
      expect(url).toContain('q=test%20query');
      expect(url).toContain('startDate=2023-01-01');
      expect(url).toContain('minSentiment=0.5');
      expect(url).toContain('limit=5');
      expect(url).toContain('offset=10');
      
      expect(result).toEqual(mockResponse.data);
      expect(result.facets).toBeDefined();
    });
  });
  
  describe('uploadAttachment', () => {
    it('uploads a file correctly', async () => {
      const mockAttachment: Attachment = {
        id: 'att-123',
        fileName: 'test.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/test.jpg'
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockAttachment });
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await journalApi.uploadAttachment(file);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringMatching(/^http.*\/api\/journals\/attachments$/),
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
      
      expect(result).toEqual(mockAttachment);
    });
  });
  
  describe('createJournalEntry', () => {
    it('creates a journal entry with markdown and attachments', async () => {
      const mockEntry = {
        id: 'journal-123',
        content: '# Test Heading',
        contentFormat: 'markdown',
        date: new Date().toISOString(),
        attachments: [{
          id: 'att-123',
          fileName: 'test.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/test.jpg'
        }]
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockEntry });
      
      const newEntry: JournalEntryCreateDTO = {
        content: '# Test Heading',
        contentFormat: 'markdown',
        attachments: [{
          id: 'att-123',
          fileName: 'test.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          url: 'https://example.com/test.jpg'
        }]
      };
      
      const result = await journalApi.createJournalEntry(newEntry);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringMatching(/^http.*\/api\/journals$/),
        newEntry
      );
      
      expect(result).toEqual(mockEntry);
    });
  });
  
  describe('updateJournalEntry', () => {
    it('updates a journal entry with new attachments', async () => {
      const mockUpdatedEntry = {
        id: 'journal-123',
        content: 'Updated content',
        attachments: [{
          id: 'att-456',
          fileName: 'new.jpg',
          contentType: 'image/jpeg',
          size: 2048,
          url: 'https://example.com/new.jpg'
        }]
      };
      
      mockedAxios.put.mockResolvedValueOnce({ data: mockUpdatedEntry });
      
      const updates = {
        content: 'Updated content',
        attachments: [{
          id: 'att-456',
          fileName: 'new.jpg',
          contentType: 'image/jpeg',
          size: 2048,
          url: 'https://example.com/new.jpg'
        }]
      };
      
      const result = await journalApi.updateJournalEntry('journal-123', updates);
      
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringMatching(/^http.*\/api\/journals\/journal-123$/),
        updates
      );
      
      expect(result).toEqual(mockUpdatedEntry);
    });
  });
  
  describe('deleteJournalEntry', () => {
    it('deletes a journal entry', async () => {
      mockedAxios.delete.mockResolvedValueOnce({});
      
      await journalApi.deleteJournalEntry('journal-123');
      
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringMatching(/^http.*\/api\/journals\/journal-123$/)
      );
    });
  });
}); 