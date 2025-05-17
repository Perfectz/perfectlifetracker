// backend/src/services/journalInsightsService.ts
// Service for enhanced journal insights and sentiment analysis

import { getJournalsContainer } from './cosmosClient';
import { JournalEntry } from '../models/JournalEntry';
import { ApiError } from '../utils/ApiError';
import * as textAnalyticsService from './textAnalyticsService';
import { FeatureFlags } from '../utils/featureFlags';

// Flag to enable/disable advanced insights
export const FEATURE_ADVANCED_INSIGHTS = FeatureFlags.ENABLE_ADVANCED_INSIGHTS || false;

/**
 * Get sentiment trends for a user over a time period
 * @param userId User ID
 * @param startDate Start date for analysis
 * @param endDate End date for analysis
 * @returns Sentiment trend data
 */
export async function getSentimentTrends(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  averageSentiment: number;
  trendByDay: { date: string; sentiment: number }[];
  topEmotions: { emotion: string; frequency: number }[];
}> {
  try {
    if (!FEATURE_ADVANCED_INSIGHTS) {
      throw new ApiError('Advanced insights not available', 503);
    }

    const container = getJournalsContainer();

    // Query to get all journal entries in the date range
    const querySpec = {
      query: `
        SELECT c.id, c.date, c.sentimentScore, c.content, c.tags
        FROM c
        WHERE c.userId = @userId
        AND c.date >= @startDate
        AND c.date <= @endDate
        ORDER BY c.date ASC
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@startDate', value: startDate.toISOString() },
        { name: '@endDate', value: endDate.toISOString() }
      ]
    };

    const { resources: entries } = await container.items.query(querySpec).fetchAll();

    if (!entries.length) {
      return {
        averageSentiment: 0,
        trendByDay: [],
        topEmotions: []
      };
    }

    // Calculate average sentiment
    const totalSentiment = entries.reduce((sum, entry) => sum + entry.sentimentScore, 0);
    const averageSentiment = totalSentiment / entries.length;

    // Group by day and calculate daily average
    const entriesByDay = groupEntriesByDay(entries);
    const trendByDay = Object.entries(entriesByDay).map(([date, dayEntries]) => {
      const daySentiment = dayEntries.reduce((sum, entry) => sum + entry.sentimentScore, 0) / dayEntries.length;
      return {
        date,
        sentiment: daySentiment
      };
    });

    // Analyze entries for emotion keywords
    const topEmotions = await analyzeTopEmotions(entries);

    return {
      averageSentiment,
      trendByDay,
      topEmotions
    };
  } catch (error) {
    console.error('Error getting sentiment trends:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to analyze sentiment trends', 500);
  }
}

/**
 * Get topic analysis for journal entries
 * @param userId User ID
 * @param startDate Start date for analysis
 * @param endDate End date for analysis
 * @returns Topic analysis data
 */
export async function getTopicAnalysis(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  topTopics: { topic: string; frequency: number }[];
  topicSentiment: { topic: string; sentiment: number }[];
}> {
  try {
    if (!FEATURE_ADVANCED_INSIGHTS) {
      throw new ApiError('Advanced insights not available', 503);
    }

    const container = getJournalsContainer();

    // Query to get all journal entries in the date range
    const querySpec = {
      query: `
        SELECT c.id, c.content, c.sentimentScore, c.tags
        FROM c
        WHERE c.userId = @userId
        AND c.date >= @startDate
        AND c.date <= @endDate
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@startDate', value: startDate.toISOString() },
        { name: '@endDate', value: endDate.toISOString() }
      ]
    };

    const { resources: entries } = await container.items.query(querySpec).fetchAll();

    if (!entries.length) {
      return {
        topTopics: [],
        topicSentiment: []
      };
    }

    // Extract key phrases from entries
    const topTopics = await analyzeTopTopics(entries);

    // Analyze sentiment by topic
    const topicSentiment = await analyzeTopicSentiments(entries);

    return {
      topTopics,
      topicSentiment
    };
  } catch (error) {
    console.error('Error analyzing topics:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to analyze journal topics', 500);
  }
}

/**
 * Generate mood insights and recommendations based on recent journal entries
 * @param userId User ID
 * @param limit Number of recent entries to analyze
 * @returns Insights and recommendations
 */
