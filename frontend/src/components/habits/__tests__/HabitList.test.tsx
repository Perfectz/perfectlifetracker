/// <reference types="jest" />
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HabitList from '../HabitList';
import { mockHabits } from '../../../services/mockData';

// Mock the habit hooks
jest.mock('../../../hooks/useHabits', () => ({
  useHabitsList: jest.fn(() => ({
    data: {
      items: mockHabits,
      total: mockHabits.length,
      limit: 10,
      offset: 0
    },
    isLoading: false,
    error: null,
    refetch: jest.fn()
  })),
  useHabitOperations: jest.fn(() => ({
    deleteHabit: {
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      isLoading: false,
      error: null
    }
  }))
}));

// Mock the habit form component
jest.mock('../HabitForm', () => {
  return {
    __esModule: true,
    default: jest.fn(({ open, onClose }) => (
      <div data-testid="mock-habit-form">
        {open && (
          <>
            <span>Habit Form</span>
            <button onClick={onClose}>Close</button>
          </>
        )}
      </div>
    ))
  };
});

describe('HabitList Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Clear mocks
    jest.clearAllMocks();
  });

  it('renders the habits list successfully', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HabitList />
      </QueryClientProvider>
    );

    // Check page title
    expect(screen.getByText('Habits Tracker')).toBeInTheDocument();
    
    // Check for add button
    expect(screen.getByText('Add Habit')).toBeInTheDocument();
    
    // Check if habits are rendered
    await waitFor(() => {
      // Look for habits from mock data
      expect(screen.getByText('Daily Meditation')).toBeInTheDocument();
      expect(screen.getByText('Weekly Meal Prep')).toBeInTheDocument();
      expect(screen.getByText('Read Books')).toBeInTheDocument();
    });
  });

  it('opens habit form when add button is clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HabitList />
      </QueryClientProvider>
    );

    // Click the Add Habit button
    fireEvent.click(screen.getByText('Add Habit'));
    
    // Check if form appears
    await waitFor(() => {
      expect(screen.getByTestId('mock-habit-form')).toBeInTheDocument();
      expect(screen.getByText('Habit Form')).toBeInTheDocument();
    });
  });

  it('displays edit and delete buttons for each habit', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HabitList />
      </QueryClientProvider>
    );

    // Check for edit and delete buttons
    await waitFor(() => {
      const editButtons = screen.getAllByLabelText('edit');
      const deleteButtons = screen.getAllByLabelText('delete');
      
      // We have 5 mock habits, so we should have 5 edit and 5 delete buttons
      expect(editButtons.length).toBe(5);
      expect(deleteButtons.length).toBe(5);
    });
  });
}); 