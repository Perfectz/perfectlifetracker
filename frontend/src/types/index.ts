/**
 * frontend/src/types/index.ts
 * Central export for all TypeScript types and interfaces
 */

// API related exports
export type {
  ApiResponse,
  FileResponse,
  MultipleFilesResponse,
  AuthResponse,
  ApiError,
  UploadProgressCallback,
  FitnessRecord,
  WorkoutData,
  MeasurementData,
  GoalData,
  MealRecord,
  FoodItem,
  TaskRecord,
  ListResponse,
} from './api';

// User related exports
export type {
  User,
  UserRole,
  AuthContextType,
  RegisterData,
  LoginCredentials,
  PasswordChangeData,
  UserPreferences,
  NotificationPreferences,
  PrivacyPreferences,
  FitnessPreferences,
  UserActivity,
  ActivityType,
  UserStats,
  UserConnection,
  UserProfile,
} from './user';

// Common types exports
export type {
  EventHandler,
  ChangeEventHandler,
  ClickEventHandler,
  ThemeColors,
  SxPropsType,
  NavigationItem,
  FormField,
  SelectOption,
  ValidationRule,
  LoadingState,
  PaginationState,
  ChartDataPoint,
  ChartConfig,
  NotificationSettings,
  PrivacySettings,
  Optional,
  RequiredFields,
  DeepPartial,
  Status,
  Priority,
  MediaFile,
} from './common';
