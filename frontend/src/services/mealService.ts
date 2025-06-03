/**
 * frontend/src/services/mealService.ts
 * Service for calling the meal tracking and food analysis endpoints
 */
import { API_URL } from '../config';

// Simple cache for API responses
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Represents a meal/nutrition record from the backend
export interface MealRecord {
  id: string;
  type: 'nutrition';
  userId?: string;
  date: string;
  foodName: string;
  brand?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  totalCalories: number;
  servingSize: number;
  servingUnit: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  analysisMethod: 'manual' | 'ai_vision' | 'barcode' | 'database';
  confidence?: number;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodAnalysis {
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

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  mealsByType: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  meals: MealRecord[];
}

/**
 * Check if cached data is still valid
 */
function getCachedData<T>(key: string): T | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    responseCache.delete(key); // Remove expired cache
  }
  return null;
}

/**
 * Cache API response data
 */
function setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Simple API request function for meal service
 */
async function makeApiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  isFormData: boolean = false,
  useCache: boolean = false
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const cacheKey = `${method}:${endpoint}:${JSON.stringify(data)}`;

  // Check cache for GET requests
  if (method === 'GET' && useCache) {
    const cached = getCachedData<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const options: RequestInit = {
    method,
    credentials: 'include',
  };

  if (data && method !== 'GET') {
    if (isFormData) {
      options.body = data; // FormData object
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }
  } else if (!isFormData) {
    options.headers = { 'Content-Type': 'application/json' };
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let shouldFallback = false;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        shouldFallback = errorData.fallback || false;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      const error = new Error(errorMessage) as Error & { shouldFallback?: boolean };
      error.shouldFallback = shouldFallback;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    let result: T;

    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = {} as T;
    }

    // Cache successful GET responses
    if (method === 'GET' && useCache) {
      setCachedData(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);

    // Check if this is a fallback-eligible error
    const shouldFallback =
      (error as any)?.shouldFallback ||
      error instanceof TypeError || // Network errors
      (error as any)?.code === 'ECONNREFUSED';

    // For demo purposes, return mock data if API fails and fallback is appropriate
    if (shouldFallback) {
      if (method === 'GET' && endpoint === '/fitness/meals') {
        console.warn('API not available, returning mock meal data');
        return generateMockMealData() as T;
      }

      if (method === 'GET' && endpoint.includes('/fitness/meals/daily-summary')) {
        console.warn('API not available, returning mock daily summary');
        return generateMockDailySummary() as T;
      }
    }

    throw error;
  }
}

/**
 * Generate mock meal data for demo purposes
 */
