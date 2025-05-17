/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JournalDashboard from '../JournalDashboard';
import { useJournalEntries } from '../../../hooks/useJournals';
import useSentimentAnalysis from '../../../hooks/useSentimentAnalysis';

// Mock the React Query hooks
jest.mock('../../../hooks/useJournals', () => ({
  useJournalEntries: jest.fn(),
  useCreateJournalEntry: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    error: null
  }),
  useUpdateJournalEntry: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    error: null
  }),
  useJournalEntry: jest.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null
  })
}));

// Mock the sentiment analysis hook
jest.mock('../../../hooks/useSentimentAnalysis', () => {
  return {
    __esModule: true,
    SentimentType: {
      POSITIVE: 'positive',
      NEUTRAL: 'neutral',
      NEGATIVE: 'negative'
    },
    default: jest.fn().mockReturnValue({
      result: {
        score: 0.5,
        type: 'neutral',
        keywords: []
      },
      isLoading: false
    })
  };
});

// Mock child components to simplify testing
jest.mock('../JournalEditor', () => {
  return function MockJournalEditor(props) {
    return <div data-testid="mock-journal-editor">Journal Editor Component</div>;
  };
});

jest.mock('../JournalList', () => {
  return function MockJournalList(props) {
    return <div data-testid="mock-journal-list">
      <h3>Your Journal Entries</h3>
      {props.onSelectEntry && (
        <button onClick={() => props.onSelectEntry('test-id')}>Select Entry</button>
      )}
    </div>;
  };
});

jest.mock('../MoodChart', () => {
  return function MockMoodChart(props) {
    return <div data-testid="mock-mood-chart">
      <h3>Your Mood Trends</h3>
    </div>;
  };
});

// Mock sample journal entries
const mockJournalEntries = {
  items: [
    {
      id: '1',
      userId: 'user1',
      content: 'Sample journal entry',
      contentFormat: 'plain',
      date: '2023-07-15T10:30:00Z',
      sentimentScore: 0.75,
      attachments: [],
      createdAt: '2023-07-15T10:30:00Z',
      updatedAt: '2023-07-15T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user1',
      content: 'Another journal entry',
      contentFormat: 'plain',
      date: '2023-07-16T14:20:00Z',
      sentimentScore: 0.5,
      attachments: [],
      createdAt: '2023-07-16T14:20:00Z',
      updatedAt: '2023-07-16T14:20:00Z'
    }
  ],
  count: 2
};

// Helper function to render with Router provider
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('JournalDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      data: null
    });

    renderWithRouter(<JournalDashboard />);
    
    expect(screen.getByText('Loading your journal...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch journal entries';
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error(errorMessage),
      data: null
    });

    renderWithRouter(<JournalDashboard />);
    
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(within(errorAlert).getByText(/Error loading journal data/i)).toBeInTheDocument();
    expect(within(errorAlert).getByText(/Failed to fetch journal entries/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders dashboard with journal entries', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockJournalEntries
    });

    renderWithRouter(<JournalDashboard />);
    
    // Check heading and button
    expect(screen.getByText('My Journal')).toBeInTheDocument();
    expect(screen.getByTestId('new-journal-button')).toBeInTheDocument();
    
    // Check for mocked components
    expect(screen.getByTestId('mock-journal-editor')).toBeInTheDocument();
    expect(screen.getByTestId('mock-journal-list')).toBeInTheDocument();
    expect(screen.getByTestId('mock-mood-chart')).toBeInTheDocument();
  });

  it('renders dashboard with empty journal state', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: { items: [], count: 0 }
    });

    renderWithRouter(<JournalDashboard />);
    
    // Should have editor and list but no chart
    expect(screen.getByTestId('mock-journal-editor')).toBeInTheDocument();
    expect(screen.getByTestId('mock-journal-list')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-mood-chart')).not.toBeInTheDocument();
  });
}); 