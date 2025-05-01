// backend/src/services/insightsService.ts
// Service for generating AI-powered insights and recommendations

import { getActivitiesByUserId, ActivityFilterOptions } from './activityService';
import { calculateFitnessAnalytics } from './analyticsService';
import { Activity } from '../models/Activity';

/**
 * Insight recommendation types
 */
export enum InsightType {
  GOAL_PROGRESS = 'GOAL_PROGRESS',
  ACTIVITY_SUGGESTION = 'ACTIVITY_SUGGESTION',
  PERFORMANCE_INSIGHT = 'PERFORMANCE_INSIGHT',
  STREAK_NOTIFICATION = 'STREAK_NOTIFICATION',
  RECOVERY_RECOMMENDATION = 'RECOVERY_RECOMMENDATION'
}

/**
 * Insight recommendation interface
 */
export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: number; // 1-5 with 5 being highest priority
  createdAt: Date;
  expiresAt?: Date; // Optional expiration date for time-sensitive insights
  actionable: boolean; // Whether this insight has an actionable step
  actionText?: string; // Text for the action button if actionable
  actionLink?: string; // Link or route for the action button if actionable
  metadata?: Record<string, any>; // Additional data specific to the insight type
}

/**
 * Generate personalized insights for a user
 * @param userId User ID
 * @returns List of insights sorted by priority
 */
