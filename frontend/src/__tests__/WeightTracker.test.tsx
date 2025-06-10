import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeightTrackerPage from '../pages/WeightTrackerPage';
import * as fitnessService from '../services/fitnessService';

// Mock the fitness service
jest.mock('../services/fitnessService');
const mockedFitnessService = fitnessService as jest.Mocked<typeof fitnessService>;

// Mock data for testing
const mockWeightRecords = [
  {
    id: '1',
    measurementType: 'weight',
    value: 175.5,
    unit: 'lbs',
    date: '2024-01-01T12:00:00.000Z',
    notes: 'Starting weight',
  },
  {
    id: '2',
    measurementType: 'weight',
    value: 174.2,
    unit: 'lbs',
    date: '2024-01-08T12:00:00.000Z',
    notes: 'Week 1 progress',
  },
  {
    id: '3',
    measurementType: 'weight',
    value: 173.8,
    unit: 'lbs',
    date: '2024-01-15T12:00:00.000Z',
    notes: 'Week 2 progress',
  },
];

describe('WeightTracker Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    mockedFitnessService.fetchWeightRecords.mockResolvedValue(mockWeightRecords);
    mockedFitnessService.postWeightRecord.mockResolvedValue({
      id: '4',
      measurementType: 'weight',
      value: 172.5,
      unit: 'lbs',
      date: '2024-01-22T12:00:00.000Z',
    });
    mockedFitnessService.updateWeightRecord.mockResolvedValue({
      id: '2',
      measurementType: 'weight',
      value: 174.0,
      unit: 'lbs',
      date: '2024-01-08T12:00:00.000Z',
      notes: 'Updated weight',
    });
    mockedFitnessService.deleteWeightRecord.mockResolvedValue();
  });

  test('renders weight tracker page', async () => {
    render(<WeightTrackerPage />);
    
    expect(screen.getByText('Weight Tracker')).toBeInTheDocument();
    expect(screen.getByText('Add New Weight Entry')).toBeInTheDocument();
    
    // Wait for records to load
    await waitFor(() => {
      expect(screen.getByText('Weight History (3 entries)')).toBeInTheDocument();
    });
  });

  test('displays weight records correctly', async () => {
    render(<WeightTrackerPage />);
    
    await waitFor(() => {
      expect(screen.getByText('175.5 lbs')).toBeInTheDocument();
      expect(screen.getByText('174.2 lbs')).toBeInTheDocument();
      expect(screen.getByText('173.8 lbs')).toBeInTheDocument();
    });
  });

  test('can add a new weight entry', async () => {
    render(<WeightTrackerPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Weight History (3 entries)')).toBeInTheDocument();
    });
    
    // Fill in the form
    const dateInput = screen.getByLabelText('Date');
    const weightInput = screen.getByLabelText('Weight (lbs)');
    const addButton = screen.getByRole('button', { name: /add entry/i });
    
    fireEvent.change(dateInput, { target: { value: '2024-01-22' } });
    fireEvent.change(weightInput, { target: { value: '172.5' } });
    fireEvent.click(addButton);
    
    // Verify the service was called
    await waitFor(() => {
      expect(mockedFitnessService.postWeightRecord).toHaveBeenCalledWith({
        date: '2024-01-22',
        weight: 172.5,
      });
    });
  });

  test('can edit a weight record', async () => {
    render(<WeightTrackerPage />);
    
    // Wait for records to load
    await waitFor(() => {
      expect(screen.getByText('174.2 lbs')).toBeInTheDocument();
    });
    
    // Click edit button for the second record
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[1]); // Second record (174.2 lbs)
    
    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('Edit Weight Entry')).toBeInTheDocument();
    });
    
    // Update the weight
    const weightInput = screen.getByDisplayValue('174.2');
    fireEvent.change(weightInput, { target: { value: '174.0' } });
    
    // Click update button
    const updateButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(updateButton);
    
    // Verify the service was called
    await waitFor(() => {
      expect(mockedFitnessService.updateWeightRecord).toHaveBeenCalledWith('2', {
        date: '2024-01-08',
        weight: 174.0,
      });
    });
  });

  test('can delete a weight record', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(<WeightTrackerPage />);
    
    // Wait for records to load
    await waitFor(() => {
      expect(screen.getByText('174.2 lbs')).toBeInTheDocument();
    });
    
    // Click delete button for the first record
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Verify the service was called
    await waitFor(() => {
      expect(mockedFitnessService.deleteWeightRecord).toHaveBeenCalledWith('1');
    });
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test('shows empty state when no records exist', async () => {
    mockedFitnessService.fetchWeightRecords.mockResolvedValue([]);
    
    render(<WeightTrackerPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No weight entries yet. Add your first entry above!')).toBeInTheDocument();
      expect(screen.getByText('Weight History (0 entries)')).toBeInTheDocument();
    });
  });

  test('handles form validation', async () => {
    render(<WeightTrackerPage />);
    
    // Try to submit form without filling required fields
    const addButton = screen.getByRole('button', { name: /add entry/i });
    fireEvent.click(addButton);
    
    // Should show validation message
    await waitFor(() => {
      expect(screen.getByText('Please enter both date and weight')).toBeInTheDocument();
    });
    
    // Verify service was not called
    expect(mockedFitnessService.postWeightRecord).not.toHaveBeenCalled();
  });

  test('handles service errors gracefully', async () => {
    mockedFitnessService.fetchWeightRecords.mockRejectedValue(new Error('Service error'));
    
    render(<WeightTrackerPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load weight records')).toBeInTheDocument();
    });
  });
});

