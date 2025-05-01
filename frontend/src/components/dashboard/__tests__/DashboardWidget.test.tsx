// frontend/src/components/dashboard/__tests__/DashboardWidget.test.tsx
// Tests for the DashboardWidget component

import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardWidget from '../DashboardWidget';
import * as analyticsHook from '../../../hooks/useAnalytics';
import * as summaryHook from '../../../hooks/useFitnessSummary';
import { allProvidersWrapper } from '../../../testUtils';

// Mock the custom hooks
jest.mock('../../../hooks/useAnalytics');
jest.mock('../../../hooks/useFitnessSummary');
// Mock InsightsCard to isolate dashboard testing
jest.mock('../InsightsCard', () => {
  return {
    __esModule: true,
    default: ({ startDate, endDate }: any) => (
      <div data-testid="insights-card" data-startdate={startDate?.toISOString()} data-enddate={endDate?.toISOString()}>
        Mock Insights Card
      </div>
    )
  };
});

describe('DashboardWidget Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the dashboard with title and widgets', () => {
    render(<DashboardWidget />, { wrapper: allProvidersWrapper });

    // Check if dashboard title is rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check if the welcome text is rendered
    expect(screen.getByText(/Welcome to your health and fitness dashboard/)).toBeInTheDocument();
    
    // Check if the Quick Stats title is rendered
    expect(screen.getByText('Quick Stats')).toBeInTheDocument();

    // Check if all the widgets are rendered
    expect(screen.getByText('Fitness Progress')).toBeInTheDocument();
    expect(screen.getByText('Activity Streak')).toBeInTheDocument();
    expect(screen.getByText('Health Score')).toBeInTheDocument();
    expect(screen.getByText('Improvement')).toBeInTheDocument();
  });

  it('should integrate InsightsCard with proper date range', () => {
    render(<DashboardWidget />, { wrapper: allProvidersWrapper });

    // Verify the insights card is included
    const insightsCard = screen.getByTestId('insights-card');
    expect(insightsCard).toBeInTheDocument();

    // Verify date props are passed (should be roughly 30 days apart)
    const startDateStr = insightsCard.getAttribute('data-startdate');
    const endDateStr = insightsCard.getAttribute('data-enddate');
    
    expect(startDateStr).not.toBeNull();
    expect(endDateStr).not.toBeNull();

    // Verify the dates are approximately 30 days apart
    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const dayDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(dayDiff).toBe(30);
    }
  });

  it('should display the note about placeholder data', () => {
    render(<DashboardWidget />, { wrapper: allProvidersWrapper });
    
    expect(screen.getByText(/Some widgets display placeholder data/)).toBeInTheDocument();
  });
}); 