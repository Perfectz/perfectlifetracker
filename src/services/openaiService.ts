// backend/src/services/openaiService.ts
// Service for OpenAI API integration

import axios from 'axios';
import dotenv from 'dotenv';
import { Activity } from '../models/Activity';
import { FitnessAnalytics } from './analyticsService';

// Load environment variables
dotenv.config();

// Configuration from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-mini';
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
const MOCK_OPENAI = process.env.MOCK_OPENAI === 'true';

/**
 * OpenAI client interface
 */
export interface OpenAIClient {
  generateFitnessSummary(activities: Activity[], analytics: FitnessAnalytics): Promise<string>;
}

/**
 * Real OpenAI API client
 */
export class RealOpenAIClient implements OpenAIClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;

  constructor(apiKey: string = OPENAI_API_KEY || '', model: string = OPENAI_MODEL, apiUrl: string = OPENAI_API_URL) {
    if (!apiKey && !MOCK_OPENAI) {
      console.warn('⚠️ OpenAI API key not provided. Features requiring OpenAI will not work correctly.');
    }
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = apiUrl;
  }

  /**
   * Generate a fitness summary using OpenAI API
   * @param activities List of fitness activities
   * @param analytics Calculated fitness metrics
   * @returns A generated fitness summary text
   */
  async generateFitnessSummary(activities: Activity[], analytics: FitnessAnalytics): Promise<string> {
    // If API key is missing, provide a fallback message
    if (!this.apiKey) {
      console.error('OpenAI API key not configured');
      return "Unable to generate fitness summary. Please contact support.";
    }

    try {
      // Prepare data for the request
      const activitySummary = activities.map(a => ({
        type: a.type,
        duration: a.duration,
        calories: a.calories,
        date: a.date
      }));

      // Create system message with instructions
      const systemMessage = `You are a fitness coach reviewing a user's activities. 
      Provide a helpful, encouraging summary of their fitness data and offer personalized advice.
      Keep it conversational, concise (max 3 paragraphs), and actionable.`;

      // Create user message with the activity data
      const userMessage = `Here is my fitness data for analysis:
      
      Activities: ${JSON.stringify(activitySummary)}
      
      Summary Metrics:
      - Total Duration: ${analytics.totalDuration} minutes
      - Total Calories: ${analytics.totalCalories} calories
      - Average Duration Per Day: ${analytics.averageDurationPerDay} minutes
      - Average Calories Per Day: ${analytics.averageCaloriesPerDay} calories
      - Active Days: ${analytics.activeDays}
      - Activity Types: ${Object.keys(analytics.activityCountByType).join(', ')}
      
      Please provide a helpful summary of my fitness activity and suggestions for improvement.`;

      // Make API call to OpenAI
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // Extract and return the generated summary
      const generatedText = response.data.choices[0]?.message?.content || 
        "Unable to generate fitness summary at this time.";
      
      return generatedText;
    } catch (error: any) {
      console.error('Error generating fitness summary:', error.message);
      
      // Provide a user-friendly error message
      if (error.response?.status === 401) {
        return "Unable to generate fitness summary: API authentication failed.";
      } else if (error.response?.status === 429) {
        return "Unable to generate fitness summary: API rate limit exceeded.";
      } else {
        return "Unable to generate fitness summary due to a technical issue. Please try again later.";
      }
    }
  }
}

/**
 * Mock OpenAI client (for development/testing)
 */
export class MockOpenAIClient implements OpenAIClient {
  async generateFitnessSummary(activities: Activity[], analytics: FitnessAnalytics): Promise<string> {
    if (activities.length === 0) {
      return "You haven't logged any activities in this period. Consider adding some workouts to start tracking your fitness journey.";
    }

    const activityTypes = Object.keys(analytics.activityCountByType).join(', ');
    const daysActive = analytics.activeDays;
    const totalDuration = analytics.totalDuration;
    const totalCalories = analytics.totalCalories;
    const mostFrequentActivity = this.getMostFrequentActivity(analytics.activityCountByType);

    return `During this period, you completed ${activities.length} activities including ${activityTypes}. 
    You were active on ${daysActive} days, exercising for a total of ${totalDuration} minutes and burning ${totalCalories} calories. 
    Your most frequent activity was ${mostFrequentActivity}. 
    Keep up the good work and consider adding more variety to your routine for better overall fitness.`;
  }

  /**
   * Helper function to get most frequent activity
   */
  private getMostFrequentActivity(activityCountByType: Record<string, number>): string {
    let maxCount = 0;
    let mostFrequent = '';
    
    Object.entries(activityCountByType).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = type;
      }
    });
    
    return mostFrequent;
  }
}

/**
 * Factory function to create the appropriate OpenAI client
 * based on environment configuration
 */
export function createOpenAIClient(): OpenAIClient {
  // Use mock client if explicitly configured or if API key is missing
  if (MOCK_OPENAI || !OPENAI_API_KEY) {
    console.log('Using mock OpenAI client');
    return new MockOpenAIClient();
  }
  
  console.log('Using real OpenAI client');
  return new RealOpenAIClient(OPENAI_API_KEY);
}

// Default export for convenience
export default createOpenAIClient(); 