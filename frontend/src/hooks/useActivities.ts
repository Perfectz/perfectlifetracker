// frontend/src/hooks/useActivities.ts
// Custom hooks for activities using React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import activityService, { 
  Activity, 
  ActivityFilterParams,
  CreateActivityRequest,
  UpdateActivityRequest,
  PaginatedResponse
} from '../services/activityService';

// Keys for React Query
export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: ActivityFilterParams | undefined) => [...activityKeys.lists(), { filters }] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
};

/**
 * Hook to fetch activities with filtering and pagination
 * @param filters Optional filter parameters
 */
export function useActivities(filters?: ActivityFilterParams) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => activityService.getActivities(filters),
    placeholderData: (previousData) => previousData,
    select: (data: PaginatedResponse<Activity>) => data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single activity by ID
 */
export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: activityKeys.detail(id || 'undefined'),
    queryFn: () => id ? activityService.getActivityById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (newActivity: CreateActivityRequest) => activityService.createActivity(newActivity),
    onSuccess: () => {
      // Invalidate activities list query
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      
      // Navigate back to activities list
      navigate('/activities');
      
      // Show success toast
      toast.success('Activity logged successfully');
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(error.message || 'Failed to log activity');
    },
  });
}

/**
 * Hook to update an existing activity
 */
export function useUpdateActivity(id: string | undefined) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  type MutationContext = {
    previousActivity?: Activity;
  };

  return useMutation({
    mutationFn: (updates: UpdateActivityRequest) => {
      if (!id) {
        return Promise.reject('No ID provided');
      }
      return activityService.updateActivity(id, updates);
    },
    onMutate: async (updates) => {
      if (!id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: activityKeys.detail(id) });

      // Snapshot the previous value
      const previousActivity = queryClient.getQueryData<Activity>(activityKeys.detail(id));

      // Optimistically update to the new value
      if (previousActivity) {
        queryClient.setQueryData<Activity>(activityKeys.detail(id), {
          ...previousActivity,
          ...updates,
        });
      }

      // Return the snapshot for rollback on error
      return { previousActivity };
    },
    onSuccess: () => {
      // Invalidate activities list and detail queries
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      if (id) {
        queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      }
      
      // Navigate back to activities list
      navigate('/activities');
      
      // Show success toast
      toast.success('Activity updated successfully');
    },
    onError: (error: Error, _variables, context: MutationContext | undefined) => {
      // Show error toast
      toast.error(error.message || 'Failed to update activity');
      
      // Rollback to previous value on error
      if (id && context?.previousActivity) {
        queryClient.setQueryData(activityKeys.detail(id), context.previousActivity);
      }
    },
  });
}

/**
 * Hook to delete an activity
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  type MutationContext = {
    previousData?: PaginatedResponse<Activity>;
  };

  return useMutation({
    mutationFn: (id: string) => activityService.deleteActivity(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: activityKeys.lists() });

      // Get current data
      const previousData = queryClient.getQueryData<PaginatedResponse<Activity>>(activityKeys.lists());

      // Optimistically update (remove the deleted activity)
      if (previousData && previousData.items) {
        queryClient.setQueryData<PaginatedResponse<Activity>>(
          activityKeys.lists(),
          {
            ...previousData,
            items: previousData.items.filter(activity => activity.id !== deletedId),
            total: previousData.total - 1
          }
        );
      }

      // Return the snapshot for rollback on error
      return { previousData };
    },
    onSuccess: () => {
      // Show success toast
      toast.success('Activity deleted successfully');
    },
    onError: (error: Error, _variables, context: MutationContext | undefined) => {
      // Show error toast
      toast.error(error.message || 'Failed to delete activity');
      
      // Rollback to previous list on error
      if (context?.previousData) {
        queryClient.setQueryData(activityKeys.lists(), context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

/**
 * Hook to get activity types
 * @returns Array of activity types
 */
export function useActivityTypes() {
  return activityService.getActivityTypes();
} 