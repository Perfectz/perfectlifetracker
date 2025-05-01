import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define API error structure
export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

// Define generic API response type
export type ApiResponse<T> = {
  data: T;
  status: number;
  isError: false;
} | {
  error: ApiError;
  isError: true;
};

// Create API client factory
export const createApiClient = (baseURL: string, timeout = 10000): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor for auth
  client.interceptors.request.use((config) => {
    // Get token from storage if exists
    const token = sessionStorage.getItem('auth_token');
    
    // Add auth header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  });

  // Add response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const errorResponse: ApiError = {
        message: error.message || 'An unexpected error occurred',
        status: error.response?.status || 500,
        data: error.response?.data,
      };
      
      // Log error for debugging
      console.error('API Error:', errorResponse);
      
      return Promise.reject(errorResponse);
    }
  );

  return client;
};

// Default API client for the application
export const apiClient = createApiClient(
  process.env.REACT_APP_API_URL || '/api',
  5000
);

// Helper methods for common operations
export const apiService = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(url, config);
      return {
        data: response.data,
        status: response.status,
        isError: false,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        isError: true,
      };
    }
  },

  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(url, data, config);
      return {
        data: response.data,
        status: response.status,
        isError: false,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        isError: true,
      };
    }
  },

  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(url, data, config);
      return {
        data: response.data,
        status: response.status,
        isError: false,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        isError: true,
      };
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(url, config);
      return {
        data: response.data,
        status: response.status,
        isError: false,
      };
    } catch (error) {
      return {
        error: error as ApiError,
        isError: true,
      };
    }
  },

  // Build query string with pagination params
  buildQueryParams(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      // Only add defined, non-null values
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}; 