/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JournalViewer from '../JournalViewer';
import { JournalEntry } from '../../../types/journal';

// Mock ReactMarkdown
jest.mock('react-markdown', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => (
      <div data-testid="markdown-content">{children}</div>
    ),
  };
});

const mockJournalEntry: JournalEntry = {
  id: '123',
  userId: 'user1',
  content: 'Test content with some text',
  contentFormat: 'plain',
  date: '2023-04-29T00:00:00Z', // April 29, 2023
  sentimentScore: 0.75, // positive sentiment
  tags: ['journal', 'test'],
  attachments: [
    {
      id: 'att1',
      fileName: 'test-image.jpg',
      contentType: 'image/jpeg',
      size: 1024,
      url: 'https://example.com/test-image.jpg'
    }
  ],
  createdAt: '2023-05-01T06:30:00Z', // May 1, 2023
  updatedAt: '2023-05-01T06:30:00Z'
};

const mockMarkdownEntry: JournalEntry = {
  ...mockJournalEntry,
  id: '124',
  content: '# Test Heading\n\nTest paragraph with **bold** text',
  contentFormat: 'markdown'
};

const mockNegativeEntry: JournalEntry = {
  ...mockJournalEntry,
  id: '125',
  sentimentScore: 0.25 // negative sentiment
};

const mockNeutralEntry: JournalEntry = {
  ...mockJournalEntry,
  id: '126',
  sentimentScore: 0.5 // neutral sentiment
};

describe('JournalViewer', () => {
  it('renders a plain text journal entry correctly', () => {
    render(<JournalViewer entry={mockJournalEntry} />);
    
    // Check for content
    expect(screen.getByText('Test content with some text')).toBeInTheDocument();
    
    // Check the date heading (using testid to avoid multiple heading issue)
    const dateHeading = screen.getByRole('heading', { level: 2 });
    expect(dateHeading).toHaveTextContent('April 28, 2023');
    
    // Check sentiment icon (positive in this case)
    expect(screen.getByTestId('SentimentVerySatisfiedIcon')).toBeInTheDocument();
    
    // Check creation date
    expect(screen.getByText(/May 1, 2023/)).toBeInTheDocument();
    
    // Check tags
    expect(screen.getByText('journal')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    
    // Check attachment
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/test-image.jpg');
  });
  
  it('renders a markdown journal entry correctly', () => {
    // Add data-testid to the rendered markdown
    const MarkdownComponent = () => (
      <JournalViewer 
        entry={mockMarkdownEntry} 
      />
    );
    
    render(<MarkdownComponent />);
    
    // Check that markdown content is rendered in the markdown-content element
    const markdownContent = screen.getByTestId('markdown-content');
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toHaveTextContent('# Test Heading');
    expect(markdownContent).toHaveTextContent('Test paragraph with **bold** text');
  });
  
  it('displays different sentiment icons based on sentiment score', () => {
    // Negative sentiment
    const { unmount } = render(<JournalViewer entry={mockNegativeEntry} />);
    expect(screen.getByTestId('SentimentVeryDissatisfiedIcon')).toBeInTheDocument();
    unmount();
    
    // Neutral sentiment
    render(<JournalViewer entry={mockNeutralEntry} />);
    expect(screen.getByTestId('SentimentNeutralIcon')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn();
    render(<JournalViewer entry={mockJournalEntry} onEdit={handleEdit} />);
    
    fireEvent.click(screen.getByLabelText('Edit'));
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });
  
  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = jest.fn();
    render(<JournalViewer entry={mockJournalEntry} onDelete={handleDelete} />);
    
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });
  
  it('does not show edit/delete buttons if no handlers are provided', () => {
    render(<JournalViewer entry={mockJournalEntry} />);
    
    expect(screen.queryByLabelText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete')).not.toBeInTheDocument();
  });
  
  it('displays create/update timestamp correctly', () => {
    const updatedEntry = {
      ...mockJournalEntry,
      updatedAt: '2023-05-02T15:45:00.000Z'
    };
    
    render(<JournalViewer entry={updatedEntry} />);
    
    // Should show both created and updated timestamps
    const timestampText = screen.getByText(/created:/i).textContent;
    expect(timestampText).toContain('Created:');
    expect(timestampText).toContain('Updated:');
  });
}); 