// frontend/src/components/goals/GoalDetail.test.tsx
// Tests for the GoalDetail component

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import GoalDetail from './GoalDetail';
import { useGoal } from '../../hooks/useGoals';

// Mock the recharts library
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container">{children}</div>
    ),
    AreaChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-area-chart">{children}</div>
    ),
    Area: () => <div data-testid="recharts-area" />,
    XAxis: () => <div data-testid="recharts-x-axis" />,
    YAxis: () => <div data-testid="recharts-y-axis" />,
    CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
    Tooltip: () => <div data-testid="recharts-tooltip" />,
    Legend: () => <div data-testid="recharts-legend" />,
  };
});

// Mock the useGoal hook
jest.mock('../../hooks/useGoals', () => ({
  useGoal: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('GoalDetail Component', () => {
  const mockGoal = {
    id: '123',
    userId: 'user123',
    title: 'Run 5K',
    targetDate: '2023-12-31T00:00:00.000Z',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-15T00:00:00.000Z',
    notes: 'Train 3 times per week',
    achieved: false,
    progress: 60
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    (useGoal as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/goals/123']}>
        <Routes>
          <Route path="/goals/:id" element={<GoalDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(useGoal).toHaveBeenCalledWith('123');
  });

  test('renders error state', () => {
    (useGoal as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch goal')
    });

    render(
      <MemoryRouter initialEntries={['/goals/123']}>
        <Routes>
          <Route path="/goals/:id" element={<GoalDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to fetch goal')).toBeInTheDocument();
    expect(screen.getByText('Back to Goals')).toBeInTheDocument();
  });

  test('renders goal details successfully', async () => {
    (useGoal as jest.Mock).mockReturnValue({
      data: mockGoal,
      isLoading: false,
      isError: false,
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/goals/123']}>
        <Routes>
          <Route path="/goals/:id" element={<GoalDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Check basic goal information
    expect(screen.getByText('Run 5K')).toBeInTheDocument();
    expect(screen.getByText('Target Date')).toBeInTheDocument();
    expect(screen.getByText('December 31, 2023')).toBeInTheDocument();
    expect(screen.getByText('Train 3 times per week')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument();
    
    // Check progress indicator
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    
    // Check progress chart section
    expect(screen.getByText('Progress Over Time')).toBeInTheDocument();
    
    // Verify chart components are rendered
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-area')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-y-axis')).toBeInTheDocument();
  });

  test('navigates back to goals list when back button is clicked', () => {
    (useGoal as jest.Mock).mockReturnValue({
      data: mockGoal,
      isLoading: false,
      isError: false,
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/goals/123']}>
        <Routes>
          <Route path="/goals/:id" element={<GoalDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const backButton = screen.getByText('Back to Goals');
    backButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/goals');
  });

  test('navigates to edit page when edit button is clicked', () => {
    (useGoal as jest.Mock).mockReturnValue({
      data: mockGoal,
      isLoading: false,
      isError: false,
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/goals/123']}>
        <Routes>
          <Route path="/goals/:id" element={<GoalDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const editButton = screen.getByText('Edit');
    editButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/goals/edit/123');
  });
}); 