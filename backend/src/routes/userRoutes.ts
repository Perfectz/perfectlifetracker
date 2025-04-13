/**
 * backend/src/routes/userRoutes.ts
 * API routes for user management
 */
import express from 'express';
import UserModel from '../models/UserModel';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// JWT validation middleware
const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`
  }),
  audience: process.env.AZURE_CLIENT_ID,
  issuer: process.env.AZURE_AUTHORITY,
  algorithms: ['RS256']
});

// Get current user profile
router.get('/me', checkJwt, async (req: JWTRequest, res) => {
  try {
    // Get identity from the token
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing user information in token' });
    }
    
    // Look up user in our database
    let user = await UserModel.getUserByEmail(email as string);
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = await UserModel.createUser({
        username: email.split('@')[0],
        email: email as string,
        password: uuidv4(), // Generate a random password for SSO users
        firstName: req.auth?.given_name || '',
        lastName: req.auth?.family_name || '',
        role: 'user'
      });
    } else {
      // Update last login timestamp
      await UserModel.updateLastLogin(user.id);
    }
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user by ID (admin or self only)
router.get('/:id', checkJwt, async (req: JWTRequest, res) => {
  try {
    const requesterId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    const requestedUserId = req.params.id;
    
    if (!requesterId || !email) {
      return res.status(400).json({ error: 'Missing user information in token' });
    }
    
    // Get requester user to check permissions
    const requester = await UserModel.getUserByEmail(email as string);
    
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }
    
    // Only allow admins or the user themselves to view user profiles
    if (requester.role !== 'admin' && requester.id !== requestedUserId) {
      return res.status(403).json({ error: 'Unauthorized to access this user profile' });
    }
    
    // Get the requested user
    const user = await UserModel.getUserById(requestedUserId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Search users (admin only)
router.get('/search/:query', checkJwt, async (req: JWTRequest, res) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    const searchQuery = req.params.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email in token' });
    }
    
    // Get the requester to check if they're an admin
    const requester = await UserModel.getUserByEmail(email as string);
    
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }
    
    // Only admins can search users
    if (requester.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to search users' });
    }
    
    const users = await UserModel.searchUsers(searchQuery, limit);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Update user profile (self only)
router.put('/profile', checkJwt, async (req: JWTRequest, res) => {
  try {
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing user information in token' });
    }
    
    // Get the user from database
    const user = await UserModel.getUserByEmail(email as string);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fields that can be updated by the user
    const {
      username,
      firstName,
      lastName,
      bio,
      profilePicture
    } = req.body;
    
    // Update user profile
    const updatedUser = await UserModel.updateUser(user.id, {
      username,
      firstName,
      lastName,
      bio,
      profilePicture
    });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Failed to update user profile' });
    }
    
    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Update user preferences
router.patch('/preferences', checkJwt, async (req: JWTRequest, res) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email in token' });
    }
    
    // Get the user
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    const updatedUser = await UserModel.updateUser(user.id, {
      ...req.body
    });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Failed to update user' });
    }
    
    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Change password
router.post('/change-password', checkJwt, async (req: JWTRequest, res) => {
  try {
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing user information in token' });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Get user from database
    const user = await UserModel.getUserByEmail(email as string);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Change password
    const success = await UserModel.changePassword(user.id, currentPassword, newPassword);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to change password' });
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Deactivate account (self only)
router.post('/deactivate', checkJwt, async (req: JWTRequest, res) => {
  try {
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing user information in token' });
    }
    
    // Get user from database
    const user = await UserModel.getUserByEmail(email as string);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Deactivate account
    const success = await UserModel.deactivateUser(user.id);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to deactivate account' });
    }
    
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

// Reactivate account (admin only)
router.post('/reactivate/:id', checkJwt, async (req: JWTRequest, res) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    const userIdToReactivate = req.params.id;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email in token' });
    }
    
    // Get requester to check if they're an admin
    const requester = await UserModel.getUserByEmail(email as string);
    
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }
    
    // Only admins can reactivate accounts
    if (requester.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to reactivate accounts' });
    }
    
    // Reactivate account
    const success = await UserModel.reactivateUser(userIdToReactivate);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to reactivate account' });
    }
    
    res.json({ message: 'Account reactivated successfully' });
  } catch (error) {
    console.error('Error reactivating account:', error);
    res.status(500).json({ error: 'Failed to reactivate account' });
  }
});

// Delete account (admin or self only)
router.delete('/:id', checkJwt, async (req: JWTRequest, res) => {
  try {
    const requesterId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    const userIdToDelete = req.params.id;
    
    if (!requesterId || !email) {
      return res.status(400).json({ error: 'Missing user information in token' });
    }
    
    // Get requester user
    const requester = await UserModel.getUserByEmail(email as string);
    
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }
    
    // Check if requester is admin or the user themselves
    if (requester.role !== 'admin' && requester.id !== userIdToDelete) {
      return res.status(403).json({ error: 'Unauthorized to delete this account' });
    }
    
    // Delete the account
    const success = await UserModel.deleteUser(userIdToDelete);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to delete account' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Create a public demo user (no auth required)
router.post('/demo', async (req, res) => {
  try {
    // Check if demo user already exists
    const existingUser = await UserModel.getUserByEmail('demo@perfectlifetracker.com');
    
    if (existingUser) {
      return res.json({
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        message: 'Using existing demo account'
      });
    }
    
    // Create new demo user
    const demoUser = await UserModel.createUser({
      username: 'demouser',
      email: 'demo@perfectlifetracker.com',
      password: 'Demo@123', // This is a demo account, so using a simple password
      firstName: 'Demo',
      lastName: 'User',
      role: 'user'
    });
    
    res.json({
      id: demoUser.id,
      email: demoUser.email,
      username: demoUser.username,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      message: 'Demo account created successfully'
    });
  } catch (error) {
    console.error('Error creating demo user:', error);
    res.status(500).json({ error: 'Failed to create demo user' });
  }
});

export default router; 