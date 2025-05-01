// frontend/src/hooks/useGoals.ts
// Custom hooks for goals using React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as goalService from '../services/goalService';
import { 
  FitnessGoal, 
  CreateGoalRequest,
  UpdateGoalRequest,
  PaginatedResponse,
  PaginationParams
} from '../services/goalService';

// Keys for React Query
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (filters: any) => [...goalKeys.lists(), { filters }] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
};

/**
 * Hook to fetch all goals with pagination
 * @param params Optional pagination parameters
 */
export function useGoals(params?: PaginationParams) {
  return useQuery({
    queryKey: goalKeys.list(params),
    queryFn: () => {
      // Extract page and limit from params to match the service interface
      const page = params?.offset !== undefined && params?.limit 
        ? Math.floor(params.offset / params.limit) + 1 
        : undefined;
      const limit = params?.limit;
      return goalService.getGoals(page, limit);
    },
    placeholderData: previousData => previousData,
    select: (data: PaginatedResponse<FitnessGoal>) => data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single goal by ID
 */
export function useGoal(id: string | undefined) {
  return useQuery({
    queryKey: goalKeys.detail(id || 'undefined'),
    queryFn: () => id ? goalService.getGoalById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (newGoal: CreateGoalRequest) => goalService.createGoal(newGoal),
    onSuccess: () => {
      // Invalidate goals list query
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      // Navigate back to goals list
      navigate('/goals');
      // Show success toast
      toast.success('Goal created successfully');
    },
    onError: (error: any) => {
      // Show error toast
      toast.error(error.message || 'Failed to create goal');
    },
  });
}

/**
 * Hook to update an existing goal
 */
export function useUpdateGoal(id: string | undefined) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (updates: UpdateGoalRequest) => {
      if (!id) {
        return Promise.reject('No ID provided');
      }
      return goalService.updateGoal(id, updates);
    },
    onMutate: async (updates) => {
      if (!id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.detail(id) });

      // Snapshot the previous value
      const previousGoal = queryClient.getQueryData<FitnessGoal>(goalKeys.detail(id));

      // Optimistically update to the new value
      if (previousGoal) {
        queryClient.setQueryData<FitnessGoal>(goalKeys.detail(id), {
          ...previousGoal,
          ...updates,
        });
      }

      // Return the snapshot for rollback on error
      return { previousGoal };
    },
    onSuccess: () => {
      // Invalidate goals list and detail queries
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      if (id) {
        queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) });
      }
      // Navigate back to goals list
      navigate('/goals');
      // Show success toast
      toast.success('Goal updated successfully');
    },
    onError: (error: any, _variables, context: any) => {
      // Show error toast
      toast.error(error.message || 'Failed to update goal');
      // Rollback to previous value on error
      if (id && context?.previousGoal) {
        queryClient.setQueryData(goalKeys.detail(id), context.previousGoal);
      }
    },
  });
}

/**
 * Hook to delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.lists() });

      // Get current data (paginated response)
      const previousData = queryClient.getQueryData<PaginatedResponse<FitnessGoal>>(goalKeys.lists());

      // Optimistically update (remove the deleted goal)
      if (previousData && previousData.items) {
        queryClient.setQueryData<PaginatedResponse<FitnessGoal>>(
          goalKeys.lists(),
          {
            ...previousData,
            items: previousData.items.filter(goal => goal.id !== deletedId),
            total: previousData.total - 1
          }
        );
      }

      // Return the snapshot for rollback on error
      return { previousData };
    },
    onSuccess: () => {
      // Show success toast
      toast.success('Goal deleted successfully');
    },
    onError: (error: any, _variables, context: any) => {
      // Show error toast
      toast.error(error.message || 'Failed to delete goal');
      // Rollback to previous list on error
      if (context?.previousData) {
        queryClient.setQueryData(goalKeys.lists(), context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
} 