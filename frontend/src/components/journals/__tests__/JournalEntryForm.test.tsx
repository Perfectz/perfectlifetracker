/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JournalEntryForm from '../JournalEntryForm';
import { useCreateJournalEntry, useUpdateJournalEntry } from '../../../hooks/useJournals';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Mock the hooks
jest.mock('../../../hooks/useJournals', () => ({
  useCreateJournalEntry: jest.fn(),
  useUpdateJournalEntry: jest.fn(),
  useJournalEntries: jest.fn(),
  useUploadAttachment: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    error: null
  })
}));

// Mock SimpleMDE Editor
jest.mock('react-simplemde-editor', () => {
  return function MockSimpleMDE({ value, onChange }) {
    return (
      <textarea 
        data-testid="markdown-editor"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

// Mock ReactMarkdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return <div data-testid="markdown-preview">{children}</div>;
  };
});

// Mock CSS import
jest.mock('easymde/dist/easymde.min.css', () => ({}));

// Mock journal entry
const mockJournalEntry = {
  id: '123',
  userId: 'user1',
  content: 'Test journal entry content',
  contentFormat: 'markdown' as 'markdown' | 'plain',
  date: '2023-07-15T10:30:00Z',
  sentimentScore: 0.75,
  attachments: [],
  tags: ['personal', 'reflection'],
  createdAt: '2023-07-15T10:30:00Z',
  updatedAt: '2023-07-15T10:30:00Z'
};

describe('JournalEntryForm Component', () => {
  const mockCreateMutation = {
    mutate: jest.fn(),
    isPending: false,
    error: null
  };

  const mockUpdateMutation = {
    mutate: jest.fn(),
    isPending: false,
    error: null
  };

  // Wrapper component to provide context providers
  const TestWrapper = ({ children }) => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {children}
    </LocalizationProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
    (useCreateJournalEntry as jest.Mock).mockReturnValue(mockCreateMutation);
    (useUpdateJournalEntry as jest.Mock).mockReturnValue(mockUpdateMutation);
  });

  it('renders form correctly when creating a new entry', () => {
    render(
      <JournalEntryForm 
        onSubmit={() => {}} 
      />, 
      { wrapper: TestWrapper }
    );
    
    // Check for format radio buttons
    expect(screen.getByLabelText('Plain Text')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown')).toBeInTheDocument();
    
    // Check for date picker
    expect(screen.getByLabelText(/choose date/i)).toBeInTheDocument();
    
    // Check for content field
    expect(screen.getByLabelText(/journal content/i)).toBeInTheDocument();
  });

  it('renders form with initial values when editing an entry', () => {
    render(
      <JournalEntryForm 
        initialValues={mockJournalEntry}
        onSubmit={() => {}}
      />, 
      { wrapper: TestWrapper }
    );
    
    // In Markdown mode, the editor is displayed differently
    // Check that markdown radio is selected
    const markdownRadio = screen.getByLabelText('Markdown') as HTMLInputElement;
    expect(markdownRadio.checked).toBe(true);
    
    // Check for initial tags
    mockJournalEntry.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('handles form submission correctly when creating a new entry', async () => {
    // Implement mock success callback for mutation
    const onSubmitMock = jest.fn();
    render(
      <JournalEntryForm onSubmit={onSubmitMock} />, 
      { wrapper: TestWrapper }
    );
    
    // Set content in text field
    const contentField = screen.getByLabelText(/journal content/i);
    fireEvent.change(contentField, { target: { value: 'New content' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create journal entry/i });
    fireEvent.click(submitButton);
    
    // Verify onSubmit was called with correct data
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'New content',
        contentFormat: 'plain'
      })
    );
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancelMock = jest.fn();
    render(
      <JournalEntryForm 
        onSubmit={() => {}}
        onCancel={onCancelMock} 
      />, 
      { wrapper: TestWrapper }
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onCancelMock).toHaveBeenCalled();
  });

  it('shows loading state during submission', () => {
    render(
      <JournalEntryForm 
        onSubmit={() => {}}
        isLoading={true}
      />, 
      { wrapper: TestWrapper }
    );
    
    // Button should be disabled when loading
    const submitButton = screen.getByRole('button', { name: /create journal entry/i });
    expect(submitButton).toBeDisabled();
    
    // Check that fields are properly disabled by checking one of the components that actually
    // sets the disabled prop - we can't check the TextField itself since it doesn't pass disabled to the input
    const chip = screen.queryByRole('button', { name: /add a tag/i });
    if (chip) {
      expect(chip).toBeDisabled();
    } else {
      // If no chips, check if the autocomplete is disabled
      const autocomplete = screen.getByPlaceholderText(/add a tag/i);
      expect(autocomplete).toHaveAttribute('disabled');
    }
  });
}); 