// frontend/src/hooks/__tests__/useFitnessSummary.test.ts
// Tests for the useFitnessSummary hook

import { renderHook, waitFor } from '@testing-library/react';
import { wrapper } from '../../testUtils';
import { useFitnessSummary } from '../useFitnessSummary';
import * as apiService from '../../services/apiService';

// Mock the API service
jest.mock('../../services/apiService');

// Ensure jest is available for TypeScript
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('useFitnessSummary Hook', () => {
  const mockSummaryData = {
    summary: 'Great progress! You completed 6 workouts over the last 30 days, burning a total of 2,200 calories. Your consistency is improving, with an average of 45 minutes per session. Keep up the good work!'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch fitness summary with the correct params', async () => {
    // Mock the callApi function
    (apiService.callApi as any).mockResolvedValueOnce(mockSummaryData);

    // Set up date range for test
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');

    // Render the hook with date range
    const { result } = renderHook(() => useFitnessSummary({ startDate, endDate }), {
      wrapper
    });

    // Verify initial loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify the API was called with correct params and method
    expect(apiService.callApi).toHaveBeenCalledTimes(1);
    expect(apiService.callApi).toHaveBeenCalledWith(
      '/api/openai/fitness-summary',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String)
        })
      })
    );

    // Verify the returned data
    expect(result.current.data).toEqual(mockSummaryData);
  });

  it('should handle API errors', async () => {
    // Mock an API error
    const error = new Error('Failed to generate fitness summary');
    (apiService.callApi as any).mockRejectedValueOnce(error);

    // Render the hook
    const { result } = renderHook(() => useFitnessSummary(), {
      wrapper
    });

    // Wait for the query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify error handling
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Failed to generate fitness summary');
    expect(result.current.data).toBeUndefined();
  });

  it('should use longer staleTime for cached AI responses', async () => {
    // Spy on useQuery to check the config
    const useQuerySpy = jest.spyOn(require('react-query'), 'useQuery');
    (apiService.callApi as any).mockResolvedValueOnce(mockSummaryData);

    // Render the hook
    renderHook(() => useFitnessSummary(), { wrapper });

    // Verify staleTime is longer than default
    expect(useQuerySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        staleTime: expect.any(Number)
      })
    );

    // The actual staleTime value should be 30 minutes (in milliseconds)
    const options = useQuerySpy.mock.calls[0][2];
    expect(options.staleTime).toBe(30 * 60 * 1000);
  });
}); 