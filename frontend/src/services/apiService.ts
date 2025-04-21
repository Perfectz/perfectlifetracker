import { msalInstance, protectedResources } from '../authConfig';
import { apiConfig } from '../authConfig';
import { generateMockToken } from '../authContext';
import { mockProfile, mockTasks, mockAvatarResponse, simulateDelay } from './mockData';

// Whether to use mock data when API calls fail (for development without backend)
const USE_MOCK_ON_FAILURE = true;

// Helper function to get an authentication token
async function getToken(scopes: string[]): Promise<string> {
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
    return response.accessToken;
  } catch (error) {
    console.warn('Token acquisition failed, using mock token for development', error);
    // In development, generate a mock token
    return generateMockToken();
  }
}

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  scopes?: string[];
  isFormData?: boolean;
  useMockData?: boolean;
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
    isFormData = false,
    useMockData = false
  } = config;

  // If specifically requesting mock data, return immediately
  if (useMockData) {
    return getMockResponse<T>(endpoint, method, body);
  }

  const requestHeaders: Record<string, string> = { ...headers };
  
  // Add authentication token if needed
  if (requiresAuth) {
    try {
      const token = await getToken(scopes);
      requestHeaders.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to add authorization header', error);
      // Continue without auth - the server will return 401 if needed
    }
  }

  // Prepare request options
  const options: RequestInit = {
    method,
    headers: isFormData 
      ? requestHeaders 
      : {
          'Content-Type': 'application/json',
          ...requestHeaders,
        },
  };

  // Add body for non-GET requests
  if (body) {
    if (isFormData) {
      options.body = body; // FormData object
    } else if (method !== 'GET') {
      options.body = JSON.stringify(body);
    }
  }

  // Make the API call
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      
      // If we got a 401 and USE_MOCK_ON_FAILURE is true, fallback to mock data
      if (USE_MOCK_ON_FAILURE && response.status === 401) {
        console.warn('Authentication failed, using mock data in development mode');
        return getMockResponse<T>(endpoint, method, body);
      }
      
      // Handle specific error status codes
      if (response.status === 401) {
        // Session expired or not authenticated
        console.warn('Authentication required - session may have expired');
      }
      
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    // For successful responses with no content
    if (response.status === 204) {
      return {} as T;
    }

    // For successful responses with content
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    
    // If network error or other failure and USE_MOCK_ON_FAILURE is true, use mock data
    if (USE_MOCK_ON_FAILURE) {
      console.warn('API call failed, using mock data in development mode');
      return getMockResponse<T>(endpoint, method, body);
    }
    
    throw error;
  }
};

/**
 * Get mock response data for development based on endpoint and method
 */
async function getMockResponse<T>(endpoint: string, method: string, body?: any): Promise<T> {
  // Simulate API delay
  await simulateDelay();
  
  // Profile endpoints
  if (endpoint.includes('/profile')) {
    if (endpoint.includes('/avatar')) {
      // Avatar-related operations
      if (method === 'POST') {
        return mockAvatarResponse as unknown as T;
      } else if (method === 'DELETE') {
        const updatedProfile = { ...mockProfile, avatarUrl: undefined };
        return { profile: updatedProfile } as unknown as T;
      }
    }
    
    // Profile CRUD operations
    if (method === 'GET') {
      return mockProfile as unknown as T;
    } else if (method === 'PUT' || method === 'POST') {
      return { ...mockProfile, ...body } as unknown as T;
    }
  }
  
  // Task endpoints
  if (endpoint.includes('/tasks')) {
    const taskId = endpoint.split('/').pop();
    
    if (taskId && taskId !== 'tasks') {
      // Single task operations
      const task = mockTasks.find(t => t.id === taskId);
      
      if (method === 'GET') {
        return task as unknown as T;
      } else if (method === 'PUT') {
        return { ...task, ...body, updatedAt: new Date() } as unknown as T;
      } else if (method === 'DELETE') {
        return {} as T;
      }
    } else {
      // Multiple tasks operations
      if (method === 'GET') {
        return mockTasks as unknown as T;
      } else if (method === 'POST') {
        const newTask = {
          id: `task-${Date.now()}`,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return newTask as unknown as T;
      }
    }
  }

  // Default fallback for any unhandled endpoint
  return {} as T;
}

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

  /**
   * Upload avatar image for the current user
   * @param userId The user ID
   * @param file The image file to upload
   * @returns Response with avatarUrl and updated profile
   */
  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return callApi<{ avatarUrl: string; profile: any; }>(`${apiConfig.baseUrl}/profile/${userId}/avatar`, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },
  
  /**
   * Delete the avatar for the current user
   * @param userId The user ID
   * @returns Response with updated profile
   */
  deleteAvatar: async (userId: string) => {
    return callApi<{ profile: any; }>(`${apiConfig.baseUrl}/profile/${userId}/avatar`, {
      method: 'DELETE'
    });
  },
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