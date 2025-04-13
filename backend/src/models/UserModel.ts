/**
 * backend/src/models/UserModel.ts
 * Handles user-related database operations
 */
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import db from '../config/database';

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
  /**
   * Create a new user in the database
   */
  async createUser(userData: UserInput): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await db.users.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new Error('Email already in use');
        } else {
          throw new Error('Username already taken');
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create new user object
      const newUser: User = {
        id: uuidv4(),
        username: userData.username,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePicture: userData.profilePicture || '',
        bio: userData.bio || '',
        role: userData.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // Insert user to database
      await db.users.insertOne(newUser);
      
      // Return created user (without password)
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await db.users.findOne({ id: userId });
      if (!user) return null;
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email (for authentication)
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await db.users.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await db.users.findOne({ username });
      if (!user) return null;
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updateData: Partial<UserInput>): Promise<User | null> {
    try {
      // Check if user exists
      const user = await db.users.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Check for unique email and username if updating them
      if (updateData.email) {
        const emailUser = await db.users.findOne({ 
          email: updateData.email.toLowerCase(),
          id: { $ne: userId } 
        });
        if (emailUser) {
          throw new Error('Email already in use');
        }
        updateData.email = updateData.email.toLowerCase();
      }

      if (updateData.username) {
        const usernameUser = await db.users.findOne({ 
          username: updateData.username,
          id: { $ne: userId } 
        });
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

      await db.users.updateOne(
        { id: userId },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await db.users.deleteOne({ id: userId });
      return result.deletedCount === 1;
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
      const users = await db.users.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).limit(limit).toArray();

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
      await db.users.updateOne(
        { id: userId },
        { $set: { lastLogin: new Date() } }
      );
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
      const result = await db.users.updateOne(
        { id: userId },
        { $set: { isActive: false, updatedAt: new Date() } }
      );
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
      const result = await db.users.updateOne(
        { id: userId },
        { $set: { isActive: true, updatedAt: new Date() } }
      );
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
      // Get user with password
      const user = await db.users.findOne({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash and update new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const result = await db.users.updateOne(
        { id: userId },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default new UserModel(); 