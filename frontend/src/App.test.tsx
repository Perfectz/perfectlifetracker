/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { AuthProvider } from './authContext';

// Create a mock implementation for authContext
jest.mock('./authContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    acquireToken: jest.fn(),
    error: null
  })
}));

describe('App Component', () => {
  test('renders LifeTracker Pro heading', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { name: /Welcome to LifeTracker Pro/i, level: 2 });
    expect(headingElement).toBeInTheDocument();
  });

  test('renders welcome message when not authenticated', () => {
    render(<App />);
    const welcomeMessage = screen.getByText(/Please sign in to access your profile/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  test('renders sign in button when not authenticated', () => {
    render(<App />);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
  });
}); 