export async function generateUserInsights(userId: string): Promise<Insight[]> {
  const insights: Insight[] = [];
  
  // Get data for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  // Get analytics for the period
  const analytics = await calculateFitnessAnalytics(userId, thirtyDaysAgo, today);
  
  // Get recent activities
  const filters: ActivityFilterOptions = {
    startDate: thirtyDaysAgo,
    endDate: today
  };
  const result = await getActivitiesByUserId(userId, filters, 100, 0);
  const activities = result.items;
  
  // Add insights based on activity patterns
  if (analytics.activitiesCount > 0) {
    // Check for consistency in activity
    insights.push(...generateConsistencyInsights(activities, analytics));
    
    // Generate activity type balance insights
    insights.push(...generateActivityBalanceInsights(analytics));
    
    // Generate performance trend insights
    insights.push(...generatePerformanceInsights(activities));
    
    // Generate recovery recommendations
    insights.push(...generateRecoveryRecommendations(activities));
  } else {
    // No activities found, suggest getting started
    insights.push(createGettingStartedInsight());
  }
  
  // Sort insights by priority (highest first)
  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * Create insights about activity consistency
 */
function generateConsistencyInsights(activities: Activity[], analytics: any): Insight[] {
  const insights: Insight[] = [];
  
  // Check for consistency/streaks
  if (analytics.activeDays >= 5) {
    insights.push({
      id: `streak-${Date.now()}`,
      type: InsightType.STREAK_NOTIFICATION,
      title: 'Active Streak!',
      description: `Great job staying active for ${analytics.activeDays} days in the last month.`,
      priority: 4,
      createdAt: new Date(),
      actionable: false
    });
  }
  
  // If user has been inactive for the last week
  const lastWeekActivities = activities.filter(a => {
    const activityDate = new Date(a.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return activityDate >= oneWeekAgo;
  });
  
  if (lastWeekActivities.length === 0 && activities.length > 0) {
    insights.push({
      id: `inactive-${Date.now()}`,
      type: InsightType.ACTIVITY_SUGGESTION,
      title: 'Time to get moving!',
      description: 'It\'s been over a week since your last activity. Consider scheduling a workout today.',
      priority: 5,
      createdAt: new Date(),
      actionable: true,
      actionText: 'Add Workout',
      actionLink: '/activities/new'
    });
  }
  
  return insights;
}

/**
 * Create insights about activity type balance
 */
function generateActivityBalanceInsights(analytics: any): Insight[] {
  const insights: Insight[] = [];
  const activityTypes = Object.keys(analytics.activityCountByType);
  
  // Check if user is focused on only one type of activity
  if (activityTypes.length === 1 && analytics.activitiesCount > 3) {
    const activityType = activityTypes[0];
    
    insights.push({
      id: `balance-${Date.now()}`,
      type: InsightType.ACTIVITY_SUGGESTION,
      title: 'Mix Up Your Routine',
      description: `You've been focusing on ${activityType}. Consider adding variety with other activities like ${getSuggestedActivityTypes(activityType).join(', ')}.`,
      priority: 3,
      createdAt: new Date(),
      actionable: true,
      actionText: 'Explore Activities',
      actionLink: '/activities'
    });
  }
  
  return insights;
}

/**
 * Create insights about performance trends
 */
function generatePerformanceInsights(activities: Activity[]): Insight[] {
  const insights: Insight[] = [];
  
  // Simple trend analysis: group by activity type and calculate improvements
  const activityTypeGroups: Record<string, Activity[]> = {};
  
  activities.forEach(activity => {
    if (!activityTypeGroups[activity.type]) {
      activityTypeGroups[activity.type] = [];
    }
    activityTypeGroups[activity.type].push(activity);
  });
  
  // Check each activity type for improvements
  Object.entries(activityTypeGroups).forEach(([type, typeActivities]) => {
    // Sort by date, oldest first
    typeActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (typeActivities.length >= 3) {
      // Check if the latest activities show improvement in duration or intensity
      const recentActivities = typeActivities.slice(-3);
      const earlierActivities = typeActivities.slice(0, typeActivities.length - 3);
      
      if (earlierActivities.length > 0) {
        const avgRecentDuration = recentActivities.reduce((sum, a) => sum + a.duration, 0) / recentActivities.length;
        const avgEarlierDuration = earlierActivities.reduce((sum, a) => sum + a.duration, 0) / earlierActivities.length;
        
        if (avgRecentDuration > avgEarlierDuration * 1.15) { // 15% improvement
          insights.push({
            id: `improvement-${type}-${Date.now()}`,
            type: InsightType.PERFORMANCE_INSIGHT,
            title: `${type} Improvement!`,
            description: `You've increased your ${type} duration by ${Math.round((avgRecentDuration/avgEarlierDuration - 1) * 100)}% recently. Keep up the good work!`,
            priority: 4,
            createdAt: new Date(),
            actionable: false
          });
        }
      }
    }
  });
  
  return insights;
}

/**
 * Create insights about recovery needs
 */
function generateRecoveryRecommendations(activities: Activity[]): Insight[] {
  const insights: Insight[] = [];
  
  // Check for high-intensity activities on consecutive days
  const dateActivityMap: Record<string, Activity[]> = {};
  
  activities.forEach(activity => {
    const dateStr = new Date(activity.date).toISOString().split('T')[0];
    if (!dateActivityMap[dateStr]) {
      dateActivityMap[dateStr] = [];
    }
    dateActivityMap[dateStr].push(activity);
  });
  
  // Convert to array of [date, activities] pairs and sort by date
  const sortedDates = Object.entries(dateActivityMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  
  // Check for consecutive days with high-intensity workouts
  let consecutiveIntenseDays = 0;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const [, dayActivities] = sortedDates[i];
    
    // Consider a day "intense" if any activity is over 45 minutes or has high calories
    const isIntenseDay = dayActivities.some(a => 
      a.duration > 45 || 
      a.calories > 300
    );
    
    if (isIntenseDay) {
      consecutiveIntenseDays++;
      
      if (consecutiveIntenseDays >= 3) {
        insights.push({
          id: `recovery-${Date.now()}`,
          type: InsightType.RECOVERY_RECOMMENDATION,
          title: 'Time for Recovery',
          description: 'You\'ve had several consecutive days of intense activity. Consider scheduling a rest day or low-intensity activity for recovery.',
          priority: 5,
          createdAt: new Date(),
          actionable: true,
          actionText: 'Learn More',
          actionLink: '/insights/recovery'
        });
        break;
      }
    } else {
      consecutiveIntenseDays = 0;
    }
  }
  
  return insights;
}

/**
 * Create a getting started insight for new users
 */
function createGettingStartedInsight(): Insight {
  return {
    id: `getting-started-${Date.now()}`,
    type: InsightType.ACTIVITY_SUGGESTION,
    title: 'Start Your Fitness Journey',
    description: 'Track your first workout to begin receiving personalized insights and recommendations.',
    priority: 5,
    createdAt: new Date(),
    actionable: true,
    actionText: 'Add First Activity',
    actionLink: '/activities/new'
  };
}

/**
 * Helper function to suggest complementary activity types
 */
function getSuggestedActivityTypes(currentType: string): string[] {
  const activityMap: Record<string, string[]> = {
    'Running': ['Cycling', 'Swimming', 'Yoga'],
    'Cycling': ['Running', 'Swimming', 'Strength Training'],
    'Swimming': ['Cycling', 'Yoga', 'Running'],
    'Yoga': ['Strength Training', 'Running', 'Pilates'],
    'Strength Training': ['Yoga', 'Running', 'HIIT'],
    'HIIT': ['Yoga', 'Swimming', 'Strength Training'],
    'Walking': ['Yoga', 'Swimming', 'Cycling'],
    'Hiking': ['Yoga', 'Strength Training', 'Cycling']
  };
  
  return activityMap[currentType] || ['Running', 'Yoga', 'Strength Training'];
} 