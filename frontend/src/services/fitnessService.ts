/**
 * Service for calling the weight tracking endpoints
 */
import { API_URL } from '../config';

// Represents a weight measurement record from the backend
export interface WeightRecord {
  id: string;
  measurementType: string;
  value: number;
  unit: string;
  date: string;
  userId?: string;
}

/**
 * Simple API request function
 */
async function makeApiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {} as T;
    }
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    
    // For demo purposes, return mock data if API fails
    if (method === 'GET' && endpoint === '/fitness/weight') {
      console.warn('API not available, returning mock weight data');
      return generateMockWeightData() as T;
    }
    
    throw error;
  }
}

/**
 * Generate mock weight data for demo purposes
 */
function generateMockWeightData(): WeightRecord[] {
  const mockData: WeightRecord[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  for (let i = 0; i < 10; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 3);
    
    mockData.push({
      id: `mock-${i}`,
      measurementType: 'weight',
      value: 150 + Math.random() * 30, // Random weight between 150-180 lbs
      unit: 'lbs',
      date: date.toISOString().split('T')[0] + 'T12:00:00.000Z'
    });
  }

  return mockData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetches all weight measurement records for the authenticated user.
 */
export async function fetchWeightRecords(): Promise<WeightRecord[]> {
  return makeApiRequest('/fitness/weight', 'GET');
}

/**
 * Logs a new weight measurement or updates an existing record for the given date.
 */
export async function postWeightRecord(record: { date: string; weight: number; }): Promise<WeightRecord> {
  try {
    return await makeApiRequest('/fitness/weight', 'POST', {
      date: record.date,
      weight: record.weight
    });
  } catch (error) {
    // For demo purposes, return a mock response
    console.warn('API not available, creating mock weight entry');
    return {
      id: `mock-${Date.now()}`,
      measurementType: 'weight',
      value: record.weight,
      unit: 'lbs',
      date: record.date + 'T12:00:00.000Z'
    };
  }
}

/**
 * Updates an existing weight record by ID.
 */
export async function updateWeightRecord(id: string, record: { date: string; weight: number; }): Promise<WeightRecord> {
  try {
    return await makeApiRequest(`/fitness/${id}`, 'PUT', {
      measurementType: 'weight',
      value: record.weight,
      unit: 'lbs',
      date: record.date
    });
  } catch (error) {
    console.warn('API not available, simulating weight update');
    return {
      id,
      measurementType: 'weight',
      value: record.weight,
      unit: 'lbs',
      date: record.date + 'T12:00:00.000Z'
    };
  }
}

/**
 * Deletes a weight record by ID.
 */
export async function deleteWeightRecord(id: string): Promise<void> {
  try {
    await makeApiRequest(`/fitness/${id}`, 'DELETE');
  } catch (error) {
    console.warn('API not available, simulating weight deletion');
    // For demo purposes, just log the deletion
  }
} 