/**
 * backend/src/models/UserModel.ts
 * Handles user-related database operations
 */
import { v4 as uuidv4 } from 'uuid';
// Support both possible bcrypt implementations
let bcrypt: any;
try {
  bcrypt = require('bcryptjs');
} catch (error) {
  try {
    bcrypt = require('bcrypt');
  } catch (err) {
    console.error('Failed to load bcrypt or bcryptjs');
    throw new Error('No bcrypt implementation available');
  }
}
import { initializeContainers } from '../utils/cosmosClient';

// User Interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Renamed from password to be more explicit
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  role: 'admin' | 'user';
  createdAt: string; // Store as ISO string
  updatedAt: string; // Store as ISO string
  lastLogin?: string; // Store as ISO string
  isActive: boolean;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  role?: 'admin' | 'user';
}

export class UserModel {
  private container: any;

  constructor() {
    try {
      this.initializeContainer();
    } catch (error) {
      console.error('Error initializing users container, will initialize later:', { error: error instanceof Error ? error.message : String(error) });
      // Will initialize container later when needed
    }
  }

  // Initialize container
  private async initializeContainer() {
    try {
      const containers = await initializeContainers();
      this.container = containers.users;
    } catch (error) {
      throw new Error(`Failed to initialize users container: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Initialize container if it wasn't available during construction
  private async ensureContainer() {
    if (!this.container) {
      await this.initializeContainer();
    }
    return this.container;
  }

  /**
   * Create a new user
   */
  async createUser(userInput: UserInput): Promise<User> {
    await this.ensureContainer();
    try {
      // Convert email to lowercase
      userInput.email = userInput.email.toLowerCase();
      
      // Check if user with email already exists
      const existingUserByEmail = await this.getUserByEmail(userInput.email);
      if (existingUserByEmail) {
        throw new Error('Email already in use');
      }
      
      // Check if user with username already exists
      const existingUserByUsername = await this.getUserByUsername(userInput.username);
      if (existingUserByUsername) {
        throw new Error('Username already taken');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userInput.password, salt);
      
      // Create user object
      const now = new Date().toISOString();
      const user: User = {
        id: `user_${uuidv4()}`,
        username: userInput.username,
        email: userInput.email,
        passwordHash: hashedPassword,
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        ...(userInput.profilePicture && { profilePicture: userInput.profilePicture }),
        ...(userInput.bio && { bio: userInput.bio }),
        role: userInput.role || 'user',
        createdAt: now,
        updatedAt: now,
        isActive: true
      };
      
      // Save user to database
      const { resource: createdUser } = await this.container.items.create(user);
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureContainer();
    try {
      const querySpec = {
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [
          { 
            name: "@email", 
            value: email.toLowerCase() 
          }
        ]
      };
      
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    await this.ensureContainer();
    try {
      const querySpec = {
        query: "SELECT * FROM c WHERE c.username = @username",
        parameters: [
          { 
            name: "@username", 
            value: username 
          }
        ]
      };
      
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    await this.ensureContainer();
    try {
      const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [
          { 
            name: "@id", 
            value: id 
          }
        ]
      };
      
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    await this.ensureContainer();
    try {
      const querySpec = {
        query: "SELECT * FROM c"
      };
      
      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    await this.ensureContainer();
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return null;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return null;
      }

      // Return user without password
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updateData: Partial<UserInput>): Promise<User | null> {
    await this.ensureContainer();
    try {
      // Check if user exists
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check for unique email and username if updating them
      if (updateData.email && updateData.email !== user.email) {
        const emailUser = await this.getUserByEmail(updateData.email);
        if (emailUser && emailUser.id !== userId) {
          throw new Error('Email already in use');
        }
        updateData.email = updateData.email.toLowerCase();
      }

      if (updateData.username && updateData.username !== user.username) {
        const usernameUser = await this.getUserByUsername(updateData.username);
        if (usernameUser && usernameUser.id !== userId) {
          throw new Error('Username already taken');
        }
      }

      // Hash password if it's being updated
      let passwordUpdate = {};
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateData.password, salt);
        passwordUpdate = { passwordHash: hashedPassword };
        // Remove the plain password from the update data
        delete updateData.password;
      }

      // Update user
      const updatedUser = {
        ...user,
        ...updateData,
        ...passwordUpdate,
        updatedAt: new Date().toISOString()
      };

      const { resource } = await this.container.item(userId, userId).replace(updatedUser);
      return resource;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    await this.ensureContainer();
    try {
      await this.container.item(userId, userId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    await this.ensureContainer();
    try {
      // For a more sophisticated search, you might want to implement a proper search query
      // This is a simple implementation that gets all users and filters client-side
      const users = await this.getAllUsers();
      
      const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) || 
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);

      // Remove passwords from results
      return filteredUsers.map((user: User) => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword as any;
      });
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.ensureContainer();
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await this.container.item(userId, userId).replace(updatedUser);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<boolean> {
    await this.ensureContainer();
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...user,
        isActive: false,
        updatedAt: new Date().toISOString()
      };
      
      await this.container.item(userId, userId).replace(updatedUser);
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<boolean> {
    await this.ensureContainer();
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...user,
        isActive: true,
        updatedAt: new Date().toISOString()
      };
      
      await this.container.item(userId, userId).replace(updatedUser);
      return true;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    await this.ensureContainer();
    try {
      // Get user with password
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash and update new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = {
        ...user,
        passwordHash: hashedPassword,
        updatedAt: new Date().toISOString()
      };

      await this.container.item(userId, userId).replace(updatedUser);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default new UserModel(); 