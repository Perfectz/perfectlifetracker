/**
 * frontend/src/services/mockAuthService.ts
 * A mock authentication service for development and testing
 */

// Type definitions
export interface MockUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

// Mock user data
const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    name: 'Admin User',
  },
  {
    id: 'user-2',
    username: 'user',
    email: 'user@example.com',
    name: 'Test User',
  },
];

// Mock authentication service class
class MockAuthService {
  // Check if there's a saved user session in localStorage
  getCurrentUser(): MockUser | null {
    try {
      const savedUser = localStorage.getItem('mockUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error retrieving user from localStorage:', error);
      return null;
    }
  }

  // Mock sign-in functionality
  async signIn(
    email: string = 'admin@example.com',
    password: string = 'password'
  ): Promise<MockUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user by email
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, we would validate the password here
    // For this mock, we'll just accept any password

    // Save to localStorage
    localStorage.setItem('mockUser', JSON.stringify(user));

    return user;
  }

  // Mock sign-out functionality
  async signOut(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Clear from localStorage
    localStorage.removeItem('mockUser');
  }

  // Get user info (profile)
  async getUserInfo(): Promise<MockUser | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return this.getCurrentUser();
  }

  // Simplified sign in function for demo
  async demoSignIn(): Promise<MockUser> {
    return this.signIn();
  }
}

// Export a singleton instance
export const mockAuthService = new MockAuthService();

export default mockAuthService;
