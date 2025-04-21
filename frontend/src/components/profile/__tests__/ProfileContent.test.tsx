/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileContent } from '../ProfileContent';
import { profileService } from '../../../services/apiService';
import { AuthProvider } from '../../../authContext';

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

  it('allows switching to edit mode and back', async () => {
    // Mock profileService.getProfile to return mock data
    (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

    renderWithProviders(<ProfileContent />);
    
    // Wait for profile data to load
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
    
    // Click the Edit Profile button via test-id
    fireEvent.click(screen.getByTestId('edit-button'));
    
    // Check that form fields are shown
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    
    // Check that form fields have the correct values
    expect(screen.getByLabelText('Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Bio')).toHaveValue('This is a test bio');
    
    // Click the Cancel button to go back to view mode
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check that we're back to view mode via test-id
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });

  it('validates form fields on submit', async () => {
    // Mock profileService.getProfile to return mock data
    (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

    renderWithProviders(<ProfileContent />);
    
    // Wait for profile data to load
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
    
    // Click the Edit Profile button
    fireEvent.click(screen.getByTestId('edit-button'));
    
    // Clear the name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
    
    // Submit the form using save-button test-id
    fireEvent.click(screen.getByTestId('save-button'));
    
    // Check that validation error is shown
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    
    // Enter an invalid email
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalidemail' } });
    
    // Submit the form again
    fireEvent.click(screen.getByTestId('save-button'));
    
    // Check that email validation error is shown
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('submits the form and updates profile', async () => {
    // Mock profileService.getProfile to return mock data
    (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
    
    // Mock profileService.updateProfile to return updated profile
    const updatedProfile = {
      ...mockProfile,
      name: 'Updated User',
      bio: 'Updated bio content'
    };
    (profileService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

    renderWithProviders(<ProfileContent />);
    
    // Wait for profile data to load
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
    
    // Click the Edit Profile button
    fireEvent.click(screen.getByTestId('edit-button'));
    
    // Update form fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated User' } });
    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'Updated bio content' } });
    
    // Submit the form via save-button
    fireEvent.click(screen.getByTestId('save-button'));
    
    // Wait for update to complete
    await waitFor(() => expect(profileService.updateProfile).toHaveBeenCalled());
    
    // Check that the API was called with correct data
    expect(profileService.updateProfile).toHaveBeenCalledWith({
      id: 'user123',
      name: 'Updated User',
      email: 'test@example.com',
      bio: 'Updated bio content',
      avatarUrl: undefined
    });
    
    // Check that success message is shown
    expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    
    // Check that we're back to view mode with updated data
    expect(screen.getByText('Updated User')).toBeInTheDocument();
    expect(screen.getByText('Updated bio content')).toBeInTheDocument();
  });

  it('handles file upload for avatar', async () => {
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockedImageData',
      onloadend: null
    };
    global.FileReader = jest.fn(() => mockFileReader) as any;
    
    // Mock profileService.getProfile to return mock data
    (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
    
    // Mock uploadAvatar to return a proper response
    (profileService.uploadAvatar as jest.Mock).mockResolvedValue({
      success: true,
      avatarUrl: 'https://example.com/avatar.jpg',
      profile: {
        ...mockProfile,
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    });

    render(<AuthProvider><ProfileContent /></AuthProvider>);
    
    // Wait for profile data to load
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
    
    // Click the Edit Profile button
    fireEvent.click(screen.getByTestId('edit-button'));
    
    // Mock file upload
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Profile Picture');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Trigger the onloadend callback
    if (mockFileReader.onloadend) {
      (mockFileReader.onloadend as any)();
    }
    
    // Check if the avatar preview is shown
    await waitFor(() => expect(screen.getByAltText('Avatar preview')).toBeInTheDocument());
    expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', 'data:image/png;base64,mockedImageData');
  });
}); 