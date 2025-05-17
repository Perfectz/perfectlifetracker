/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MoodChart from '../MoodChart';
import { useJournalEntries } from '../../../hooks/useJournals';
import { format, parseISO } from 'date-fns';

// Mock the useJournalEntries hook
jest.mock('../../../hooks/useJournals');

// Mock the Recharts components to simplify testing
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />
}));

describe('MoodChart Component', () => {
  const mockData = [
    { date: '2023-05-01', sentiment: 0.8, id: 'entry1' },
    { date: '2023-05-02', sentiment: 0.3, id: 'entry2' },
    { date: '2023-05-03', sentiment: 0.6, id: 'entry3' }
  ];

  // Mock the cursor-based pagination response structure
  const mockPaginatedResponse = {
    items: [
      { id: 'entry1', date: '2023-05-01', sentimentScore: 0.8 },
      { id: 'entry2', date: '2023-05-02', sentimentScore: 0.3 },
      { id: 'entry3', date: '2023-05-03', sentimentScore: 0.6 }
    ],
    hasMore: false,
    nextCursor: undefined
  };

  beforeEach(() => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    render(<MoodChart />);
    expect(screen.getByTestId('mood-chart-loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch data')
    });

    render(<MoodChart />);
    expect(screen.getByTestId('mood-chart-error')).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      data: { items: [], hasMore: false },
      isLoading: false,
      error: null
    });

    render(<MoodChart />);
    expect(screen.getByTestId('mood-chart-empty')).toBeInTheDocument();
    expect(screen.getByText(/No mood data available/i)).toBeInTheDocument();
  });

  it('renders chart with API data correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      data: mockPaginatedResponse,
      isLoading: false,
      error: null
    });

    render(<MoodChart />);
    expect(screen.getByTestId('mood-chart-container')).toBeInTheDocument();
    expect(screen.getByText('Your Mood Trends')).toBeInTheDocument();
    expect(screen.getByTestId('mood-chart')).toBeInTheDocument();
  });

  it('renders chart with provided data correctly', () => {
    render(<MoodChart data={mockData} title="Custom Title" />);
    
    expect(screen.getByTestId('mood-chart-container')).toBeInTheDocument();
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByTestId('mood-chart')).toBeInTheDocument();
    
    // Verify API was not called when data is provided directly
    expect(useJournalEntries).toHaveBeenCalledWith(undefined, 30, undefined, false);
  });

  it('renders with custom height', () => {
    render(<MoodChart data={mockData} height={500} />);
    
    const chartContainer = screen.getByTestId('mood-chart');
    expect(chartContainer).toHaveStyle('height: 500px');
  });

  it('handles correctly paginated data with cursor', () => {
    const paginatedResponse = {
      ...mockPaginatedResponse,
      hasMore: true,
      nextCursor: 'next-page-cursor'
    };
    
    (useJournalEntries as jest.Mock).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      error: null
    });

    render(<MoodChart />);
    expect(screen.getByTestId('mood-chart-container')).toBeInTheDocument();
    
    // Check that the cursor parameter is passed correctly (as undefined for initial load)
    expect(useJournalEntries).toHaveBeenCalledWith(undefined, 30, undefined, true);
  });
}); 