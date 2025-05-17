// frontend/src/hooks/queryKeys.ts
// Centralized React Query key definitions

/**
 * Query keys for journals feature
 */
export const JOURNAL_KEYS = {
  all: ['journals'] as const,
  lists: () => [...JOURNAL_KEYS.all, 'list'] as const,
  list: (filters: any) => [...JOURNAL_KEYS.lists(), { filters }] as const,
  details: () => [...JOURNAL_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOURNAL_KEYS.details(), id] as const,
  search: (query: string) => [...JOURNAL_KEYS.all, 'search', query] as const,
};

/**
 * Query keys for habits feature
 */
export const HABIT_KEYS = {
  all: ['habits'] as const,
  lists: () => [...HABIT_KEYS.all, 'list'] as const,
  list: (filters: any) => [...HABIT_KEYS.lists(), { filters }] as const,
  details: () => [...HABIT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...HABIT_KEYS.details(), id] as const,
};

/**
 * Query keys for analytics 
 */
export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  dashboard: () => [...ANALYTICS_KEYS.all, 'dashboard'] as const,
  insights: (timeFrame: string) => [...ANALYTICS_KEYS.all, 'insights', timeFrame] as const,
};

/**
 * Query keys for profile data
 */
export const PROFILE_KEYS = {
  all: ['profile'] as const,
  detail: () => [...PROFILE_KEYS.all, 'detail'] as const,
  avatar: () => [...PROFILE_KEYS.all, 'avatar'] as const,
}; 