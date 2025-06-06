/**
 * backend/src/tests/unit/ai.test.ts
 * Comprehensive unit tests for AI Service functionality
 */
import { AIService } from '../../services/AIService';
import { cacheService } from '../../services/CacheService';
import { userService } from '../../services/UserService';
import { taskService } from '../../services/TaskService';
import { setupTests } from '../../setupTests';

// Mock external dependencies
jest.mock('../../services/CacheService');
jest.mock('../../services/UserService');
jest.mock('../../services/TaskService');
jest.mock('openai');

describe('AI Service Tests', () => {
  let aiService: AIService;
  
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    profilePicture: null
  };

  const mockTasks = [
    {
      id: 'task-1',
      userId: 'test-user-id',
      title: 'Complete project documentation',
      description: 'Write comprehensive docs',
      status: 'completed',
      priority: 'high',
      category: 'work',
      tags: ['documentation', 'project'],
      createdAt: new Date('2024-06-01'),
      completedAt: new Date('2024-06-02'),
      estimatedTime: 120,
      actualTime: 110
    },
    {
      id: 'task-2',
      userId: 'test-user-id',
      title: 'Morning workout',
      description: 'Cardio and strength training',
      status: 'completed',
      priority: 'medium',
      category: 'fitness',
      tags: ['exercise', 'health'],
      createdAt: new Date('2024-06-01'),
      completedAt: new Date('2024-06-01'),
      estimatedTime: 60,
      actualTime: 65
    },
    {
      id: 'task-3',
      userId: 'test-user-id',
      title: 'Team meeting preparation',
      description: 'Prepare slides and agenda',
      status: 'in-progress',
      priority: 'high',
      category: 'work',
      tags: ['meeting', 'presentation'],
      createdAt: new Date('2024-06-03'),
      dueDate: new Date('2024-06-05'),
      estimatedTime: 90
    }
  ];

  const mockAnalytics = {
    completionRate: 75,
    averageTaskTime: 85,
    mostProductiveHours: [9, 10, 14, 15],
    preferredCategories: ['work', 'fitness'],
    streakDays: 5,
    weeklyGrowth: 12
  };

  beforeAll(async () => {
    await setupTests();
  });

  beforeEach(() => {
    aiService = AIService.getInstance();
    jest.clearAllMocks();
    
    // Setup default mocks
    (cacheService.get as jest.Mock).mockReturnValue(null);
    (cacheService.set as jest.Mock).mockImplementation(() => {});
    (cacheService.generateKey as jest.Mock).mockReturnValue('test-cache-key');
    
    (userService.findById as jest.Mock).mockResolvedValue(mockUser);
    (taskService.getUserTasks as jest.Mock).mockResolvedValue({
      data: mockTasks,
      total: mockTasks.length,
      page: 1,
      limit: 20
    });
  });

  describe('Task Suggestions', () => {
    test('should generate task suggestions using fallback mode', async () => {
      const userId = 'test-user-id';
      const context = 'I want to improve my productivity at work';
      const category = 'work';

      const suggestions = await aiService.generateTaskSuggestions(
        userId,
        context,
        category,
        'today'
      );

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Verify suggestion structure
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('priority');
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('reasoning');
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
        
        if (category) {
          expect(suggestion.category).toBe(category);
        }
      });

      // Verify cache interaction
      expect(cacheService.get).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
    });

    test('should return cached suggestions when available', async () => {
      const cachedSuggestions = [
        {
          title: 'Cached Task',
          priority: 'medium',
          category: 'work',
          tags: ['cached'],
          confidence: 0.9,
          reasoning: 'From cache'
        }
      ];

      (cacheService.get as jest.Mock).mockReturnValue(cachedSuggestions);

      const suggestions = await aiService.generateTaskSuggestions(
        'test-user-id',
        'test context'
      );

      expect(suggestions).toEqual(cachedSuggestions);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    test('should handle different time frames', async () => {
      const timeFrames = ['today', 'week', 'month'] as const;

      for (const timeFrame of timeFrames) {
        const suggestions = await aiService.generateTaskSuggestions(
          'test-user-id',
          'productivity improvement',
          undefined,
          timeFrame
        );

        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
      }
    });

    test('should handle different categories', async () => {
      const categories = ['work', 'personal', 'fitness', 'learning', 'health'] as const;

      for (const category of categories) {
        const suggestions = await aiService.generateTaskSuggestions(
          'test-user-id',
          'general productivity',
          category
        );

        expect(suggestions).toBeDefined();
        suggestions.forEach(suggestion => {
          expect(suggestion.category).toBe(category);
        });
      }
    });

    test('should personalize suggestions based on user analytics', async () => {
      // Mock analytics with strong fitness preference
      const fitnessAnalytics = {
        ...mockAnalytics,
        preferredCategories: ['fitness', 'health'],
        mostProductiveHours: [6, 7, 18, 19]
      };

      // We need to test the personalization indirectly since getUserAnalytics is private
      const suggestions = await aiService.generateTaskSuggestions(
        'test-user-id',
        'improve my daily routine',
        'fitness'
      );

      expect(suggestions).toBeDefined();
      expect(suggestions.some(s => s.category === 'fitness')).toBe(true);
    });
  });

  describe('Productivity Insights', () => {
    test('should generate productivity insights', async () => {
      const insights = await aiService.generateProductivityInsights('test-user-id');

      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);

      // Verify insight structure
      insights.forEach(insight => {
        expect(insight).toHaveProperty('type');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('message');
        expect(insight).toHaveProperty('confidence');
        expect(insight).toHaveProperty('actionable');
        expect(insight).toHaveProperty('impact');
        
        expect(['pattern', 'efficiency', 'recommendation', 'achievement']).toContain(insight.type);
        expect(['low', 'medium', 'high']).toContain(insight.impact);
        expect(typeof insight.actionable).toBe('boolean');
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
      });
    });

    test('should return cached insights when available', async () => {
      const cachedInsights = [
        {
          type: 'pattern' as const,
          title: 'Cached Insight',
          message: 'From cache',
          confidence: 0.8,
          actionable: true,
          impact: 'medium' as const
        }
      ];

      (cacheService.get as jest.Mock).mockReturnValue(cachedInsights);

      const insights = await aiService.generateProductivityInsights('test-user-id');

      expect(insights).toEqual(cachedInsights);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    test('should analyze completion patterns', async () => {
      const insights = await aiService.generateProductivityInsights('test-user-id');

      // Should identify patterns from the mock tasks
      const patternInsights = insights.filter(i => i.type === 'pattern');
      expect(patternInsights.length).toBeGreaterThan(0);
    });

    test('should identify achievements', async () => {
      const insights = await aiService.generateProductivityInsights('test-user-id');

      // Should recognize achievements based on completion rate and streak
      const achievementInsights = insights.filter(i => i.type === 'achievement');
      expect(achievementInsights.length).toBeGreaterThan(0);
    });

    test('should handle users with no tasks', async () => {
      (taskService.getUserTasks as jest.Mock).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20
      });

      const insights = await aiService.generateProductivityInsights('test-user-id');

      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      // Should still provide some basic insights even with no tasks
    });
  });

  describe('AI Recommendations', () => {
    test('should generate personalized recommendations', async () => {
      const recommendations = await aiService.generateRecommendations('test-user-id');

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify recommendation structure
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('benefits');
        expect(rec).toHaveProperty('difficulty');
        expect(rec).toHaveProperty('timeToImplement');
        
        expect(['schedule', 'prioritization', 'breaks', 'goals']).toContain(rec.type);
        expect(['easy', 'medium', 'hard']).toContain(rec.difficulty);
        expect(Array.isArray(rec.benefits)).toBe(true);
        expect(typeof rec.timeToImplement).toBe('number');
        expect(rec.timeToImplement).toBeGreaterThan(0);
      });
    });

    test('should return cached recommendations when available', async () => {
      const cachedRecs = [
        {
          type: 'schedule' as const,
          title: 'Cached Recommendation',
          description: 'From cache',
          benefits: ['Benefit 1'],
          difficulty: 'easy' as const,
          timeToImplement: 15
        }
      ];

      (cacheService.get as jest.Mock).mockReturnValue(cachedRecs);

      const recommendations = await aiService.generateRecommendations('test-user-id');

      expect(recommendations).toEqual(cachedRecs);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    test('should base recommendations on user analytics', async () => {
      const recommendations = await aiService.generateRecommendations('test-user-id');

      // Should provide relevant recommendations based on mock analytics
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should include schedule recommendations for productive hours
      const scheduleRecs = recommendations.filter(r => r.type === 'schedule');
      expect(scheduleRecs.length).toBeGreaterThan(0);
    });
  });

  describe('User Analytics', () => {
    test('should calculate user analytics correctly', async () => {
      // We can't directly test getUserAnalytics as it's private,
      // but we can test it indirectly through other methods
      const insights = await aiService.generateProductivityInsights('test-user-id');
      
      expect(insights).toBeDefined();
      expect(userService.findById).toHaveBeenCalledWith('test-user-id');
      expect(taskService.getUserTasks).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle user not found error', async () => {
      (userService.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        aiService.generateProductivityInsights('nonexistent-user')
      ).rejects.toThrow('User not found');
    });

    test('should handle service errors gracefully', async () => {
      (taskService.getUserTasks as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        aiService.generateTaskSuggestions('test-user-id', 'test context')
      ).rejects.toThrow();
    });

    test('should handle cache service errors', async () => {
      (cacheService.get as jest.Mock).mockImplementation(() => {
        throw new Error('Cache unavailable');
      });

      // Should still work without cache
      const suggestions = await aiService.generateTaskSuggestions(
        'test-user-id',
        'test context'
      );

      expect(suggestions).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('should complete task suggestion generation quickly', async () => {
      const startTime = Date.now();
      
      await aiService.generateTaskSuggestions(
        'test-user-id',
        'quick test context'
      );
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should complete insights generation quickly', async () => {
      const startTime = Date.now();
      
      await aiService.generateProductivityInsights('test-user-id');
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });

    test('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        aiService.generateTaskSuggestions(
          `test-user-${i}`,
          `context for user ${i}`
        )
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Cache Integration', () => {
    test('should use appropriate cache TTL for different operations', async () => {
      // Test suggestions cache (30 minutes)
      await aiService.generateTaskSuggestions('test-user-id', 'test');
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        30 * 60 * 1000
      );

      jest.clearAllMocks();

      // Test insights cache (1 hour)
      await aiService.generateProductivityInsights('test-user-id');
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        60 * 60 * 1000
      );

      jest.clearAllMocks();

      // Test recommendations cache (2 hours)
      await aiService.generateRecommendations('test-user-id');
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        2 * 60 * 60 * 1000
      );
    });

    test('should generate proper cache keys', async () => {
      await aiService.generateTaskSuggestions(
        'test-user-id',
        'test context',
        'work',
        'today'
      );

      expect(cacheService.generateKey).toHaveBeenCalledWith(
        'ai-suggestions',
        expect.objectContaining({
          userId: 'test-user-id',
          context: expect.any(String),
          category: 'work',
          timeFrame: 'today'
        })
      );
    });
  });
}); 