// frontend/src/hooks/useAnalytics.ts
// Custom hook for fetching analytics data

import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { callApi } from '../services/apiService';

// Analytics data interface
export interface AnalyticsData {
  totalDuration: number;
  totalCalories: number;
  averageDurationPerDay: number;
  averageCaloriesPerDay: number;
  activityCountByType: Record<string, number>;
  caloriesByType: Record<string, number>;
  durationByType: Record<string, number>;
  activeDays: number;
  activitiesCount: number;
}

interface UseAnalyticsProps {
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

/**
 * Custom hook for fetching analytics data
 * @param startDate Optional start date for analytics period
 * @param endDate Optional end date for analytics period
 * @param enabled Whether the query should auto-fetch (default: true)
 * @returns Query result with analytics data
 */
export const useAnalytics = ({ 
  startDate, 
  endDate, 
  enabled = true 
}: UseAnalyticsProps = {}) => {
  const queryKey = ['analytics', startDate?.toISOString(), endDate?.toISOString()];

  return useQuery<AnalyticsData, Error>(
    queryKey,
    async () => {
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }
      if (endDate) {
        params.append('endDate', format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }

      // Fetch analytics data using the callApi helper
      const queryString = params.toString();
      const url = `/api/analytics/fitness${queryString ? `?${queryString}` : ''}`;
      return callApi<AnalyticsData>(url);
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      keepPreviousData: true,
      retry: 1,
      // Ensure loading is set to false on error
      onError: () => {
        // This ensures isLoading is properly set to false even when errors occur
        return;
      }
    }
  );
};

export default useAnalytics; 