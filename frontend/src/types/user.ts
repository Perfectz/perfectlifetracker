/**
 * frontend/src/types/user.ts
 * User-related TypeScript interfaces
 */

// Core user interface
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  preferences?: UserPreferences;
}

// User roles
export type UserRole = 'user' | 'admin' | 'moderator';

// Authentication context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  error: string | null;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Password change data
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  fitness: FitnessPreferences;
}

// Notification preferences
export interface NotificationPreferences {
  email: {
    enabled: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
    achievements: boolean;
    reminders: boolean;
  };
  push: {
    enabled: boolean;
    workoutReminders: boolean;
    mealReminders: boolean;
    goalDeadlines: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
}

// Privacy preferences
export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  activityVisibility: 'public' | 'friends' | 'private';
  allowDataSharing: boolean;
  allowAnalytics: boolean;
  showOnlineStatus: boolean;
}

// Fitness preferences
export interface FitnessPreferences {
  units: {
    weight: 'kg' | 'lb';
    distance: 'km' | 'mi';
    height: 'cm' | 'ft';
  };
  goals: {
    dailySteps: number;
    weeklyWorkouts: number;
    dailyCalories: number;
  };
  reminders: {
    workoutTime?: string;
    mealTimes: string[];
    waterIntake: boolean;
  };
}

// User activity and statistics
export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'workout_completed'
  | 'meal_logged'
  | 'goal_achieved'
  | 'task_completed'
  | 'file_uploaded';

// User statistics
export interface UserStats {
  totalWorkouts: number;
  totalMeals: number;
  totalTasks: number;
  streakDays: number;
  achievementsCount: number;
  joinDate: string;
  lastActiveDate: string;
}

// Social features (for future expansion)
export interface UserConnection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

export interface UserProfile {
  user: User;
  stats: UserStats;
  recentActivity: UserActivity[];
  connections?: UserConnection[];
}
