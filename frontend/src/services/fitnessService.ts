/**
 * Service for calling the weight tracking endpoints
 */
import { API_URL } from '../config';
import { authService } from './authService';

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
 * API request function with authentication
 */
async function makeApiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;

  // Get authentication token
  const token = await authService.getToken();
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
    throw error;
  }
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
export async function postWeightRecord(record: {
  date: string;
  weight: number;
}): Promise<WeightRecord> {
  return await makeApiRequest('/fitness/weight', 'POST', {
    date: record.date,
    weight: record.weight,
  });
}

/**
 * Updates an existing weight record by ID.
 */
export async function updateWeightRecord(
  id: string,
  record: { date: string; weight: number }
): Promise<WeightRecord> {
  return await makeApiRequest(`/fitness/${id}`, 'PUT', {
    measurementType: 'weight',
    value: record.weight,
    unit: 'lbs',
    date: record.date,
  });
}

/**
 * Deletes a weight record by ID.
 */
export async function deleteWeightRecord(id: string): Promise<void> {
  await makeApiRequest(`/fitness/${id}`, 'DELETE');
}
