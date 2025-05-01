/// <reference types="jest" />
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HabitForm from '../HabitForm';
import { mockHabits } from '../../../services/mockData';
import { HabitFrequency } from '../../../schemas/habits.schema';

// Mock hooks
jest.mock('../../../hooks/useHabits', () => ({
  useHabitDetail: jest.fn(id => ({
    data: id ? mockHabits.find(h => h.id === id) : null,
    isLoading: false,
    error: null
  })),
  useHabitOperations: jest.fn(() => ({
    createHabit: {
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      error: null
    },
    updateHabit: {
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      error: null
    }
  }))
}));

// Create a wrapper for testing
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
      {children}
    </QueryClientProvider>
  );
};

describe('HabitForm Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
  });

  it('renders create form with correct fields', async () => {
    render(
      <HabitForm open={true} habitId={null} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    // Check title
    expect(screen.getByTestId('habit-form-title')).toHaveTextContent('Add New Habit');
    
    // Check form fields
    expect(screen.getByTestId('habit-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('habit-frequency-select')).toBeInTheDocument();
    expect(screen.getByTestId('habit-description-input')).toBeInTheDocument();
    expect(screen.getByTestId('habit-streak-input')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByTestId('habit-submit-button')).toHaveTextContent('Create');
  });

  it('renders edit form with prefilled values', async () => {
    render(
      <HabitForm open={true} habitId="habit-1" onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    // Check title
    expect(screen.getByTestId('habit-form-title')).toHaveTextContent('Edit Habit');
    
    // Check form fields have correct initial values
    await waitFor(() => {
      expect(screen.getByTestId('habit-name-input')).toHaveValue('Daily Meditation');
      expect(screen.getByTestId('habit-description-input')).toHaveValue('10 minutes of mindfulness meditation each morning');
    });
    
    // Check buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByTestId('habit-submit-button')).toHaveTextContent('Update');
  });

  it('validates required fields', async () => {
    render(
      <HabitForm open={true} habitId={null} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    // Clear the name field
    const nameInput = screen.getByTestId('habit-name-input');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Try to submit the form
    const submitButton = screen.getByTestId('habit-submit-button');
    fireEvent.click(submitButton);
    
    // Check for validation error
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/Name is required/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('closes the form when cancel is clicked', async () => {
    render(
      <HabitForm open={true} habitId={null} onClose={mockOnClose} />,
      { wrapper: createWrapper() }
    );

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
}); 