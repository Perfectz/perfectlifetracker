import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHabits, 
  getHabit, 
  createHabit as apiCreateHabit, 
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  getStreakData,
  Habit, 
  HabitListResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  StreakData
} from '../services/habitService';
import { useCallback } from 'react';
import { 
  CreateHabitInput, 
  UpdateHabitInput
} from '../schemas/habits.schema';
import { toast } from 'react-toastify';

// Habits query keys
const HABITS_KEY = 'habits';
const HABIT_DETAIL_KEY = 'habit-detail';
const STREAK_DATA_KEY = 'streak-data';

// Query keys
const HABITS_KEYS = {
  all: ['habits'] as const,
  lists: () => [...HABITS_KEYS.all, 'list'] as const,
  list: (page: number, limit: number) => [...HABITS_KEYS.lists(), { page, limit }] as const,
  details: () => [...HABITS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...HABITS_KEYS.details(), id] as const,
};

// Hook to fetch habits list with pagination
export const useHabitsList = (page: number, limit: number) => {
  return useQuery<HabitListResponse, Error>({
    queryKey: HABITS_KEYS.list(page, limit),
    queryFn: () => getHabits(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: page > 0 && limit > 0,
  });
};

// Hook to fetch a single habit by ID
export const useHabitDetail = (id: string, options = {}) => {
  return useQuery<Habit, Error>({
    queryKey: HABITS_KEYS.detail(id),
    queryFn: () => getHabit(id),
    enabled: !!id,
    ...options,
  });
};

// Hook to get streak data based on habits
export const useStreakData = (
  habits: Habit[] = []
) => {
  return useQuery({
    queryKey: [STREAK_DATA_KEY, habits.map(h => h.id).join('-')],
    queryFn: () => getStreakData(habits),
    enabled: habits.length > 0,
    // Data won't change frequently, so cache it longer
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to perform habit operations (create, update, delete)
export const useHabitOperations = () => {
  const queryClient = useQueryClient();

  // Create habit mutation - use the API's CreateHabitRequest type
  const createHabit = useMutation<Habit, Error, CreateHabitRequest>({
    mutationFn: (data: CreateHabitRequest) => apiCreateHabit(data),
    onSuccess: () => {
      // Invalidate habits list to refetch
      queryClient.invalidateQueries({ queryKey: HABITS_KEYS.lists() });
      toast.success('Habit created successfully!');
    },
    onError: (error: Error) => {
      console.error('Error creating habit:', error);
      toast.error(`Failed to create habit: ${error.message}`);
    },
  });

  // Update habit mutation - separate id and update data properly
  const updateHabit = useMutation<Habit, Error, { id: string; data: UpdateHabitRequest }>({
    mutationFn: ({ id, data }) => apiUpdateHabit(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific habit and lists
      queryClient.invalidateQueries({ queryKey: HABITS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: HABITS_KEYS.lists() });
      toast.success('Habit updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Error updating habit:', error);
      toast.error(`Failed to update habit: ${error.message}`);
    },
  });

  // Delete habit mutation
  const deleteHabit = useMutation<void, Error, string>({
    mutationFn: (id: string) => apiDeleteHabit(id),
    onSuccess: () => {
      // Invalidate habits list to refetch
      queryClient.invalidateQueries({ queryKey: HABITS_KEYS.lists() });
      toast.success('Habit deleted successfully!');
    },
    onError: (error: Error) => {
      console.error('Error deleting habit:', error);
      toast.error(`Failed to delete habit: ${error.message}`);
    },
  });

  return {
    createHabit,
    updateHabit: {
      ...updateHabit,
      // Convenience wrapper to match previous API
      mutateAsync: async (id: string, data: UpdateHabitInput) => 
        updateHabit.mutateAsync({ id, data })
    },
    deleteHabit,
  };
}; 