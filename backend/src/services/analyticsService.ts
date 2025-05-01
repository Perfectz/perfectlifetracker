// backend/src/services/analyticsService.ts
// Service for calculating fitness analytics and metrics

import { getActivitiesByUserId, ActivityFilterOptions } from './activityService';
import { Activity } from '../models/Activity';

/**
 * Fitness analytics summary interface
 */
export interface FitnessAnalytics {
  totalDuration: number;
  totalCalories: number;
  averageDurationPerDay: number;
  averageCaloriesPerDay: number;
  activityCountByType: Record<string, number>;
  caloriesByType: Record<string, number>;
  durationByType: Record<string, number>;
  activeDays: number;
  activitiesCount: number;
}

/**
 * Calculate fitness analytics for a user within a date range
 * @param userId User ID
 * @param startDate Start date for analysis period
 * @param endDate End date for analysis period
 * @returns Fitness analytics summary
 */
export async function calculateFitnessAnalytics(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<FitnessAnalytics> {
  // Get all activities for the given date range
  const filters: ActivityFilterOptions = {
    startDate,
    endDate
  };
  
  // Get all activities - no limit since we need all of them for accurate calculations
  const result = await getActivitiesByUserId(userId, filters, 1000, 0);
  const activities = result.items;
  
  // Calculate basic metrics
  const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
  const totalCalories = activities.reduce((sum, activity) => sum + activity.calories, 0);
  
  // Calculate unique active days
  const uniqueDays = new Set(
    activities.map(activity => {
      const date = new Date(activity.date);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    })
  );
  const activeDays = uniqueDays.size;
  
  // Calculate averages
  const averageDurationPerDay = activeDays > 0 ? totalDuration / activeDays : 0;
  const averageCaloriesPerDay = activeDays > 0 ? totalCalories / activeDays : 0;
  
  // Group activities by type
  const activityCountByType: Record<string, number> = {};
  const caloriesByType: Record<string, number> = {};
  const durationByType: Record<string, number> = {};
  
  activities.forEach(activity => {
    const type = activity.type;
    
    // Count by type
    if (!activityCountByType[type]) {
      activityCountByType[type] = 0;
    }
    activityCountByType[type]++;
    
    // Sum calories by type
    if (!caloriesByType[type]) {
      caloriesByType[type] = 0;
    }
    caloriesByType[type] += activity.calories;
    
    // Sum duration by type
    if (!durationByType[type]) {
      durationByType[type] = 0;
    }
    durationByType[type] += activity.duration;
  });
  
  return {
    totalDuration,
    totalCalories,
    averageDurationPerDay,
    averageCaloriesPerDay,
    activityCountByType,
    caloriesByType,
    durationByType,
    activeDays,
    activitiesCount: activities.length
  };
}

/**
 * Calculate weekly trend comparisons (current week vs previous week)
 * @param userId User ID
 * @returns Weekly comparison data
 */
export async function calculateWeeklyTrends(userId: string): Promise<{
  current: FitnessAnalytics;
  previous: FitnessAnalytics;
  changes: {
    durationChange: number;
    caloriesChange: number;
    activityCountChange: number;
  };
}> {
  // Calculate current week date range (last 7 days)
  const today = new Date();
  const currentWeekEnd = new Date(today);
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - 7);
  
  // Calculate previous week date range (7-14 days ago)
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
  const previousWeekStart = new Date(previousWeekEnd);
  previousWeekStart.setDate(previousWeekEnd.getDate() - 6);
  
  // Get analytics for both periods
  const [currentWeekAnalytics, previousWeekAnalytics] = await Promise.all([
    calculateFitnessAnalytics(userId, currentWeekStart, currentWeekEnd),
    calculateFitnessAnalytics(userId, previousWeekStart, previousWeekEnd)
  ]);
  
  // Calculate percentage changes
  const durationChange = calculatePercentageChange(
    previousWeekAnalytics.totalDuration,
    currentWeekAnalytics.totalDuration
  );
  
  const caloriesChange = calculatePercentageChange(
    previousWeekAnalytics.totalCalories,
    currentWeekAnalytics.totalCalories
  );
  
  const activityCountChange = calculatePercentageChange(
    previousWeekAnalytics.activitiesCount,
    currentWeekAnalytics.activitiesCount
  );
  
  return {
    current: currentWeekAnalytics,
    previous: previousWeekAnalytics,
    changes: {
      durationChange,
      caloriesChange,
      activityCountChange
    }
  };
}

/**
 * Helper function to calculate percentage change
 */
function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return ((current - previous) / previous) * 100;
} 