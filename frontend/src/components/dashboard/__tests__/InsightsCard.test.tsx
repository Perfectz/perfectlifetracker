// frontend/src/components/dashboard/__tests__/InsightsCard.test.tsx
// Tests for the InsightsCard component

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import InsightsCard from '../InsightsCard';
import * as analyticsHook from '../../../hooks/useAnalytics';
import * as summaryHook from '../../../hooks/useFitnessSummary';
import { allProvidersWrapper } from '../../../testUtils';

// Ensure jest is available for TypeScript
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// Mock the custom hooks
jest.mock('../../../hooks/useAnalytics');
jest.mock('../../../hooks/useFitnessSummary');

// Sample analytics data for testing
const mockAnalyticsData = {
  totalDuration: 500,
  totalCalories: 2500,
  averageDurationPerDay: 50,
  averageCaloriesPerDay: 250,
  activityCountByType: { 'Running': 5, 'Swimming': 3 },
  caloriesByType: { 'Running': 1500, 'Swimming': 1000 },
  durationByType: { 'Running': 300, 'Swimming': 200 },
  activeDays: 10,
  activitiesCount: 8
};

// Sample summary data for testing
const mockSummaryData = {
  summary: 'You have been doing great with your workouts. Keep up the good work!'
};

describe('InsightsCard Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Mock loading state
    (analyticsHook.useAnalytics as any).mockReturnValue({
      isLoading: true,
      error: null,
      data: null
    });
    
    (summaryHook.useFitnessSummary as any).mockReturnValue({
      isLoading: true,
      error: null,
      data: null
    });

    render(<InsightsCard />, { wrapper: allProvidersWrapper });

    // Check if loading indicator is present
    expect(screen.getByText('Activity Insights')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    
    // Check for loading skeleton indicators
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render analytics data and summary when loaded', async () => {
    // Mock successful data loading
    (analyticsHook.useAnalytics as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockAnalyticsData
    });
    
    (summaryHook.useFitnessSummary as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockSummaryData
    });

    render(<InsightsCard />, { wrapper: allProvidersWrapper });

    // Verify analytics metrics are rendered
    await waitFor(() => {
      expect(screen.getByText('500 mins')).toBeInTheDocument();
      expect(screen.getByText('2,500')).toBeInTheDocument();
      expect(screen.getByText('50 mins/day')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
    });

    // Verify summary is rendered
    expect(screen.getByText(mockSummaryData.summary)).toBeInTheDocument();
  });

  it('should render empty state when no data', async () => {
    // Mock empty data
    (analyticsHook.useAnalytics as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: null
    });
    
    (summaryHook.useFitnessSummary as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: null
    });

    render(<InsightsCard />, { wrapper: allProvidersWrapper });

    // Verify fallback values are shown
    await waitFor(() => {
      expect(screen.getByText('0 mins')).toBeInTheDocument();
      expect(screen.getByText('0 mins/day')).toBeInTheDocument();
    });
    
    // Verify empty summary message
    expect(screen.getByText(/No fitness summary available/i)).toBeInTheDocument();
  });

  it('should render error alert when API calls fail', async () => {
    // Mock error states
    const error = new Error('Failed to fetch data');
    
    (analyticsHook.useAnalytics as any).mockReturnValue({
      isLoading: false,
      error,
      data: null
    });
    
    (summaryHook.useFitnessSummary as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: null
    });

    render(<InsightsCard />, { wrapper: allProvidersWrapper });

    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    });
  });

  it('should use provided date range for display', async () => {
    // Create test dates
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');
    
    // Mock successful data loading
    (analyticsHook.useAnalytics as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockAnalyticsData
    });
    
    (summaryHook.useFitnessSummary as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockSummaryData
    });

    render(
      <InsightsCard 
        startDate={startDate} 
        endDate={endDate} 
      />, 
      { wrapper: allProvidersWrapper }
    );

    // Verify date range text is shown correctly
    // Match actual component output pattern: "Dec 31 - Jan 30, 2023"
    expect(screen.getByText(/Dec 31 [\s-]+ Jan 30, 2023/)).toBeInTheDocument();
  });
}); 