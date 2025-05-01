// backend/src/services/__tests__/analyticsService.test.ts
// Tests for the analytics service

import { calculateFitnessAnalytics, calculateWeeklyTrends } from '../analyticsService';
import * as activityService from '../activityService';

// Mock the activity service
jest.mock('../activityService');

describe('Analytics Service', () => {
  // Setup common test data
  const userId = 'test-user-id';
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');
  
  const mockActivities = [
    {
      id: 'activity-1',
      userId,
      type: 'Running',
      duration: 30,
      calories: 300,
      date: new Date('2025-01-10'),
      notes: 'Morning run'
    },
    {
      id: 'activity-2',
      userId,
      type: 'Cycling',
      duration: 45,
      calories: 400,
      date: new Date('2025-01-15'),
      notes: 'Evening ride'
    },
    {
      id: 'activity-3',
      userId,
      type: 'Running',
      duration: 25,
      calories: 250,
      date: new Date('2025-01-20'),
      notes: 'Quick run'
    }
  ];
  
  beforeEach(() => {
    jest.resetAllMocks();
    // Mock the activity service response
    (activityService.getActivitiesByUserId as jest.Mock).mockResolvedValue({
      items: mockActivities,
      total: mockActivities.length
    });
  });
  
  describe('calculateFitnessAnalytics', () => {
    it('should calculate correct metrics from activities', async () => {
      const analytics = await calculateFitnessAnalytics(userId, startDate, endDate);
      
      // Check basic metrics
      expect(analytics.totalDuration).toBe(100); // 30 + 45 + 25
      expect(analytics.totalCalories).toBe(950); // 300 + 400 + 250
      expect(analytics.activeDays).toBe(3); // 3 unique days
      expect(analytics.activitiesCount).toBe(3);
      
      // Check averages
      expect(analytics.averageDurationPerDay).toBe(100 / 3);
      expect(analytics.averageCaloriesPerDay).toBe(950 / 3);
      
      // Check activity breakdown
      expect(analytics.activityCountByType).toEqual({
        'Running': 2,
        'Cycling': 1
      });
      
      expect(analytics.caloriesByType).toEqual({
        'Running': 550, // 300 + 250
        'Cycling': 400
      });
      
      expect(analytics.durationByType).toEqual({
        'Running': 55, // 30 + 25
        'Cycling': 45
      });
    });
    
    it('should return empty analytics when no activities exist', async () => {
      (activityService.getActivitiesByUserId as jest.Mock).mockResolvedValue({
        items: [],
        total: 0
      });
      
      const analytics = await calculateFitnessAnalytics(userId, startDate, endDate);
      
      // All numeric values should be 0
      expect(analytics.totalDuration).toBe(0);
      expect(analytics.totalCalories).toBe(0);
      expect(analytics.activeDays).toBe(0);
      expect(analytics.activitiesCount).toBe(0);
      expect(analytics.averageDurationPerDay).toBe(0);
      expect(analytics.averageCaloriesPerDay).toBe(0);
      
      // Objects should be empty
      expect(analytics.activityCountByType).toEqual({});
      expect(analytics.caloriesByType).toEqual({});
      expect(analytics.durationByType).toEqual({});
    });
  });
  
  describe('calculateWeeklyTrends', () => {
    it('should correctly compare current and previous week', async () => {
      // Mock different responses for different date ranges
      (activityService.getActivitiesByUserId as jest.Mock).mockImplementation((userId, filters) => {
        // Current week activities (more activities, higher values)
        if (filters.startDate.getTime() > new Date().getTime() - 8 * 24 * 60 * 60 * 1000) {
          return {
            items: [
              {
                id: 'current-1',
                userId,
                type: 'Running',
                duration: 40,
                calories: 350,
                date: new Date()
              },
              {
                id: 'current-2',
                userId,
                type: 'Cycling',
                duration: 50,
                calories: 450,
                date: new Date()
              }
            ],
            total: 2
          };
        } 
        // Previous week activities (fewer activities, lower values)
        else {
          return {
            items: [
              {
                id: 'previous-1',
                userId,
                type: 'Running',
                duration: 20,
                calories: 200,
                date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000)
              }
            ],
            total: 1
          };
        }
      });
      
      const trends = await calculateWeeklyTrends(userId);
      
      // Check that current week metrics are correct
      expect(trends.current.totalDuration).toBe(90); // 40 + 50
      expect(trends.current.totalCalories).toBe(800); // 350 + 450
      expect(trends.current.activitiesCount).toBe(2);
      
      // Check that previous week metrics are correct
      expect(trends.previous.totalDuration).toBe(20);
      expect(trends.previous.totalCalories).toBe(200);
      expect(trends.previous.activitiesCount).toBe(1);
      
      // Check percentage changes
      expect(trends.changes.durationChange).toBe(350); // (90 - 20) / 20 * 100
      expect(trends.changes.caloriesChange).toBe(300); // (800 - 200) / 200 * 100
      expect(trends.changes.activityCountChange).toBe(100); // (2 - 1) / 1 * 100
    });
  });
}); 