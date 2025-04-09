import React from 'react';
import { render, screen } from './utils/test-utils';
import App from './App';

test('renders app title in header', () => {
  render(<App />);
  const titleElement = screen.getByText('Perfect LifeTracker Pro - Vite Edition');
  expect(titleElement).toBeInTheDocument();
});
