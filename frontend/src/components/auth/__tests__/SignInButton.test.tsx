import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignInButton from '../SignInButton';
import { useUser } from '../../../hooks/useUser';
import { useAuth } from '../../../authContext';

// Mock the hooks
jest.mock('../../../hooks/useUser');
jest.mock('../../../authContext');

describe('SignInButton', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (useUser as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
    });
  });
  
  it('renders correctly in idle state', () => {
    render(<SignInButton />);
    
    const button = screen.getByRole('button', { name: /sign in to your account/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Sign In');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  
  it('shows loading indicator when authentication is in progress', () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
    });
    
    render(<SignInButton />);
    
    const button = screen.getByRole('button', { name: /sign in to your account/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });
  
  it('calls login function when clicked', () => {
    render(<SignInButton />);
    
    const button = screen.getByRole('button', { name: /sign in to your account/i });
    fireEvent.click(button);
    
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });
}); 