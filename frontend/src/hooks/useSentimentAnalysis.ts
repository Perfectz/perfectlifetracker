import { useState, useEffect } from 'react';

/**
 * Types of sentiments our analyzer can detect
 */
export enum SentimentType {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative'
}

/**
 * Interface for sentiment analysis result
 */
export interface SentimentResult {
  score: number;
  sentimentScore: number;
  type: SentimentType;
  keywords: Array<{
    word: string;
    sentiment: SentimentType;
  }>;
}

/**
 * Word lists for sentiment analysis
 */
const SENTIMENT_WORDS = {
  positive: [
    'happy', 'joy', 'excited', 'good', 'great', 
    'excellent', 'amazing', 'wonderful', 'love', 
    'like', 'success', 'achievement', 'proud',
    'peaceful', 'calm', 'relaxed', 'confident',
    'enthusiastic', 'hopeful', 'motivated'
  ],
  negative: [
    'sad', 'angry', 'upset', 'bad', 'terrible', 
    'awful', 'hate', 'dislike', 'frustrated', 
    'worried', 'anxious', 'stressed', 'tired',
    'exhausted', 'depressed', 'afraid', 'hurt',
    'disappointed', 'annoyed', 'miserable', 'fail'
  ]
};

/**
 * Analyze sentiment in a text, returning a score between 0 (negative) and 1 (positive)
 * with identified keywords and sentiment type
 * 
 * @param text The text to analyze
 * @returns Sentiment analysis result with score and type
 */
export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return { 
      score: 0.5, 
      sentimentScore: 0.5,
      type: SentimentType.NEUTRAL,
      keywords: []
    };
  }
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  const keywords: SentimentResult['keywords'] = [];
  
  // Count positive and negative words
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, ''); // Remove non-word characters
    
    if (cleanWord.length < 2) return; // Skip very short words
    
    if (SENTIMENT_WORDS.positive.some(pw => cleanWord.includes(pw) || pw.includes(cleanWord))) {
      positiveCount++;
      if (!keywords.some(k => k.word === cleanWord)) {
        keywords.push({
          word: cleanWord,
          sentiment: SentimentType.POSITIVE
        });
      }
    }
    if (SENTIMENT_WORDS.negative.some(nw => cleanWord.includes(nw) || nw.includes(cleanWord))) {
      negativeCount++;
      if (!keywords.some(k => k.word === cleanWord)) {
        keywords.push({
          word: cleanWord,
          sentiment: SentimentType.NEGATIVE
        });
      }
    }
  });
  
  // Calculate the sentiment score (0 to 1)
  let score = 0.5; // Default to neutral
  if (positiveCount > 0 || negativeCount > 0) {
    // Weight longer text slightly to avoid overreacting to short phrases
    const totalWords = words.length;
    const normalizer = Math.min(1, Math.max(0.5, Math.log(totalWords) / 5));
    
    // Calculate base score
    const total = positiveCount + negativeCount;
    const baseScore = positiveCount / total;
    
    // Normalize score: more words = more confidence, fewer words = more neutral
    score = (baseScore - 0.5) * normalizer + 0.5;
  }
  
  // Determine sentiment type
  let type = SentimentType.NEUTRAL;
  if (score >= 0.6) {
    type = SentimentType.POSITIVE;
  } else if (score < 0.4) {
    type = SentimentType.NEGATIVE;
  }
  
  return { 
    score, 
    sentimentScore: score,
    type, 
    keywords 
  };
}

/**
 * React hook for real-time sentiment analysis
 * 
 * @param text The text to analyze
 * @param debounceMs Optional debounce time in ms (default: 300)
 * @returns Object containing sentiment analysis result and loading state
 */
export function useSentimentAnalysis(text: string, debounceMs = 300) {
  const [result, setResult] = useState<SentimentResult>({
    score: 0.5,
    sentimentScore: 0.5,
    type: SentimentType.NEUTRAL,
    keywords: []
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (text.trim()) {
      setIsLoading(true);
      
      // Use debounce to avoid excessive analysis on each keystroke
      timeoutId = setTimeout(() => {
        const sentimentResult = analyzeSentiment(text);
        setResult(sentimentResult);
        setIsLoading(false);
      }, debounceMs);
    } else {
      setResult({
        score: 0.5,
        sentimentScore: 0.5,
        type: SentimentType.NEUTRAL,
        keywords: []
      });
      setIsLoading(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, debounceMs]);
  
  return { result, isLoading };
}

export default useSentimentAnalysis; 