describe('Weight Tracking Integration Test', () => {
  test('complete weight tracking workflow', async () => {
    console.log('🏃‍♂️ Running complete weight tracking workflow test...');
    
    // Start with empty records
    mockedFitnessService.fetchWeightRecords.mockResolvedValue([]);
    
    const { rerender } = render(<WeightTrackerPage />);
    
    console.log('📝 Step 1: Adding initial weight...');
    // Add first weight entry
    mockedFitnessService.postWeightRecord.mockResolvedValue({
      id: 'test-1',
      measurementType: 'weight',
      value: 180.0,
      unit: 'lbs',
      date: '2024-01-01T12:00:00.000Z',
      notes: 'Starting weight',
    });
    
    const dateInput = screen.getByLabelText('Date');
    const weightInput = screen.getByLabelText('Weight (lbs)');
    const addButton = screen.getByRole('button', { name: /add entry/i });
    
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(weightInput, { target: { value: '180.0' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockedFitnessService.postWeightRecord).toHaveBeenCalledWith({
        date: '2024-01-01',
        weight: 180.0,
      });
    });
    console.log('✅ Initial weight added successfully');
    
    console.log('📈 Step 2: Simulating weekly progress...');
    // Mock updated records list after adding entries
    const progressRecords = [
      { id: 'test-1', measurementType: 'weight', value: 180.0, unit: 'lbs', date: '2024-01-01T12:00:00.000Z', notes: 'Starting weight' },
      { id: 'test-2', measurementType: 'weight', value: 178.5, unit: 'lbs', date: '2024-01-08T12:00:00.000Z', notes: 'Week 1' },
      { id: 'test-3', measurementType: 'weight', value: 177.2, unit: 'lbs', date: '2024-01-15T12:00:00.000Z', notes: 'Week 2' },
    ];
    
    mockedFitnessService.fetchWeightRecords.mockResolvedValue(progressRecords);
    
    // Rerender to simulate data refresh
    rerender(<WeightTrackerPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Weight History (3 entries)')).toBeInTheDocument();
      expect(screen.getByText('180 lbs')).toBeInTheDocument();
      expect(screen.getByText('178.5 lbs')).toBeInTheDocument();
      expect(screen.getByText('177.2 lbs')).toBeInTheDocument();
    });
    console.log('✅ Progress entries displayed correctly');
    
    console.log('✏️ Step 3: Testing edit functionality...');
    // Test edit functionality
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Edit Weight Entry')).toBeInTheDocument();
    });
    console.log('✅ Edit dialog opened successfully');
    
    console.log('🗑️ Step 4: Testing delete functionality...');
    // Close edit dialog first
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Mock window.confirm for delete
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockedFitnessService.deleteWeightRecord).toHaveBeenCalledWith('test-1');
    });
    console.log('✅ Delete functionality working');
    
    // Restore window.confirm
    window.confirm = originalConfirm;
    
    console.log('🎉 Complete workflow test PASSED!');
    console.log('✅ All weight tracking operations verified');
  });
}); 