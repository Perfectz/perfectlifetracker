/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JournalList from '../JournalList';
import { useJournalEntries } from '../../../hooks/useJournals';
import { JournalEntry } from '../../../types/journal';

// Mock the useJournalEntries hook
jest.mock('../../../hooks/useJournals', () => ({
  useJournalEntries: jest.fn()
}));

// Mock journal entries
const mockJournalEntries = {
  items: [
    {
      id: '1',
      userId: 'user1',
      content: 'First journal entry',
      contentFormat: 'plain',
      date: '2023-07-15T10:30:00Z',
      sentimentScore: 0.75, // positive
      attachments: [],
      createdAt: '2023-07-15T10:30:00Z',
      updatedAt: '2023-07-15T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user1',
      content: 'Second journal entry',
      contentFormat: 'plain',
      date: '2023-07-16T14:20:00Z',
      sentimentScore: 0.25, // negative
      attachments: [],
      createdAt: '2023-07-16T14:20:00Z',
      updatedAt: '2023-07-16T14:20:00Z'
    },
    {
      id: '3',
      userId: 'user1',
      content: 'Third journal entry',
      contentFormat: 'plain',
      date: '2023-07-17T09:15:00Z',
      sentimentScore: 0.5, // neutral
      attachments: [],
      createdAt: '2023-07-17T09:15:00Z',
      updatedAt: '2023-07-17T09:15:00Z'
    }
  ],
  count: 3
};

describe('JournalList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      data: null
    });

    render(<JournalList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch journal entries';
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error(errorMessage),
      data: null
    });

    render(<JournalList />);
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(errorMessage);
  });

  it('renders empty state correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: { items: [], count: 0 }
    });

    render(<JournalList />);
    expect(screen.getByText(/no journal entries found/i)).toBeInTheDocument();
  });

  it('renders journal entries correctly', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockJournalEntries
    });

    render(<JournalList />);
    
    // Should display the heading
    expect(screen.getByText('Your Journal Entries')).toBeInTheDocument();
    
    // Should display all three entries
    expect(screen.getByText('First journal entry')).toBeInTheDocument();
    expect(screen.getByText('Second journal entry')).toBeInTheDocument();
    expect(screen.getByText('Third journal entry')).toBeInTheDocument();
    
    // Should show different sentiment icons
    expect(screen.getAllByTestId('SentimentVerySatisfiedIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('SentimentVeryDissatisfiedIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('SentimentNeutralIcon')).toHaveLength(1);
  });

  it('calls onSelectEntry when clicking on an entry', () => {
    (useJournalEntries as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockJournalEntries
    });

    const handleSelectEntry = jest.fn();
    render(<JournalList onSelectEntry={handleSelectEntry} />);
    
    // Click on the first entry
    fireEvent.click(screen.getByText('First journal entry'));
    
    // Should call onSelectEntry with the entry ID
    expect(handleSelectEntry).toHaveBeenCalledWith('1');
  });
}); 