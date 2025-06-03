/**
 * frontend/src/types/common.ts
 * Common TypeScript interfaces and types
 */

// Common event handler types
export interface EventHandler<T = Event> {
  (event: T): void;
}

export interface ChangeEventHandler<T = HTMLInputElement> {
  (event: React.ChangeEvent<T>): void;
}

export interface ClickEventHandler<T = HTMLButtonElement> {
  (event: React.MouseEvent<T>): void;
}

// Theme and styling types
export interface ThemeColors {
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  info: string;
  success: string;
}

export interface SxPropsType {
  [key: string]: unknown;
}

// Navigation and routing types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType;
  roles?: string[];
  children?: NavigationItem[];
}

// Form related types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Chart and analytics types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartDataPoint[];
  options?: Record<string, unknown>;
}

// Settings and preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminders: boolean;
  achievements: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  activityVisible: boolean;
  allowDataSharing: boolean;
}

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// File and media types
export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
}
