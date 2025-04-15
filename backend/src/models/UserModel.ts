/**
 * backend/src/models/UserModel.ts
 * Handles user-related database operations
 */
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { getContainer } from '../utils/cosmosClient';

// User Interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
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

class UserModel {
  private container: any;

  constructor() {
    try {
      this.container = getContainer('users');
    } catch (error) {
      console.error('Error initializing users container, will initialize later:', error.message);
      // Will initialize container later when needed
    }
  }

  // Initialize container if it wasn't available during construction
  private async ensureContainer() {
    if (!this.container) {
      try {
        this.container = getContainer('users');
      } catch (error) {
        throw new Error(`Failed to initialize users container: ${error.message}`);
      }
    }
    return this.container;
  }

  /**
   * Create a new user
   */
  async createUser(userData: UserInput): Promise<User> {
    await this.ensureContainer();
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Check if username is taken
      const usernameUser = await this.getUserByUsername(userData.username);
      if (usernameUser) {
        throw new Error('Username already taken');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user object
      const newUser = {
        id: uuidv4(),
        username: userData.username,
        email: userData.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profilePicture: userData.profilePicture || '',
        bio: userData.bio || '',
        role: userData.role || 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Insert user
      const { resource } = await this.container.items.create(newUser);
      return resource;
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
      if (updateData.email) {
        const emailUser = await this.getUserByEmail(updateData.email);
        if (emailUser) {
          throw new Error('Email already in use');
        }
        updateData.email = updateData.email.toLowerCase();
      }

      if (updateData.username) {
        const usernameUser = await this.getUserByUsername(updateData.username);
        if (usernameUser) {
          throw new Error('Username already taken');
        }
      }

      // Hash password if it's being updated
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      // Update user
      const updatedUser = {
        ...user,
        ...updateData,
        updatedAt: new Date()
      };

      if (typeof (this.container as any).item === 'function') {
        // Cosmos Container
        const { resource } = await (this.container as any).item(userId, userId).replace(updatedUser);
        return resource;
      } else {
        // MockContainer fallback
        const allUsers = await this.getAllUsers();
        const idx = allUsers.findIndex(u => u.id === userId);
        if (idx !== -1) {
          allUsers[idx] = updatedUser;
        }
        return updatedUser;
      }
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
      if (typeof (this.container as any).item === 'function') {
        await (this.container as any).item(userId, userId).delete();
      } else {
        // MockContainer doesn't support direct deletion
        // Would need to implement filtering in mock data
      }
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
    try {
      const users = await this.getAllUsers();

      // Remove passwords from results
      return users.map((user: User) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
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
    try {
      await this.ensureContainer();
      await (this.container as any).item(userId, userId).replace({
        ...(await this.getUserById(userId)),
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<boolean> {
    try {
      await this.ensureContainer();
      const result = await (this.container as any).item(userId, userId).replace({
        ...(await this.getUserById(userId)),
        isActive: false,
        updatedAt: new Date()
      });
      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<boolean> {
    try {
      await this.ensureContainer();
      const result = await (this.container as any).item(userId, userId).replace({
        ...(await this.getUserById(userId)),
        isActive: true,
        updatedAt: new Date()
      });
      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await this.ensureContainer();
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

      const result = await (this.container as any).item(userId, userId).replace({
        ...user,
        passwordHash: hashedPassword,
        updatedAt: new Date()
      });

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default new UserModel(); 