export async function getMoodInsightsAndRecommendations(
  userId: string,
  limit = 10
): Promise<{
  moodSummary: string;
  recommendations: string[];
  positivePatterns: string[];
  improvementAreas: string[];
}> {
  try {
    if (!FEATURE_ADVANCED_INSIGHTS) {
      throw new ApiError('Advanced insights not available', 503);
    }

    const container = getJournalsContainer();

    // Query to get recent journal entries
    const querySpec = {
      query: `
        SELECT c.id, c.content, c.sentimentScore, c.date, c.tags
        FROM c
        WHERE c.userId = @userId
        ORDER BY c.date DESC
        OFFSET 0 LIMIT @limit
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@limit', value: limit }
      ]
    };

    const { resources: entries } = await container.items.query(querySpec).fetchAll();

    if (!entries.length) {
      return {
        moodSummary: "Not enough data to generate insights.",
        recommendations: ["Start journaling regularly to receive personalized insights."],
        positivePatterns: [],
        improvementAreas: []
      };
    }

    // Analyze mood patterns
    const averageSentiment = entries.reduce((sum, entry) => sum + entry.sentimentScore, 0) / entries.length;
    
    // Generate insights based on sentiment analysis
    const moodSummary = generateMoodSummary(averageSentiment, entries);
    const recommendations = generateRecommendations(entries);
    
    // Identify positive patterns and areas for improvement
    const { positivePatterns, improvementAreas } = identifyPatterns(entries);

    return {
      moodSummary,
      recommendations,
      positivePatterns,
      improvementAreas
    };
  } catch (error) {
    console.error('Error generating mood insights:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to generate mood insights', 500);
  }
}

// Helper functions

/**
 * Group journal entries by day
 */
function groupEntriesByDay(entries: any[]): Record<string, any[]> {
  return entries.reduce((groups, entry) => {
    const date = new Date(entry.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});
}

/**
 * Analyze top emotions mentioned in journal entries
 */
async function analyzeTopEmotions(entries: any[]): Promise<{ emotion: string; frequency: number }[]> {
  // Predefined emotion keywords to look for
  const emotionKeywords = {
    'joy': ['happy', 'happiness', 'joy', 'excited', 'thrilled', 'delighted', 'pleased', 'glad'],
    'sadness': ['sad', 'sadness', 'unhappy', 'depressed', 'miserable', 'melancholy', 'blue', 'down'],
    'anger': ['angry', 'anger', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage'],
    'fear': ['afraid', 'fear', 'scared', 'anxious', 'worried', 'nervous', 'terrified', 'panic'],
    'surprise': ['surprised', 'surprise', 'amazed', 'astonished', 'shocked', 'startled'],
    'love': ['love', 'loved', 'adore', 'cherish', 'affection', 'caring', 'fond'],
    'gratitude': ['grateful', 'thankful', 'appreciate', 'gratitude', 'blessed', 'fortunate'],
    'calm': ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'ease']
  };

  // Count occurrences of emotion keywords
  const emotionCounts: Record<string, number> = {};
  
  for (const entry of entries) {
    const content = entry.content.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          break; // Count each emotion only once per entry
        }
      }
    }
  }

  // Convert to array and sort by frequency
  return Object.entries(emotionCounts)
    .map(([emotion, frequency]) => ({ emotion, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // Top 5 emotions
}

/**
 * Extract and analyze top topics from journal entries
 */
async function analyzeTopTopics(entries: any[]): Promise<{ topic: string; frequency: number }[]> {
  // If TextAnalytics KeyPhrases API is available, use it
  if (textAnalyticsService.isKeyPhrasesEnabled && entries.length > 0) {
    try {
      // Extract key phrases from all entries
      const allKeyPhrases: string[] = [];
      
      for (const entry of entries) {
        if (entry.content && typeof entry.content === 'string') {
          const keyPhrases = await textAnalyticsService.extractKeyPhrases(entry.content);
          allKeyPhrases.push(...keyPhrases);
        }
      }
      
      // Count occurrences of key phrases
      const phraseCounts: Record<string, number> = {};
      for (const phrase of allKeyPhrases) {
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
      }
      
      // Convert to array and sort by frequency
      return Object.entries(phraseCounts)
        .map(([topic, frequency]) => ({ topic, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10); // Top 10 topics
    } catch (error) {
      console.error('Error extracting key phrases:', error);
    }
  }
  
  // Fallback: use tags as topics
  const tagCounts: Record<string, number> = {};
  
  for (const entry of entries) {
    if (entry.tags && Array.isArray(entry.tags)) {
      for (const tag of entry.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  
  // Convert to array and sort by frequency
  return Object.entries(tagCounts)
    .map(([topic, frequency]) => ({ topic, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10); // Top 10 topics
}

/**
 * Analyze sentiment by topic
 */
async function analyzeTopicSentiments(entries: any[]): Promise<{ topic: string; sentiment: number }[]> {
  const topicSentiments: Record<string, { sum: number; count: number }> = {};
  
  // Use tags as topics and calculate average sentiment
  for (const entry of entries) {
    if (entry.tags && Array.isArray(entry.tags) && typeof entry.sentimentScore === 'number') {
      for (const tag of entry.tags) {
        if (!topicSentiments[tag]) {
          topicSentiments[tag] = { sum: 0, count: 0 };
        }
        topicSentiments[tag].sum += entry.sentimentScore;
        topicSentiments[tag].count += 1;
      }
    }
  }
  
  // Calculate average sentiment for each topic
  return Object.entries(topicSentiments)
    .map(([topic, { sum, count }]) => ({ 
      topic, 
      sentiment: count > 0 ? sum / count : 0 
    }))
    .sort((a, b) => b.sentiment - a.sentiment);
}

/**
 * Generate a mood summary based on recent entries
 */
function generateMoodSummary(averageSentiment: number, entries: any[]): string {
  const sentimentTrend = getSentimentTrend(entries);
  
  if (averageSentiment >= 0.8) {
    return `Your recent journal entries show very positive emotions. ${sentimentTrend} Your overall mood has been excellent.`;
  } else if (averageSentiment >= 0.6) {
    return `Your recent journal entries reflect positive emotions. ${sentimentTrend} You've been in good spirits overall.`;
  } else if (averageSentiment >= 0.4) {
    return `Your recent journal entries show balanced emotions. ${sentimentTrend} Your mood has been generally neutral.`;
  } else if (averageSentiment >= 0.2) {
    return `Your recent journal entries indicate some challenging emotions. ${sentimentTrend} You may be going through a difficult time.`;
  } else {
    return `Your recent journal entries reflect primarily negative emotions. ${sentimentTrend} You may want to reach out for support.`;
  }
}

/**
 * Determine sentiment trend from entries
 */
function getSentimentTrend(entries: any[]): string {
  if (entries.length < 3) {
    return "There's not enough data to identify a clear trend.";
  }
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate trend
  const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2));
  const secondHalf = sortedEntries.slice(Math.floor(sortedEntries.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.sentimentScore, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.sentimentScore, 0) / secondHalf.length;
  
  const difference = secondHalfAvg - firstHalfAvg;
  
  if (difference >= 0.2) {
    return "Your mood has been improving significantly.";
  } else if (difference >= 0.05) {
    return "Your mood has been gradually improving.";
  } else if (difference <= -0.2) {
    return "Your mood has been declining significantly.";
  } else if (difference <= -0.05) {
    return "Your mood has been gradually declining.";
  } else {
    return "Your mood has been relatively stable.";
  }
}

