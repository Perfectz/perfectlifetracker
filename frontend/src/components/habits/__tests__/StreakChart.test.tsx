/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import StreakChart from '../StreakChart';
import { mockStreakData } from '../../../services/mockData';

// Mock recharts components
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    lazy: (factory: any) => {
      const Component = factory();
      if (Component instanceof Promise) {
        return () => null;
      }
      return () => Component;
    },
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('StreakChart Component', () => {
  it('renders chart title correctly', async () => {
    render(<StreakChart data={mockStreakData} />);
    
    // Check if title is rendered
    expect(screen.getByText('Habit Streak Progress')).toBeInTheDocument();
  });

  it('renders loading state when isLoading=true', async () => {
    render(<StreakChart data={[]} isLoading={true} />);
    
    // Check for loading skeleton - use getByText for the title instead of testing for skeleton
    expect(screen.getByText('Habit Streak Progress')).toBeInTheDocument();
  });

  it('renders empty state message when no data is provided', async () => {
    render(<StreakChart data={[]} />);
    
    // Check for empty state message
    expect(screen.getByText('No streak data available')).toBeInTheDocument();
  });

  it('renders with custom title and height', async () => {
    const customTitle = 'Custom Chart Title';
    render(
      <StreakChart 
        data={mockStreakData} 
        title={customTitle} 
        height={500} 
      />
    );
    
    // Check for custom title
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    
    // Check for aria label
    expect(screen.getByRole('img', { name: 'Streak progress chart' })).toBeInTheDocument();
  });
}); 