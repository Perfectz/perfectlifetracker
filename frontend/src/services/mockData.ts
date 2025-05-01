/**
 * Mock data for development when the backend is not available.
 * This allows the application to function without a running backend service.
 */

// Define Habit-related types locally to prevent circular imports
export enum HabitFrequencyMock {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export interface HabitMock {
  id: string;
  userId: string;
  name: string;
  frequency: HabitFrequencyMock;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface StreakDataMock {
  date: string;
  streak: number;
}

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

// Habit mock data
export const mockHabits: HabitMock[] = [
  {
    id: 'habit-1',
    userId: 'user-1',
    name: 'Daily Meditation',
    frequency: HabitFrequencyMock.DAILY,
    streak: 15,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-06-01'),
    description: '10 minutes of mindfulness meditation each morning'
  },
  {
    id: 'habit-2',
    userId: 'user-1',
    name: 'Weekly Meal Prep',
    frequency: HabitFrequencyMock.WEEKLY,
    streak: 8,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-06-01'),
    description: 'Prepare healthy meals for the week every Sunday'
  },
  {
    id: 'habit-3',
    userId: 'user-1',
    name: 'Read Books',
    frequency: HabitFrequencyMock.DAILY,
    streak: 30,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-06-01'),
    description: 'Read at least 20 pages daily'
  },
  {
    id: 'habit-4',
    userId: 'user-1',
    name: 'Monthly Budget Review',
    frequency: HabitFrequencyMock.MONTHLY,
    streak: 5,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-06-01')
  },
  {
    id: 'habit-5',
    userId: 'user-1',
    name: 'Water Plants',
    frequency: HabitFrequencyMock.CUSTOM,
    streak: 12,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-06-01'),
    description: 'Water indoor plants every 3 days'
  }
];

export const mockStreakData: StreakDataMock[] = [
  { date: '2023-05-01', streak: 5 },
  { date: '2023-05-02', streak: 6 },
  { date: '2023-05-03', streak: 7 },
  { date: '2023-05-04', streak: 8 },
  { date: '2023-05-05', streak: 9 },
  { date: '2023-05-06', streak: 10 },
  { date: '2023-05-07', streak: 11 },
  { date: '2023-05-08', streak: 12 },
  { date: '2023-05-09', streak: 13 },
  { date: '2023-05-10', streak: 14 },
  { date: '2023-05-11', streak: 15 },
  { date: '2023-05-12', streak: 16 },
  { date: '2023-05-13', streak: 17 },
  { date: '2023-05-14', streak: 18 },
  { date: '2023-05-15', streak: 19 },
  { date: '2023-05-16', streak: 20 },
  { date: '2023-05-17', streak: 21 },
  { date: '2023-05-18', streak: 22 },
  { date: '2023-05-19', streak: 23 },
  { date: '2023-05-20', streak: 24 },
  { date: '2023-05-21', streak: 25 },
  { date: '2023-05-22', streak: 26 },
  { date: '2023-05-23', streak: 27 },
  { date: '2023-05-24', streak: 28 },
  { date: '2023-05-25', streak: 29 },
  { date: '2023-05-26', streak: 30 },
  { date: '2023-05-27', streak: 31 },
  { date: '2023-05-28', streak: 32 },
  { date: '2023-05-29', streak: 33 },
  { date: '2023-05-30', streak: 34 },
  { date: '2023-05-31', streak: 35 }
]; 