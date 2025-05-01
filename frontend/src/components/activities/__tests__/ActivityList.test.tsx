// frontend/src/components/activities/__tests__/ActivityList.test.tsx
// Tests for the ActivityList component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ActivityList from '../ActivityList';

// Mock the activities hooks
jest.mock('../../../hooks/useActivities', () => ({
  useActivities: () => ({
    data: {
      items: [
        {
          id: 'activity-1',
          userId: 'user-1',
          type: 'Running',
          duration: 30,
          calories: 300,
          date: '2023-07-01T08:00:00.000Z',
          createdAt: '2023-07-01T09:30:00.000Z',
          updatedAt: '2023-07-01T09:30:00.000Z',
          notes: 'Morning run in the park.'
        },
        {
          id: 'activity-2',
          userId: 'user-1',
          type: 'Cycling',
          duration: 45,
          calories: 400,
          date: '2023-07-03T17:00:00.000Z',
          createdAt: '2023-07-03T18:00:00.000Z',
          updatedAt: '2023-07-03T18:00:00.000Z',
          notes: 'Evening bike ride along the river.'
        }
      ],
      total: 2,
      limit: 10,
      offset: 0
    },
    isLoading: false,
    isError: false,
    error: null
  }),
  useDeleteActivity: () => ({
    mutate: jest.fn(),
    isPending: false
  }),
  useActivityTypes: () => ['Running', 'Cycling', 'Swimming']
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Create a wrapper with required providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ActivityList', () => {
  it('renders the activity list with correct data', () => {
    render(<ActivityList />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Activity History')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Cycling')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('Morning run in the park.')).toBeInTheDocument();
    expect(screen.getByText('Evening bike ride along the river.')).toBeInTheDocument();
  });
  
  it('shows filter controls when show filters button is clicked', () => {
    render(<ActivityList />, { wrapper: createWrapper() });
    
    // Initially, filter controls should not be visible
    expect(screen.queryByLabelText('Activity Type')).not.toBeInTheDocument();
    
    // Click the show filters button
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Now filter controls should be visible
    expect(screen.getByLabelText('Activity Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });
  
  it('opens delete confirmation dialog when delete button is clicked', () => {
    render(<ActivityList />, { wrapper: createWrapper() });
    
    // Find delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /delete activity/i });
    expect(deleteButtons.length).toBe(2);
    
    // Click the first delete button
    fireEvent.click(deleteButtons[0]);
    
    // Dialog should appear with confirmation text
    expect(screen.getByText('Delete Activity')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this activity? This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });
}); 