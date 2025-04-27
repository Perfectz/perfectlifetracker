// frontend/src/hooks/useFitnessSummary.ts
// Custom hook for fetching AI-generated fitness summaries

import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { callApi } from '../services/apiService';

// Fitness summary response interface
export interface FitnessSummaryResponse {
  summary: string;
}

interface UseFitnessSummaryProps {
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

/**
 * Custom hook for fetching AI-generated fitness summaries
 * @param startDate Optional start date for summary period
 * @param endDate Optional end date for summary period
 * @param enabled Whether the query should auto-fetch (default: true)
 * @returns Query result with fitness summary data
 */
export const useFitnessSummary = ({
  startDate,
  endDate,
  enabled = true
}: UseFitnessSummaryProps = {}) => {
  const queryKey = ['fitness-summary', startDate?.toISOString(), endDate?.toISOString()];

  return useQuery<FitnessSummaryResponse, Error>(
    queryKey,
    async () => {
      // Prepare request body with date range
      const body: Record<string, string> = {};
      if (startDate) {
        body.startDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      }
      if (endDate) {
        body.endDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      }

      // Fetch fitness summary using the callApi helper
      const url = '/api/openai/fitness-summary';
      return callApi<FitnessSummaryResponse>(
        url,
        {
          method: 'POST',
          body
        }
      );
    },
    {
      enabled,
      staleTime: 30 * 60 * 1000, // 30 minutes (longer for AI-generated content)
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

export default useFitnessSummary; 