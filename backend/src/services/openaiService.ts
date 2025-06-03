/**
 * backend/src/services/openaiService.ts
 * Service for interacting with OpenAI ChatGPT Vision API for food recognition
 */
import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY or AZURE_OPENAI_API_KEY environment variable.');
    }

    openaiClient = new OpenAI({
      apiKey,
      baseURL: process.env.AZURE_OPENAI_ENDPOINT ? 
        `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-4-vision-preview` : 
        undefined,
      defaultQuery: process.env.AZURE_OPENAI_ENDPOINT ? { 'api-version': '2024-02-15-preview' } : undefined,
      defaultHeaders: process.env.AZURE_OPENAI_ENDPOINT ? {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      } : undefined,
    });
  }
  
  return openaiClient;
}

export interface FoodAnalysisResult {
  foodName: string;
  brand?: string;
  estimatedCalories: number;
  servingSize: number;
  servingUnit: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  confidence: number;
  description: string;
}

/**
 * Check if OpenAI is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return !!(process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Analyze food image using OpenAI Vision API
 */
export async function analyzeFoodImage(imageBase64: string): Promise<FoodAnalysisResult> {
  try {
    if (!isOpenAIConfigured()) {
      throw new Error('OpenAI API not configured');
    }

    const openai = getOpenAIClient();
    
    const prompt = `
      Analyze this food image and provide detailed nutritional information. Return a JSON object with the following structure:
      {
        "foodName": "specific name of the food item",
        "brand": "brand name if visible or null",
        "estimatedCalories": number (total calories for the portion shown),
        "servingSize": number (estimated serving size),
        "servingUnit": "unit (cup, piece, slice, gram, etc.)",
        "macros": {
          "protein": number (grams),
          "carbs": number (grams),
          "fat": number (grams),
          "fiber": number (grams, optional),
          "sugar": number (grams, optional)
        },
        "confidence": number (0-1, your confidence in this analysis),
        "description": "brief description of what you see"
      }

      Be as accurate as possible with portion size estimation. If you can't clearly identify the food, set confidence to 0.3 or lower.
      If multiple food items are visible, analyze the main/largest item.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_ENDPOINT ? 'gpt-4-vision-preview' : 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent results
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Try to parse JSON from the response
    let analysisResult: FoodAnalysisResult;
    try {
      // Look for JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse nutrition analysis from OpenAI response');
    }

    // Validate and sanitize the result
    return {
      foodName: analysisResult.foodName || 'Unknown Food',
      brand: analysisResult.brand || undefined,
      estimatedCalories: Math.max(0, analysisResult.estimatedCalories || 0),
      servingSize: Math.max(0, analysisResult.servingSize || 1),
      servingUnit: analysisResult.servingUnit || 'serving',
      macros: {
        protein: Math.max(0, analysisResult.macros?.protein || 0),
        carbs: Math.max(0, analysisResult.macros?.carbs || 0),
        fat: Math.max(0, analysisResult.macros?.fat || 0),
        fiber: analysisResult.macros?.fiber ? Math.max(0, analysisResult.macros.fiber) : undefined,
        sugar: analysisResult.macros?.sugar ? Math.max(0, analysisResult.macros.sugar) : undefined,
      },
      confidence: Math.min(1, Math.max(0, analysisResult.confidence || 0.5)),
      description: analysisResult.description || 'Food analysis completed'
    };

  } catch (error) {
    console.error('Error analyzing food image with OpenAI:', error);
    
    // Return a default result if API fails
    return {
      foodName: 'Unknown Food',
      estimatedCalories: 200,
      servingSize: 1,
      servingUnit: 'serving',
      macros: {
        protein: 5,
        carbs: 30,
        fat: 8
      },
      confidence: 0.1,
      description: `Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test the OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    if (!isOpenAIConfigured()) {
      return false;
    }
    
    const openai = getOpenAIClient();
    const response = await openai.models.list();
    return response.data.length > 0;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
} 