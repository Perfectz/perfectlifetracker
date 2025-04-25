// frontend/src/components/activities/__tests__/MetricsSummary.test.tsx
// Tests for the MetricsSummary component

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricsSummary from '../MetricsSummary';
import { Activity } from '../../../services/activityService';

describe('MetricsSummary Component', () => {
  // Test data
  const mockActivities: Activity[] = [
    { 
      id: '1', 
      name: 'Morning Run', 
      type: 'running', 
      date: '2023-05-01', 
      duration: 30, 
      calories: 300,
      notes: ''
    },
    { 
      id: '2', 
      name: 'Evening Walk', 
      type: 'walking', 
      date: '2023-05-01', 
      duration: 45, 
      calories: 200,
      notes: ''
    },
    { 
      id: '3', 
      name: 'Cycling', 
      type: 'cycling', 
      date: '2023-05-02', 
      duration: 60, 
      calories: 500,
      notes: ''
    }
  ];

  test('renders loading state', () => {
    render(<MetricsSummary activities={[]} isLoading={true} />);
    
    // Check if the loading spinner is displayed
    const loadingElement = screen.getByLabelText(/loading activity summary/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('renders empty state when no activities provided', () => {
    render(<MetricsSummary activities={[]} isLoading={false} />);
    
    // Check if the empty state message is displayed
    const emptyStateMsg = screen.getByText(/no activities to summarize/i);
    expect(emptyStateMsg).toBeInTheDocument();
  });

  test('calculates and displays correct metrics', () => {
    render(<MetricsSummary activities={mockActivities} isLoading={false} />);
    
    // 1. Total Duration: 30 + 45 + 60 = 135 minutes
    const totalTimeElement = screen.getByText('135 mins');
    expect(totalTimeElement).toBeInTheDocument();
    
    // 2. Total Calories: 300 + 200 + 500 = 1,000 calories
    const totalCaloriesElement = screen.getByText('1,000');
    expect(totalCaloriesElement).toBeInTheDocument();
    expect(screen.getByText(/burned across 3 activities/i)).toBeInTheDocument();
    
    // 3. Average Duration: 135 / 2 = 67.5 mins/day (2 unique days)
    const avgDurationElement = screen.getByText('67.5 mins/day');
    expect(avgDurationElement).toBeInTheDocument();
    
    // 4. Active Days: 2 days (use the parent element to ensure we get the correct one)
    const activeDaysElementsWrapper = screen.getAllByRole('heading', { level: 4 });
    const activeDaysElement = activeDaysElementsWrapper.find(el => el.textContent === '2');
    expect(activeDaysElement).toBeInTheDocument();
    expect(screen.getByText(/days with logged activities/i)).toBeInTheDocument();
  });

  test('displays hours format for durations over 60 minutes', () => {
    render(<MetricsSummary activities={mockActivities} isLoading={false} />);
    
    // Check for hours formatting: 135 mins = 2 hours, 15 minutes
    const hoursText = screen.getByText(/\(2 hours, 15 minutes\)/i);
    expect(hoursText).toBeInTheDocument();
  });

  test('handles single activity correctly', () => {
    const singleActivity = [mockActivities[0]];
    render(<MetricsSummary activities={singleActivity} isLoading={false} />);
    
    // Check metrics with a single activity - use more specific selector to avoid duplicates
    const headings = screen.getAllByRole('heading', { level: 4 });
    const totalTimeHeading = headings.find(el => el.textContent === '30 mins');
    const avgDurationHeading = headings.find(el => el.textContent === '30 mins/day');
    
    expect(totalTimeHeading).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument(); 
    expect(screen.getByText(/burned across 1 activit/i)).toBeInTheDocument();
    expect(avgDurationHeading).toBeInTheDocument();
    
    // Find the active days element
    const activeDaysHeading = headings.find(el => el.textContent === '1');
    expect(activeDaysHeading).toBeInTheDocument();
  });
}); 