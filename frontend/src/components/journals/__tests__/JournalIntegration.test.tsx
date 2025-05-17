import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JournalEditor from '../JournalEditor';
import JournalList from '../JournalList';
import MoodChart from '../MoodChart';
import { useJournalEntries, useCreateJournalEntry, useUpdateJournalEntry } from '../../../hooks/useJournals';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock the React Query hooks
jest.mock('../../../hooks/useJournals', () => ({
  useJournalEntries: jest.fn(),
  useCreateJournalEntry: jest.fn(),
  useUpdateJournalEntry: jest.fn(),
  useJournalEntry: jest.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null
  })
}));

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts') as Record<string, any>;
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>
  };
});

// Sample journal entries
const initialJournalEntries = {
  items: [
    {
      id: '1',
      userId: 'user1',
      content: 'Initial journal entry',
      contentFormat: 'plain',
      date: '2023-07-15T10:00:00Z',
      sentimentScore: 0.6,
      attachments: [],
      createdAt: '2023-07-15T10:00:00Z',
      updatedAt: '2023-07-15T10:00:00Z'
    }
  ],
  count: 1
};

// Extended journal entries (after adding a new one)
const extendedJournalEntries = {
  items: [
    {
      id: '2',
      userId: 'user1',
      content: 'New test journal entry',
      contentFormat: 'plain',
      date: '2023-07-16T10:00:00Z',
      sentimentScore: 0.7,
      attachments: [],
      createdAt: '2023-07-16T10:00:00Z',
      updatedAt: '2023-07-16T10:00:00Z'
    },
    ...initialJournalEntries.items
  ],
  count: 2
};

// Setup component wrapper with React Query
const renderWithQueryClient = (ui: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Journal Integration Tests', () => {
  // Mock mutation function
  const mockCreateMutation = {
    mutate: jest.fn(),
    isPending: false,
    error: null
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default journal entries data
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: initialJournalEntries
    });
    
    // Setup create mutation
    (useCreateJournalEntry as jest.Mock).mockReturnValue(mockCreateMutation);
    
    // Setup update mutation
    (useUpdateJournalEntry as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null
    });
  });

  it('displays journal entries in the list', async () => {
    renderWithQueryClient(<JournalList />);
    
    // Check if entry is displayed
    expect(screen.getByText('Initial journal entry')).toBeInTheDocument();
  });

  it('displays mood chart with data', async () => {
    renderWithQueryClient(<MoodChart />);
    
    // Check if chart is rendered
    expect(screen.getByText('Your Mood Trends')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('creates a new journal entry and updates the list and chart', async () => {
    // Setup the create mutation to update journal entries on success
    mockCreateMutation.mutate.mockImplementation((data: any, options: any) => {
      const newEntry = {
        id: '2',
        userId: 'user1',
        content: data.content,
        contentFormat: data.contentFormat,
        date: data.date,
        sentimentScore: 0.6,
        attachments: [],
        createdAt: '2023-07-15T10:30:00Z',
        updatedAt: '2023-07-15T10:30:00Z'
      };
      
      if (options && options.onSuccess) {
        // Update the mock entries list
        (useJournalEntries as jest.Mock).mockReturnValue({
          isLoading: false,
          error: null,
          data: {
            items: [newEntry, ...initialJournalEntries.items],
            count: initialJournalEntries.count + 1
          }
        });
        // Call onSuccess with the new entry
        options.onSuccess(newEntry);
      }
    });
    
    const queryClient = new QueryClient({
      defaultOptions: { 
        queries: { 
          retry: false,
          gcTime: 0,
          refetchOnWindowFocus: false
        } 
      }
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <div data-testid="journal-integration-test">
          <JournalEditor />
          <JournalList />
          <MoodChart />
        </div>
      </QueryClientProvider>
    );
    
    // Initial state checks
    expect(screen.getByText('Initial journal entry')).toBeInTheDocument();
    
    // Create a new journal entry
    const textArea = screen.getByLabelText(/what's on your mind today?/i);
    await userEvent.type(textArea, 'New test journal entry');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);
    
    // Wait for the new entry to appear in the list
    await waitFor(() => {
      const entries = screen.getAllByRole('button');
      const entryTexts = entries.map(entry => entry.textContent);
      expect(entryTexts).toContain(expect.stringContaining('New test journal entry'));
    }, { timeout: 5000 });
    
    // Initial entry should still be there
    expect(screen.getByText('Initial journal entry')).toBeInTheDocument();
  }, 10000); // Increase timeout to 10 seconds
}); 