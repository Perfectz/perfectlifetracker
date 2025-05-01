// backend/src/routes/__tests__/journals.router.test.ts
// Unit tests for journal router endpoints

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import journalsRouter from '../journals.router';
import * as journalService from '../../services/journalService';

// Mock dependencies
jest.mock('../../services/journalService');

describe('Journal Router', () => {
  let app: express.Express;
  
  // Sample data
  const userId = 'user-123';
  const journalId = 'journal-123';
  const mockDate = new Date('2023-01-01');
  
  // Sample journal entry
  const sampleJournal = {
    id: journalId,
    userId,
    content: 'Today was a great day!',
    date: mockDate,
    sentimentScore: 0.8,
    createdAt: mockDate,
    updatedAt: mockDate,
    tags: ['daily']
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up express app for testing
    app = express();
    app.use(express.json());
    
    // Mock extractUserId middleware
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as any).userId = userId;
      next();
    });
    
    // Add journals router
    app.use('/api/journals', journalsRouter);
  });
  
  describe('POST /api/journals', () => {
    it('should create a new journal entry', async () => {
      // Mock service
      (journalService.createJournalEntry as jest.Mock).mockResolvedValue(sampleJournal);
      
      // Test request
      const response = await request(app)
        .post('/api/journals')
        .send({
          content: 'Today was a great day!',
          tags: ['daily']
        });
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(sampleJournal);
      expect(journalService.createJournalEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          content: 'Today was a great day!',
          tags: ['daily']
        })
      );
    });
    
    it('should return 400 if content is missing', async () => {
      // Test request with missing content
      const response = await request(app)
        .post('/api/journals')
        .send({
          tags: ['daily']
        });
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'ValidationError');
    });
  });
  
  describe('GET /api/journals', () => {
    it('should return journal entries for a user', async () => {
      // Mock service
      (journalService.getJournalEntriesByUserId as jest.Mock).mockResolvedValue({
        items: [sampleJournal],
        count: 1
      });
      
      // Test request
      const response = await request(app)
        .get('/api/journals');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: [sampleJournal],
        count: 1
      });
      expect(journalService.getJournalEntriesByUserId).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
        50,
        0
      );
    });
    
    it('should apply filters and pagination', async () => {
      // Mock service
      (journalService.getJournalEntriesByUserId as jest.Mock).mockResolvedValue({
        items: [sampleJournal],
        count: 1
      });
      
      // Test request with filters
      const response = await request(app)
        .get('/api/journals')
        .query({
          startDate: '2023-01-01',
          endDate: '2023-01-31',
          minSentiment: '0.5',
          maxSentiment: '1.0',
          tags: 'daily,important',
          limit: '20',
          offset: '10'
        });
      
      // Assert
      expect(response.status).toBe(200);
      expect(journalService.getJournalEntriesByUserId).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          sentimentRange: {
            min: 0.5,
            max: 1.0
          },
          tags: ['daily', 'important']
        }),
        20,
        10
      );
    });
  });
  
  describe('GET /api/journals/:id', () => {
    it('should return a journal entry by ID', async () => {
      // Mock service
      (journalService.getJournalEntryById as jest.Mock).mockResolvedValue(sampleJournal);
      
      // Test request
      const response = await request(app)
        .get(`/api/journals/${journalId}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(sampleJournal);
      expect(journalService.getJournalEntryById).toHaveBeenCalledWith(journalId, userId);
    });
    
    it('should return 404 if journal entry is not found', async () => {
      // Mock service
      (journalService.getJournalEntryById as jest.Mock).mockResolvedValue(null);
      
      // Test request
      const response = await request(app)
        .get(`/api/journals/${journalId}`);
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('PUT /api/journals/:id', () => {
    it('should update a journal entry', async () => {
      // Mock service
      (journalService.updateJournalEntry as jest.Mock).mockResolvedValue({
        ...sampleJournal,
        content: 'Updated content'
      });
      
      // Test request
      const response = await request(app)
        .put(`/api/journals/${journalId}`)
        .send({
          content: 'Updated content'
        });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated content');
      expect(journalService.updateJournalEntry).toHaveBeenCalledWith(
        journalId,
        userId,
        expect.objectContaining({
          content: 'Updated content'
        })
      );
    });
    
    it('should return 404 if journal entry is not found', async () => {
      // Mock service
      (journalService.updateJournalEntry as jest.Mock).mockResolvedValue(null);
      
      // Test request
      const response = await request(app)
        .put(`/api/journals/${journalId}`)
        .send({
          content: 'Updated content'
        });
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('DELETE /api/journals/:id', () => {
    it('should delete a journal entry', async () => {
      // Mock service
      (journalService.deleteJournalEntry as jest.Mock).mockResolvedValue(true);
      
      // Test request
      const response = await request(app)
        .delete(`/api/journals/${journalId}`);
      
      // Assert
      expect(response.status).toBe(204);
      expect(journalService.deleteJournalEntry).toHaveBeenCalledWith(journalId, userId);
    });
    
    it('should return 404 if journal entry is not found', async () => {
      // Mock service
      (journalService.deleteJournalEntry as jest.Mock).mockResolvedValue(false);
      
      // Test request
      const response = await request(app)
        .delete(`/api/journals/${journalId}`);
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 