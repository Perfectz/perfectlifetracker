/**
 * frontend/src/services/taskService.ts
 * Service for managing tasks with backend API integration
 */
import { API_URL } from '../config';
import { authService } from './authService';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  completedDate?: string;
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
 * Fetches all tasks for the authenticated user
 */
export async function getTasks(): Promise<Task[]> {
  const response = await makeApiRequest<{ success: boolean; data: Task[] }>('/tasks', 'GET');
  return response.data || [];
}

/**
 * Creates a new task
 */
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const response = await makeApiRequest<{ success: boolean; data: Task }>('/tasks', 'POST', {
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    dueDate: taskData.dueDate,
    category: taskData.category,
    tags: taskData.tags,
    status: taskData.status || 'pending',
  });
  return response.data;
}

/**
 * Updates an existing task
 */
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const response = await makeApiRequest<{ success: boolean; data: Task }>(`/tasks/${id}`, 'PUT', updates);
  return response.data;
}

/**
 * Deletes a task
 */
export async function deleteTask(id: string): Promise<void> {
  await makeApiRequest(`/tasks/${id}`, 'DELETE');
}

/**
 * Marks a task as completed
 */
export async function completeTask(id: string, actualTime?: number): Promise<Task> {
  const response = await makeApiRequest<{ success: boolean; data: Task }>(`/tasks/${id}/complete`, 'POST', {
    actualTime,
  });
  return response.data;
}

/**
 * Gets tasks by status
 */
export async function getTasksByStatus(status: Task['status']): Promise<Task[]> {
  const response = await makeApiRequest<{ success: boolean; data: Task[] }>(`/tasks?status=${status}`, 'GET');
  return response.data || [];
}

/**
 * Gets a specific task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const response = await makeApiRequest<{ success: boolean; data: Task }>(`/tasks/${id}`, 'GET');
    return response.data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
} 