/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileContent } from '../ProfileContent';
import { profileService } from '../../../services/apiService';
import { BrowserRouter } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';

// Mock the profileService module
jest.mock('../../../services/apiService', () => ({
  profileService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn()
  }
}));

// Mock the useAuth hook to always return an authenticated user
jest.mock('../../../authContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { 
      homeAccountId: 'mock-account-id',
      localAccountId: 'user123', 
      name: 'Test User',
      environment: 'localhost',
      tenantId: 'mock-tenant',
      username: 'test@example.com'
    },
    login: jest.fn(),
    logout: jest.fn(),
    acquireToken: jest.fn().mockResolvedValue('mock-token'),
    error: null
  }),
  AuthProvider: ({ children }) => <>{children}</>
}));

// Mock the useMsal hook from @azure/msal-react
jest.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: {
      getActiveAccount: () => ({
        localAccountId: 'user123',
        name: 'Test User',
        username: 'test@example.com'
      }),
      getAllAccounts: () => [{
        localAccountId: 'user123',
        name: 'Test User',
        username: 'test@example.com'
      }]
    },
    accounts: [{ 
      localAccountId: 'user123', 
      name: 'Test User',
      username: 'test@example.com'
    }]
  })
}));

// Mock the useUser hook
jest.mock('../../../hooks/useUser');
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('ProfileContent Component', () => {
  const mockProfile = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    bio: 'This is a test bio',
    createdAt: new Date(),
    preferences: {
      theme: 'light',
      notifications: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useUser
    mockUseUser.mockReturnValue({
      user: mockProfile,
      updateProfile: jest.fn().mockResolvedValue({}),
      isLoading: false,
      error: null
    });
    
    // Mock the profile service to return a profile
    (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
  });

  it('renders loading state initially', () => {
    // Override the default mock for this specific test
    mockUseUser.mockReturnValueOnce({
      user: null,
      updateProfile: jest.fn(),
      isLoading: true,
      error: null
    });

    renderWithProviders(<ProfileContent />);
    
    expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
  });

  it('renders profile data when loaded', async () => {
    renderWithProviders(<ProfileContent />);
    
    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.getByTestId('profile-container')).toBeInTheDocument();
    });
    
    expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.email)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
  });

  it('renders error state when fetching profile fails', async () => {
    const errorMessage = 'Failed to fetch profile';
    
    // Override the default mock for this specific test
    mockUseUser.mockReturnValueOnce({
      user: null,
      updateProfile: jest.fn(),
      isLoading: false,
      error: new Error(errorMessage)
    });

    renderWithProviders(<ProfileContent />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('toggles between view and edit mode', async () => {
    renderWithProviders(<ProfileContent />);
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByTestId('profile-container')).toBeInTheDocument();
    });
    
    // Initially in view mode, find and click edit button
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Should be in edit mode now
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Should be back in view mode
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('validates form fields on submit', async () => {
    renderWithProviders(<ProfileContent />);
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByTestId('profile-container')).toBeInTheDocument();
    });
    
    // Find edit button and click it
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Clear the name field
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Set an invalid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    
    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
  });

  it('submits the form and updates profile', async () => {
    // Setup update function mock
    const updateProfileMock = jest.fn().mockResolvedValue({
      ...mockProfile,
      name: 'Updated User',
      bio: 'Updated bio content'
    });
    
    mockUseUser.mockReturnValue({
      user: mockProfile,
      updateProfile: updateProfileMock,
      isLoading: false,
      error: null
    });
    
    renderWithProviders(<ProfileContent />);
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByTestId('profile-container')).toBeInTheDocument();
    });
    
    // Find edit button and click it
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Update fields
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Updated User' } });
    
    const bioInput = screen.getByTestId('bio-input');
    fireEvent.change(bioInput, { target: { value: 'Updated bio content' } });
    
    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalled();
    });
  });

  it('handles file upload for avatar', async () => {
    // Mock the URL.createObjectURL method
    global.URL.createObjectURL = jest.fn(() => 'data:image/png;base64,mockedImageData');
    
    renderWithProviders(<ProfileContent />);
    
    // Go to edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Create a mock File
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    
    // Get the file input
    const fileInput = screen.getByLabelText(/Profile Picture/i);
    
    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check if the avatar preview is shown - look for an image with alt text
    await waitFor(() => {
      const avatar = screen.getByAltText(/Avatar preview/i);
      expect(avatar).toBeInTheDocument();
      // Don't assert on exact URL as it may vary
    });
  });
}); 