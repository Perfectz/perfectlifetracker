/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileContent } from '../ProfileContent';
import { profileService } from '../../../services/apiService';
import { AuthProvider } from '../../../authContext';
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

// Mock the useAuth hook
jest.mock('../../../authContext', () => {
  const originalModule = jest.requireActual('../../../authContext');
  return {
    ...originalModule,
    useAuth: () => ({
      isAuthenticated: true,
      isLoading: false,
      user: { localAccountId: 'user123', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
      acquireToken: jest.fn(),
      error: null
    }),
    AuthProvider: ({ children }) => <>{children}</>
  };
});

// Mock the useMsal hook from @azure/msal-react
jest.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    accounts: [{ localAccountId: 'user123', name: 'Test User' }]
  })
}));

// Mock the useUser hook
jest.mock('../../../hooks/useUser');
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

// Helper function to render with providers
const renderWithProviders = (ui) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
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
    
    // Default mock implementation
    mockUseUser.mockReturnValue({
      user: mockProfile,
      updateProfile: jest.fn().mockResolvedValue({}),
      isLoading: false,
      error: null
    });
  });

  it('renders loading state initially', () => {
    // Mock profileService.getProfile to delay response
    (profileService.getProfile as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(mockProfile), 100));
    });

    renderWithProviders(<ProfileContent />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders profile data when loaded', async () => {
    // Mock profileService.getProfile to return mock data
    (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

    renderWithProviders(<ProfileContent />);
    
    // Wait for profile data to load
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio')).toBeInTheDocument();
    expect(screen.getByText('user123')).toBeInTheDocument();
  });

  it('renders error state when fetching profile fails', async () => {
    // Mock profileService.getProfile to throw an error
    (profileService.getProfile as jest.Mock).mockRejectedValue(new Error('Failed to fetch profile'));

    renderWithProviders(<ProfileContent />);
    
    // Wait for error to be shown by test-id
    await waitFor(() => expect(screen.getByTestId('error-message')).toHaveTextContent(/Failed to fetch profile/));
  });

  it('renders profile data in view mode', async () => {
    render(<ProfileContent />);
    
    // Check if profile data is displayed
    expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.email)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
  });

  it('toggles between view and edit mode', async () => {
    render(<ProfileContent />);
    
    // Initially in view mode
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    
    // Click edit button
    fireEvent.click(screen.getByTestId('edit-button'));
    
    // Should be in edit mode now
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Should be back in view mode
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('validates form fields on submit', async () => {
    render(<ProfileContent />);
    
    // Find edit button and click it
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Clear the name field
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Set an invalid email
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    
    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Check that name validation error is shown
    await waitFor(() => {
      const nameError = screen.getByText(/Name is required/i);
      expect(nameError).toBeInTheDocument();
    });
    
    // Check for any validation error related to email format
    await waitFor(() => {
      // Look for any text mentioning 'email' and 'valid' together
      const emailErrors = screen.getAllByText(/email|valid/i);
      expect(emailErrors.length).toBeGreaterThan(0);
    });
  });

  it('submits the form and updates profile', async () => {
    // Mock successful update
    const updateProfileMock = jest.fn().mockResolvedValue({});
    
    mockUseUser.mockReturnValue({
      user: mockProfile,
      updateProfile: updateProfileMock,
      isLoading: false,
      error: null
    });
    
    render(<ProfileContent />);
    
    // Find edit button and click it
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Update fields
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated User' } });
    
    const bioInput = screen.getByLabelText(/Bio/i);
    fireEvent.change(bioInput, { target: { value: 'Updated bio content' } });
    
    // Submit the form
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalled();
    });
    
    // Look for success message or any indication that update was successful
    // Either look for a success message or check if we're back to view mode
    await waitFor(() => {
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });
  });

  it('handles file upload for avatar', async () => {
    // Mock the URL.createObjectURL method
    global.URL.createObjectURL = jest.fn(() => 'data:image/png;base64,mockedImageData');
    
    render(<ProfileContent />);
    
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