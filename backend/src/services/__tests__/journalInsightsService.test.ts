// backend/src/services/__tests__/journalInsightsService.test.ts
// Unit tests for journal insights service

import { Container } from '@azure/cosmos';
import * as journalInsightsService from '../journalInsightsService';
import * as cosmosClient from '../cosmosClient';
import * as textAnalyticsService from '../textAnalyticsService';

// Mock dependencies
jest.mock('../cosmosClient');
jest.mock('../textAnalyticsService');

describe('Journal Insights Service', () => {
  // Mock data
  const mockUserId = 'user-123';
  const mockStartDate = new Date('2023-01-01');
  const mockEndDate = new Date('2023-01-31');
  
  // Mock journal entries for testing
  const mockJournalEntries = [
    {
      id: 'journal-1',
      userId: mockUserId,
      content: 'Today I felt really happy and productive.',
      contentFormat: 'plain',
      date: new Date('2023-01-05'),
      sentimentScore: 0.8,
      tags: ['work', 'productivity'],
      createdAt: new Date('2023-01-05'),
      updatedAt: new Date('2023-01-05')
    },
    {
      id: 'journal-2',
      userId: mockUserId,
      content: 'I am feeling sad today due to bad weather.',
      contentFormat: 'plain',
      date: new Date('2023-01-10'),
      sentimentScore: 0.3,
      tags: ['weather', 'mood'],
      createdAt: new Date('2023-01-10'),
      updatedAt: new Date('2023-01-10')
    },
    {
      id: 'journal-3',
      userId: mockUserId,
      content: 'Work was stressful but I managed to get through it.',
      contentFormat: 'plain',
      date: new Date('2023-01-15'),
      sentimentScore: 0.5,
      tags: ['work', 'stress'],
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    {
      id: 'journal-4',
      userId: mockUserId,
      content: 'I enjoyed a peaceful weekend with family.',
      contentFormat: 'plain',
      date: new Date('2023-01-20'),
      sentimentScore: 0.9,
      tags: ['family', 'weekend'],
      createdAt: new Date('2023-01-20'),
      updatedAt: new Date('2023-01-20')
    }
  ];
  
  // Mock query function
  const mockQueryFunction = jest.fn();
  const mockQueryIterator = {
    fetchAll: jest.fn().mockResolvedValue({ resources: mockJournalEntries })
  };
  
  // Mock container
  const mockContainer = {
    items: {
      query: mockQueryFunction,
    }
  } as unknown as Container;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock cosmosClient to return container
    (cosmosClient.getJournalsContainer as jest.Mock).mockReturnValue(mockContainer);
    
    // Mock query to return iterator
    mockQueryFunction.mockReturnValue(mockQueryIterator);
    
    // Mock text analytics
    (textAnalyticsService.extractKeyPhrases as jest.Mock).mockImplementation((text) => {
      // Simple mock implementation to extract nouns
      const words = text.split(' ');
      return Promise.resolve(words.filter((word: string) => word.length > 4).slice(0, 3));
    });
    
    // Set feature flag for testing
    Object.defineProperty(journalInsightsService, 'FEATURE_ADVANCED_INSIGHTS', { 
      value: true,
      configurable: true 
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('getSentimentTrends', () => {
    it('should get sentiment trends over time', async () => {
      // Execute
      const result = await journalInsightsService.getSentimentTrends(
        mockUserId,
        mockStartDate,
        mockEndDate
      );
      
      // Assert
      expect(mockQueryFunction).toHaveBeenCalledWith(expect.objectContaining({
        query: expect.stringContaining('c.userId = @userId'),
        parameters: expect.arrayContaining([
          { name: '@userId', value: mockUserId },
          { name: '@startDate', value: mockStartDate.toISOString() },
          { name: '@endDate', value: mockEndDate.toISOString() }
        ])
      }));
      
      // Check result structure
      expect(result).toHaveProperty('averageSentiment');
      expect(result).toHaveProperty('trendByDay');
      expect(result).toHaveProperty('topEmotions');
      
      // Check average calculation
      const expectedAvg = (0.8 + 0.3 + 0.5 + 0.9) / 4;
      expect(result.averageSentiment).toBeCloseTo(expectedAvg);
      
      // Should have emotions
      expect(result.topEmotions.length).toBeGreaterThan(0);
    });
    
    it('should return empty results when no entries are found', async () => {
      // Mock empty results
      mockQueryIterator.fetchAll.mockResolvedValueOnce({ resources: [] });
      
      // Execute
      const result = await journalInsightsService.getSentimentTrends(
        mockUserId,
        mockStartDate,
        mockEndDate
      );
      
      // Assert
      expect(result).toEqual({
        averageSentiment: 0,
        trendByDay: [],
        topEmotions: []
      });
    });
    
    it('should throw when feature is disabled', async () => {
      // Disable feature flag
      Object.defineProperty(journalInsightsService, 'FEATURE_ADVANCED_INSIGHTS', { 
        value: false,
        configurable: true 
      });
      
      // Execute and assert
      await expect(journalInsightsService.getSentimentTrends(
        mockUserId,
        mockStartDate,
        mockEndDate
      )).rejects.toThrow('Advanced insights not available');
    });
  });
  
  describe('getTopicAnalysis', () => {
    it('should analyze topics from journal entries', async () => {
      // Execute
      const result = await journalInsightsService.getTopicAnalysis(
        mockUserId,
        mockStartDate,
        mockEndDate
      );
      
      // Assert
      expect(mockQueryFunction).toHaveBeenCalledWith(expect.objectContaining({
        query: expect.stringContaining('c.userId = @userId'),
        parameters: expect.arrayContaining([
          { name: '@userId', value: mockUserId },
          { name: '@startDate', value: mockStartDate.toISOString() },
          { name: '@endDate', value: mockEndDate.toISOString() }
        ])
      }));
      
      // Check result structure
      expect(result).toHaveProperty('topTopics');
      expect(result).toHaveProperty('topicSentiment');
      
      // Should have topics
      expect(result.topTopics.length).toBeGreaterThan(0);
      
      // Should have sentiments by topic
      expect(result.topicSentiment.length).toBeGreaterThan(0);
    });
    
    it('should return empty results when no entries are found', async () => {
      // Mock empty results
      mockQueryIterator.fetchAll.mockResolvedValueOnce({ resources: [] });
      
      // Execute
      const result = await journalInsightsService.getTopicAnalysis(
        mockUserId,
        mockStartDate,
        mockEndDate
      );
      
      // Assert
      expect(result).toEqual({
        topTopics: [],
        topicSentiment: []
      });
    });
  });
  
  describe('getMoodInsightsAndRecommendations', () => {
    it('should generate mood insights and recommendations', async () => {
      // Execute
      const result = await journalInsightsService.getMoodInsightsAndRecommendations(
        mockUserId,
        10
      );
      
      // Assert
      expect(mockQueryFunction).toHaveBeenCalledWith(expect.objectContaining({
        query: expect.stringContaining('c.userId = @userId'),
        parameters: expect.arrayContaining([
          { name: '@userId', value: mockUserId },
          { name: '@limit', value: 10 }
        ])
      }));
      
      // Check result structure
      expect(result).toHaveProperty('moodSummary');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('positivePatterns');
      expect(result).toHaveProperty('improvementAreas');
      
      // Should have recommendations
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should include a mood summary
      expect(typeof result.moodSummary).toBe('string');
    });
    
    it('should return default message when no entries are found', async () => {
      // Mock empty results
      mockQueryIterator.fetchAll.mockResolvedValueOnce({ resources: [] });
      
      // Execute
      const result = await journalInsightsService.getMoodInsightsAndRecommendations(
        mockUserId,
        10
      );
      
      // Assert
      expect(result).toEqual({
        moodSummary: "Not enough data to generate insights.",
        recommendations: ["Start journaling regularly to receive personalized insights."],
        positivePatterns: [],
        improvementAreas: []
      });
    });
  });
}); 