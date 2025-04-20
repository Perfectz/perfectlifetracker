import { msalInstance, protectedResources } from '../authConfig';

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  scopes?: string[];
}

/**
 * Makes an authenticated API request to the specified endpoint
 * @param endpoint The API endpoint to call
 * @param config The request configuration
 * @returns The API response data
 */
export const callApi = async <T>(
  endpoint: string, 
  config: ApiRequestConfig = {}
): Promise<T> => {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
    scopes = protectedResources.apiProfile.scopes,
  } = config;

  const requestHeaders = { ...headers };
  
  // Add authentication token if needed
  if (requiresAuth) {
    try {
      const account = msalInstance.getAllAccounts()[0];
      if (!account) {
        throw new Error('No active account! Sign in before calling the API.');
      }
      
      const request = {
        scopes,
        account
      };
      
      const response = await msalInstance.acquireTokenSilent(request);
      requestHeaders.Authorization = `Bearer ${response.accessToken}`;
    } catch (error) {
      console.error('Token acquisition failed', error);
      throw new Error('Failed to acquire access token');
    }
  }

  // Prepare request options
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...requestHeaders,
    },
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  // Make the API call
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `API request failed with status ${response.status}`
      );
    }

    // For successful responses
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

/**
 * Profile-related API calls
 */
export const profileService = {
  /**
   * Get the current user's profile
   */
  getProfile: () => callApi(protectedResources.apiProfile.endpoint),
  
  /**
   * Update the current user's profile
   * @param data The updated profile data
   */
  updateProfile: (data: any) => callApi(protectedResources.apiProfile.endpoint, {
    method: 'PUT',
    body: data,
  }),
};

/**
 * Task-related API calls
 */
export const taskService = {
  /**
   * Get all tasks for the current user
   */
  getTasks: () => callApi(protectedResources.apiTasks.endpoint, {
    scopes: protectedResources.apiTasks.scopes,
  }),
  
  /**
   * Create a new task
   * @param task The task data
   */
  createTask: (task: any) => callApi(protectedResources.apiTasks.endpoint, {
    method: 'POST',
    body: task,
    scopes: protectedResources.apiTasks.scopes,
  }),
  
  /**
   * Update an existing task
   * @param taskId The ID of the task to update
   * @param task The updated task data
   */
  updateTask: (taskId: string, task: any) => callApi(`${protectedResources.apiTasks.endpoint}/${taskId}`, {
    method: 'PUT',
    body: task,
    scopes: protectedResources.apiTasks.scopes,
  }),
  
  /**
   * Delete a task
   * @param taskId The ID of the task to delete
   */
  deleteTask: (taskId: string) => callApi(`${protectedResources.apiTasks.endpoint}/${taskId}`, {
    method: 'DELETE',
    scopes: protectedResources.apiTasks.scopes,
  }),
}; 