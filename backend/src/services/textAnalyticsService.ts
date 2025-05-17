// backend/src/services/textAnalyticsService.ts
// Service for Azure Text Analytics integration for sentiment analysis

import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics';
import dotenv from 'dotenv';
import { FeatureFlags } from '../utils/featureFlags';

// Load environment variables
dotenv.config();

// Use feature flag from FeatureFlags
export const FEATURE_TEXT_ANALYTICS = FeatureFlags.ENABLE_TEXT_ANALYTICS;

// Additional flag for key phrases feature
export const FEATURE_KEY_PHRASES = FeatureFlags.ENABLE_TEXT_ANALYTICS;
export const isKeyPhrasesEnabled = FEATURE_KEY_PHRASES;

// Text Analytics configuration
const textAnalyticsConfig = {
  endpoint: process.env.TEXT_ANALYTICS_ENDPOINT || '',
  key: process.env.TEXT_ANALYTICS_KEY || '',
};

// Simple in-memory cache for development
const sentimentCache = new Map<string, number>();
const keyPhrasesCache = new Map<string, string[]>();

/**
 * Initialize the Text Analytics client
 * @returns TextAnalyticsClient or null if not configured
 */
function getTextAnalyticsClient(): TextAnalyticsClient | null {
  if (!FEATURE_TEXT_ANALYTICS) {
    console.log('Text Analytics feature is disabled. Using mock analysis.');
    return null;
  }

  if (!textAnalyticsConfig.endpoint || !textAnalyticsConfig.key) {
    console.warn('⚠️ Text Analytics credentials not configured. Using mock analysis.');
    return null;
  }

  try {
    return new TextAnalyticsClient(
      textAnalyticsConfig.endpoint,
      new AzureKeyCredential(textAnalyticsConfig.key)
    );
  } catch (error) {
    console.error('Error initializing Text Analytics client:', error);
    return null;
  }
}

/**
 * Analyze sentiment of text content
 * @param text Text content to analyze
 * @returns Sentiment score from 0 (negative) to 1 (positive)
 */
export async function analyzeSentiment(text: string): Promise<number> {
  // Return cached result if available (for development efficiency)
  if (process.env.NODE_ENV === 'development' && sentimentCache.has(text)) {
    return sentimentCache.get(text) as number;
  }

  const client = getTextAnalyticsClient();

  // If client is null (disabled or not configured), use mock sentiment analysis
  if (!client) {
    return mockSentimentAnalysis(text);
  }

  try {
    const results = await client.analyzeSentiment([text]);
    
    if (results && results.length > 0) {
      const result = results[0];
      
      if (result.error) {
        console.error('Text Analytics API error:', result.error);
        return mockSentimentAnalysis(text);
      }
      
      // Azure returns score as 0-1 range where 1 is positive
      const score = result.confidenceScores.positive;
      
      // Cache result for development
      if (process.env.NODE_ENV === 'development') {
        sentimentCache.set(text, score);
      }
      
      return score;
    }
    
    return mockSentimentAnalysis(text);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return mockSentimentAnalysis(text);
  }
}

/**
 * Extract key phrases from text content
 * @param text Text content to analyze
 * @returns Array of key phrases
 */
export async function extractKeyPhrases(text: string): Promise<string[]> {
  // Return cached result if available (for development efficiency)
  if (process.env.NODE_ENV === 'development' && keyPhrasesCache.has(text)) {
    return keyPhrasesCache.get(text) as string[];
  }

  const client = getTextAnalyticsClient();

  // If client is null (disabled or not configured), use mock key phrases extraction
  if (!client) {
    return mockKeyPhrasesExtraction(text);
  }

  try {
    const results = await client.extractKeyPhrases([text]);
    
    if (results && results.length > 0) {
      const result = results[0];
      
      if (result.error) {
        console.error('Text Analytics API error:', result.error);
        return mockKeyPhrasesExtraction(text);
      }
      
      // Get key phrases
      const keyPhrases = result.keyPhrases || [];
      
      // Cache result for development
      if (process.env.NODE_ENV === 'development') {
        keyPhrasesCache.set(text, keyPhrases);
      }
      
      return keyPhrases;
    }
    
    return mockKeyPhrasesExtraction(text);
  } catch (error) {
    console.error('Error extracting key phrases:', error);
    return mockKeyPhrasesExtraction(text);
  }
}

/**
 * Generate mock sentiment score for development or fallback
 * @param text Text to analyze
 * @returns Sentiment score from 0 (negative) to 1 (positive)
 */
function mockSentimentAnalysis(text: string): number {
  // Simple algorithm that looks for positive/negative words
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'enjoy'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'disappointed'];
  
  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  if (positiveCount === 0 && negativeCount === 0) {
    // No sentiment words found, return neutral score
    return 0.5;
  }
  
  // Calculate sentiment score (0-1 range)
  const totalWords = positiveCount + negativeCount;
  const score = positiveCount / totalWords;
  
  // Cache the result
  sentimentCache.set(text, score);
  
  return score;
}

/**
 * Generate mock key phrases for development or fallback
 * @param text Text to analyze
 * @returns Array of key phrases
 */
function mockKeyPhrasesExtraction(text: string): string[] {
  // Simple algorithm that returns nouns and noun phrases
  
  // If text is very short, return the whole text
  if (text.length < 20) {
    return [text.trim()];
  }
  
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Extract potential key phrases from each sentence
  const phrases: string[] = [];
  
  for (const sentence of sentences) {
    // Split into words and remove punctuation
    const words = sentence.trim().split(/\s+/).map(word => word.replace(/[^\w\s]/g, ''));
    
    // Look for noun phrases (simplistic approach)
    for (let i = 0; i < words.length; i++) {
      // Single words that might be important (capitalized words, longer words)
      if (words[i].length > 5 || (words[i][0] && words[i][0] === words[i][0].toUpperCase())) {
        phrases.push(words[i]);
      }
      
      // Word pairs
      if (i < words.length - 1) {
        phrases.push(`${words[i]} ${words[i+1]}`);
      }
    }
  }
  
  // Remove duplicates and limit to 10 phrases
  const uniquePhrases = [...new Set(phrases)];
  const keyPhrases = uniquePhrases.slice(0, 10);
  
  // Cache the result
  keyPhrasesCache.set(text, keyPhrases);
  
  return keyPhrases;
} 