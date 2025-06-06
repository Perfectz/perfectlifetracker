/**
 * backend/src/services/UserService.ts
 * User service with business logic for user management
 */
import BaseService, { BaseEntity, PaginationOptions, PaginatedResult } from './BaseService';
import { logger } from '../utils/logger';

// User entity interface
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  lastLoginAt?: Date;
  profilePicture?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  stats: {
    tasksCompleted: number;
    workoutsLogged: number;
    joinedAt: Date;
  };
}

// User creation input interface
export interface CreateUserInput {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin' | 'moderator';
}

// User update input interface
export interface UpdateUserInput {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  preferences?: User['preferences'];
  isActive?: boolean;
}

// User search filters
export interface UserSearchFilters {
  role?: 'user' | 'admin' | 'moderator';
  isActive?: boolean;
  search?: string;
}

export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  /**
   * Create a new user with default settings
   */
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      // Check if email already exists
      const existingEmail = await this.findOneBy('email', input.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Check if username already exists
      const existingUsername = await this.findOneBy('username', input.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email: input.email.toLowerCase().trim(),
        username: input.username.toLowerCase().trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        role: input.role || 'user',
        isActive: true,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        stats: {
          tasksCompleted: 0,
          workoutsLogged: 0,
          joinedAt: new Date()
        }
      };

      const user = await this.create(userData);
      
      logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      return user;
    } catch (error) {
      logger.error('Failed to create user', {
        email: input.email,
        username: input.username,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    try {
      // If email is being updated, check for duplicates
      if (input.email) {
        const existingEmail = await this.findOneBy('email', input.email);
        if (existingEmail && existingEmail.id !== userId) {
          throw new Error('Email already exists');
        }
        input.email = input.email.toLowerCase().trim();
      }

      // If username is being updated, check for duplicates
      if (input.username) {
        const existingUsername = await this.findOneBy('username', input.username);
        if (existingUsername && existingUsername.id !== userId) {
          throw new Error('Username already exists');
        }
        input.username = input.username.toLowerCase().trim();
      }

      // Handle preferences update (merge with existing)
      if (input.preferences) {
        const currentUser = await this.findById(userId);
        if (currentUser) {
          input.preferences = {
            ...currentUser.preferences,
            ...input.preferences
          };
        }
      }

      const updatedUser = await this.update(userId, input);
      
      logger.info('User updated successfully', {
        userId,
        updatedFields: Object.keys(input)
      });

      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.findOneBy('email', email.toLowerCase().trim());
      
      logger.info('User search by email', {
        email,
        found: !!user
      });

      return user;
    } catch (error) {
      logger.error('Failed to find user by email', {
        email,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.findOneBy('username', username.toLowerCase().trim());
      
      logger.info('User search by username', {
        username,
        found: !!user
      });

      return user;
    } catch (error) {
      logger.error('Failed to find user by username', {
        username,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Search users with filters and pagination
   */
  async searchUsers(filters: UserSearchFilters = {}, pagination: PaginationOptions = { page: 1, limit: 10 }): Promise<PaginatedResult<User>> {
    try {
      const where: Record<string, any> = {};

      // Apply role filter
      if (filters.role) {
        where.role = filters.role;
      }

      // Apply active status filter
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      // For search term, we need a custom query since we're searching multiple fields
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        const searchQuery = `
          SELECT * FROM c 
          WHERE (
            CONTAINS(LOWER(c.firstName), @searchTerm) OR 
            CONTAINS(LOWER(c.lastName), @searchTerm) OR 
            CONTAINS(LOWER(c.email), @searchTerm) OR 
            CONTAINS(LOWER(c.username), @searchTerm)
          )
          ${Object.keys(where).length > 0 ? 'AND ' + Object.entries(where).map(([key], index) => `c.${key} = @param${index}`).join(' AND ') : ''}
          ORDER BY c.${pagination.sort || 'createdAt'} ${(pagination.order || 'desc').toUpperCase()}
          OFFSET ${(pagination.page - 1) * pagination.limit} LIMIT ${pagination.limit}
        `;

        const parameters = [
          { name: '@searchTerm', value: searchTerm },
          ...Object.entries(where).map(([, value], index) => ({ name: `@param${index}`, value }))
        ];

        const data = await this.query({ query: searchQuery, parameters });

        // Get total count for search
        const countQuery = `
          SELECT VALUE COUNT(1) FROM c 
          WHERE (
            CONTAINS(LOWER(c.firstName), @searchTerm) OR 
            CONTAINS(LOWER(c.lastName), @searchTerm) OR 
            CONTAINS(LOWER(c.email), @searchTerm) OR 
            CONTAINS(LOWER(c.username), @searchTerm)
          )
          ${Object.keys(where).length > 0 ? 'AND ' + Object.entries(where).map(([key], index) => `c.${key} = @param${index}`).join(' AND ') : ''}
        `;

        const countResults = await this.container!.items.query<number>({
          query: countQuery,
          parameters
        }).fetchAll();

        const total = countResults.resources[0] || 0;
        const totalPages = Math.ceil(total / pagination.limit);

        logger.info('User search completed', {
          searchTerm,
          filters,
          pagination,
          resultCount: data.length,
          total
        });

        return {
          data,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1
          }
        };
      }

      // Use base findMany for simple filtering
      const result = await this.findMany({ ...pagination, where });
      
      logger.info('User search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        total: result.pagination.total
      });

      return result;
    } catch (error) {
      logger.error('Failed to search users', {
        filters,
        pagination,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.update(userId, { lastLoginAt: new Date() });
      
      logger.info('User last login updated', { userId });
    } catch (error) {
      logger.error('Failed to update user last login', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Increment user task completion count
   */
  async incrementTasksCompleted(userId: string): Promise<void> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await this.update(userId, {
        stats: {
          ...user.stats,
          tasksCompleted: user.stats.tasksCompleted + 1
        }
      });
      
      logger.info('User tasks completed count incremented', { userId });
    } catch (error) {
      logger.error('Failed to increment user tasks completed', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Increment user workouts logged count
   */
  async incrementWorkoutsLogged(userId: string): Promise<void> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await this.update(userId, {
        stats: {
          ...user.stats,
          workoutsLogged: user.stats.workoutsLogged + 1
        }
      });
      
      logger.info('User workouts logged count incremented', { userId });
    } catch (error) {
      logger.error('Failed to increment user workouts logged', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<User> {
    try {
      const updatedUser = await this.update(userId, { isActive: false });
      
      logger.info('User deactivated', { userId });
      
      return updatedUser;
    } catch (error) {
      logger.error('Failed to deactivate user', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<User> {
    try {
      const updatedUser = await this.update(userId, { isActive: true });
      
      logger.info('User reactivated', { userId });
      
      return updatedUser;
    } catch (error) {
      logger.error('Failed to reactivate user', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<User['stats'] | null> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        return null;
      }

      logger.info('User stats retrieved', { userId });
      
      return user.stats;
    } catch (error) {
      logger.error('Failed to get user stats', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get active users count
   */
  async getActiveUsersCount(): Promise<number> {
    try {
      const count = await this.count({ isActive: true });
      
      logger.info('Active users count retrieved', { count });
      
      return count;
    } catch (error) {
      logger.error('Failed to get active users count', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// Export singleton instance with lazy initialization
let userServiceInstance: UserService | null = null;

export function getUserService(): UserService {
  if (!userServiceInstance) {
    userServiceInstance = new UserService();
  }
  return userServiceInstance;
}

// Export lazy getter - will only instantiate when first accessed
export const userService = new Proxy({} as UserService, {
  get(target, prop) {
    const instance = getUserService();
    const value = instance[prop as keyof UserService];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export default userService; 