/**
 * Generate recommendations based on journal entries
 */
function generateRecommendations(entries: any[]): string[] {
  const recommendations: string[] = [];
  const averageSentiment = entries.reduce((sum, entry) => sum + entry.sentimentScore, 0) / entries.length;
  
  // General recommendations
  recommendations.push("Continue journaling regularly to track your emotional patterns.");
  
  // Add sentiment-based recommendations
  if (averageSentiment < 0.4) {
    recommendations.push("Consider activities that have previously improved your mood.");
    recommendations.push("Try incorporating more positive reflections in your journaling practice.");
    recommendations.push("Look for supportive resources if you're feeling consistently low.");
  } else if (averageSentiment < 0.6) {
    recommendations.push("Try to identify what factors contribute to your more positive entries.");
    recommendations.push("Consider setting aside time for activities that bring you joy.");
  } else {
    recommendations.push("Reflect on what's contributing to your positive outlook.");
    recommendations.push("Consider sharing your positive practices with others who might benefit.");
  }
  
  return recommendations;
}

/**
 * Identify patterns in journal entries
 */
function identifyPatterns(entries: any[]): { positivePatterns: string[]; improvementAreas: string[] } {
  const positivePatterns: string[] = [];
  const improvementAreas: string[] = [];
  
  // Extract positive and negative entries
  const positiveEntries = entries.filter(entry => entry.sentimentScore >= 0.6);
  const negativeEntries = entries.filter(entry => entry.sentimentScore <= 0.4);
  
  // Check for patterns in tags
  const positiveTags = getCommonTags(positiveEntries);
  const negativeTags = getCommonTags(negativeEntries);
  
  // Generate insights based on tags
  positiveTags.forEach(tag => {
    positivePatterns.push(`Journal entries about "${tag}" are associated with positive emotions.`);
  });
  
  negativeTags.forEach(tag => {
    improvementAreas.push(`Journal entries about "${tag}" tend to have lower sentiment scores.`);
  });
  
  // Add default patterns if none found
  if (positivePatterns.length === 0 && positiveEntries.length > 0) {
    positivePatterns.push("You generally express positive emotions in your journal entries.");
  }
  
  if (improvementAreas.length === 0 && negativeEntries.length > 0) {
    improvementAreas.push("Consider exploring the factors behind your less positive journal entries.");
  }
  
  return { positivePatterns, improvementAreas };
}

/**
 * Get common tags from entries
 */
function getCommonTags(entries: any[]): string[] {
  if (entries.length === 0) return [];
  
  const tagCounts: Record<string, number> = {};
  
  for (const entry of entries) {
    if (entry.tags && Array.isArray(entry.tags)) {
      for (const tag of entry.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  
  // Return tags that appear in at least 2 entries or 25% of entries, whichever is higher
  const minCount = Math.max(2, Math.ceil(entries.length * 0.25));
  
  return Object.entries(tagCounts)
    .filter(([_, count]) => count >= minCount)
    .map(([tag]) => tag);
} 