function generateMockMealData(): MealRecord[] {
  const now = new Date();
  return [
    {
      id: 'mock-1',
      type: 'nutrition',
      date: now.toISOString(),
      foodName: 'Grilled Chicken Breast',
      mealType: 'lunch',
      totalCalories: 280,
      servingSize: 6,
      servingUnit: 'oz',
      macros: {
        protein: 53,
        carbs: 0,
        fat: 6,
      },
      analysisMethod: 'manual',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'mock-2',
      type: 'nutrition',
      date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      foodName: 'Greek Yogurt with Berries',
      mealType: 'breakfast',
      totalCalories: 150,
      servingSize: 1,
      servingUnit: 'cup',
      macros: {
        protein: 15,
        carbs: 20,
        fat: 2,
      },
      analysisMethod: 'ai_vision',
      confidence: 0.85,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
}

/**
 * Generate mock daily summary
 */
function generateMockDailySummary(): DailySummary {
  const meals = generateMockMealData();
  return {
    date: new Date().toISOString().split('T')[0],
    totalCalories: 430,
    totalProtein: 68,
    totalCarbs: 20,
    totalFat: 8,
    mealCount: 2,
    mealsByType: {
      breakfast: 1,
      lunch: 1,
      dinner: 0,
      snack: 0,
    },
    meals,
  };
}

/**
 * Fetch all meal records for the authenticated user
 */
export async function fetchMealRecords(date?: string): Promise<MealRecord[]> {
  const params = date ? `?date=${date}` : '';
  return makeApiRequest(`/fitness/meals${params}`, 'GET', undefined, false, true);
}

/**
 * Log a meal manually
 */
export async function logMeal(mealData: {
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  servingSize?: number;
  servingUnit?: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  brand?: string;
  date?: string;
  notes?: string;
}): Promise<MealRecord> {
  try {
    const result = await makeApiRequest<MealRecord>('/fitness/meals', 'POST', mealData);
    // Clear meal cache after successful post
    clearMealCache();
    return result;
  } catch (error) {
    // Check if fallback is appropriate
    if ((error as any)?.shouldFallback || error instanceof TypeError) {
      console.warn('API not available, creating mock meal entry');
      return {
        id: `mock-${Date.now()}`,
        type: 'nutrition',
        date: mealData.date || new Date().toISOString(),
        foodName: mealData.foodName,
        mealType: mealData.mealType,
        totalCalories: mealData.calories,
        servingSize: mealData.servingSize || 1,
        servingUnit: mealData.servingUnit || 'serving',
        macros: {
          protein: mealData.protein || 0,
          carbs: mealData.carbs || 0,
          fat: mealData.fat || 0,
          fiber: mealData.fiber,
          sugar: mealData.sugar,
        },
        analysisMethod: 'manual',
        brand: mealData.brand,
        notes: mealData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}

/**
 * Analyze food image using AI
 */
export async function analyzeFoodImage(
  imageFile: File
): Promise<{ analysis: FoodAnalysis; message: string }> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    return await makeApiRequest('/fitness/meals/analyze-image', 'POST', formData, true);
  } catch (error) {
    // Check if fallback is appropriate based on error response
    if ((error as any)?.shouldFallback || error instanceof TypeError) {
      console.warn('API not available, returning mock food analysis');
      return {
        analysis: {
          foodName: 'Mixed Salad',
          estimatedCalories: 150,
          servingSize: 1,
          servingUnit: 'bowl',
          macros: {
            protein: 5,
            carbs: 15,
            fat: 8,
          },
          confidence: 0.4,
          description: 'Mock analysis - API unavailable',
        },
        message: 'Food analysis completed with 40% confidence (mock data)',
      };
    }
    throw error;
  }
}

/**
 * Log a meal from AI analysis
 */
export async function logMealFromAnalysis(data: {
  analysis: FoodAnalysis;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date?: string;
  imageUrl?: string;
  notes?: string;
}): Promise<MealRecord> {
  try {
    const result = await makeApiRequest<MealRecord>('/fitness/meals/from-analysis', 'POST', data);
    // Clear meal cache after successful post
    clearMealCache();
    return result;
  } catch (error) {
    if ((error as any)?.shouldFallback || error instanceof TypeError) {
      console.warn('API not available, creating mock meal from analysis');
      return {
        id: `mock-${Date.now()}`,
        type: 'nutrition',
        date: data.date || new Date().toISOString(),
        foodName: data.analysis.foodName,
        brand: data.analysis.brand,
        mealType: data.mealType,
        totalCalories: data.analysis.estimatedCalories,
        servingSize: data.analysis.servingSize,
        servingUnit: data.analysis.servingUnit,
        macros: data.analysis.macros,
        analysisMethod: 'ai_vision',
        confidence: data.analysis.confidence,
        imageUrl: data.imageUrl,
        notes: data.notes || data.analysis.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}

/**
 * Get daily nutrition summary
 */
export async function getDailySummary(date?: string): Promise<DailySummary> {
  const params = date ? `?date=${date}` : '';
  return makeApiRequest(`/fitness/meals/daily-summary${params}`, 'GET', undefined, false, true);
}

/**
 * Update an existing meal record
 */
export async function updateMealRecord(
  id: string,
  updates: Partial<MealRecord>
): Promise<MealRecord> {
  try {
    const result = await makeApiRequest<MealRecord>(`/fitness/${id}`, 'PUT', updates);
    // Clear meal cache after successful update
    clearMealCache();
    return result;
  } catch (error) {
    if ((error as any)?.shouldFallback || error instanceof TypeError) {
      console.warn('API not available, simulating meal update');
      return {
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      } as MealRecord;
    }
    throw error;
  }
}

/**
 * Delete a meal record
 */
export async function deleteMealRecord(id: string): Promise<void> {
  try {
    await makeApiRequest(`/fitness/${id}`, 'DELETE');
    // Clear meal cache after successful delete
    clearMealCache();
  } catch (error) {
    if ((error as any)?.shouldFallback || error instanceof TypeError) {
      console.warn('API not available, simulating meal deletion');
      return;
    }
    throw error;
  }
}

/**
 * Clear meal-related cache entries
 */
function clearMealCache(): void {
  const keysToRemove: string[] = [];
  for (const [key] of responseCache.entries()) {
    if (key.includes('/fitness/meals')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => responseCache.delete(key));
}
