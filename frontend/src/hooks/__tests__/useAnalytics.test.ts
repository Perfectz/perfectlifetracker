// frontend/src/hooks/__tests__/useAnalytics.test.ts
// Tests for the useAnalytics hook

import { renderHook, waitFor } from '@testing-library/react';
import { wrapper } from '../../testUtils';
import { useAnalytics } from '../useAnalytics';
import * as apiService from '../../services/apiService';

// Mock the API service
jest.mock('../../services/apiService');

// Ensure jest is available for TypeScript
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('useAnalytics Hook', () => {
  const mockAnalyticsData = {
    totalDuration: 450,
    totalCalories: 2200,
    averageDurationPerDay: 45,
    averageCaloriesPerDay: 220,
    activityCountByType: { 'Running': 4, 'Cycling': 2 },
    caloriesByType: { 'Running': 1200, 'Cycling': 1000 },
    durationByType: { 'Running': 240, 'Cycling': 210 },
    activeDays: 10,
    activitiesCount: 6
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch analytics data with the correct params', async () => {
    // Mock the callApi function
    (apiService.callApi as any).mockResolvedValueOnce(mockAnalyticsData);

    // Set up date range for test
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');

    // Render the hook with date range
    const { result } = renderHook(() => useAnalytics({ startDate, endDate }), {
      wrapper
    });

    // Verify initial loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify the API was called with correct params
    expect(apiService.callApi).toHaveBeenCalledTimes(1);
    expect(apiService.callApi).toHaveBeenCalledWith(
      expect.stringContaining('/api/analytics/fitness?startDate=')
    );

    // Verify the returned data
    expect(result.current.data).toEqual(mockAnalyticsData);
  });

  it('should handle API errors', async () => {
    // Mock an API error
    const error = new Error('Failed to fetch analytics data');
    (apiService.callApi as any).mockRejectedValueOnce(error);

    // Render the hook
    const { result } = renderHook(() => useAnalytics(), {
      wrapper
    });

    // Wait for the query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify error handling
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Failed to fetch analytics data');
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch when enabled is false', async () => {
    // Render the hook with enabled=false
    const { result } = renderHook(() => useAnalytics({ enabled: false }), {
      wrapper
    });

    // Verify it doesn't load
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetched).toBe(false);
    
    // Verify API was not called
    expect(apiService.callApi).not.toHaveBeenCalled();
  });
}); 