/**
 * Mock data for development when the backend is not available.
 * This allows the application to function without a running backend service.
 */

// Mock user profile data
export const mockProfile = {
  id: 'mock-user-id',
  name: 'Demo User',
  email: 'user@example.com',
  bio: 'This is a mock user profile for development purposes.',
  avatarUrl: 'https://via.placeholder.com/150',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date(),
  preferences: {
    theme: 'light' as const,
    notifications: true
  }
};

// Mock task data 
export const mockTasks = [
  {
    id: 'task-1',
    title: 'Complete project setup',
    description: 'Set up the development environment and install dependencies',
    completed: true,
    dueDate: new Date('2023-06-15'),
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-10')
  },
  {
    id: 'task-2',
    title: 'Implement authentication',
    description: 'Add user authentication using Azure AD B2C',
    completed: false,
    dueDate: new Date('2023-06-30'),
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-20')
  },
  {
    id: 'task-3',
    title: 'Design user interface',
    description: 'Create UI mockups and implement responsive design',
    completed: false,
    dueDate: new Date('2023-07-15'),
    createdAt: new Date('2023-06-10'),
    updatedAt: null
  }
];

// Avatar upload response mock
export const mockAvatarResponse = {
  avatarUrl: 'https://via.placeholder.com/150',
  profile: mockProfile
};

// Mock analytics data
export const mockAnalyticsData = {
  totalDuration: 450,
  totalCalories: 2200,
  averageDurationPerDay: 45,
  averageCaloriesPerDay: 220,
  activityCountByType: { 'Running': 4, 'Cycling': 2 },
  caloriesByType: { 'Running': 1200, 'Cycling': 1000 },
  durationByType: { 'Running': 240, 'Cycling': 210 },
  activeDays: 10,
  activitiesCount: 6
};

// Mock fitness summary data
export const mockFitnessSummary = {
  summary: 'You have been doing great with your workouts. Keep up the good work! Your running and cycling activities show a consistent pattern of exercise.'
};

// Helper to simulate API latency
export const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms)); 