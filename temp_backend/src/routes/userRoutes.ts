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
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    if (!userId || !email) {
      res.status(400).json({ error: 'Missing user information in token' });
      return;
    }
    let user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      user = await UserModel.createUser({
        username: email.split('@')[0],
        email: email as string,
        password: uuidv4(),
        firstName: req.auth?.given_name || '',
        lastName: req.auth?.family_name || '',
        role: 'user'
      });
    } else {
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
    return;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
    return;
  }
});

// Get user by ID (admin or self only)
router.get('/:id', checkJwt, async (req: JWTRequest, res) => {
  try {
    const requesterId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    const requestedUserId = req.params.id;
    if (!requesterId || !email) {
      res.status(400).json({ error: 'Missing user information in token' });
      return;
    }
    const requester = await UserModel.getUserByEmail(email as string);
    if (!requester) {
      res.status(404).json({ error: 'Requester not found' });
      return;
    }
    if (requester.role !== 'admin' && requester.id !== requestedUserId) {
      res.status(403).json({ error: 'Unauthorized to access this user profile' });
      return;
    }
    const user = await UserModel.getUserById(requestedUserId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
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
    return;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
    return;
  }
});

// Search users (admin only)
router.get('/search/:query', checkJwt, async (req: JWTRequest, res) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    const searchQuery = req.params.query;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    if (!email) {
      res.status(400).json({ error: 'Missing email in token' });
      return;
    }
    const requester = await UserModel.getUserByEmail(email as string);
    if (!requester) {
      res.status(404).json({ error: 'Requester not found' });
      return;
    }
    if (requester.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to search users' });
      return;
    }
    const users = await UserModel.searchUsers(searchQuery, limit);
    res.json(users);
    return;
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
    return;
  }
});

// Update user profile (self only)
router.put('/profile', checkJwt, async (req: JWTRequest, res) => {
  try {
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    if (!userId || !email) {
      res.status(400).json({ error: 'Missing user information in token' });
      return;
    }
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const {
      username,
      firstName,
      lastName,
      bio,
      profilePicture
    } = req.body;
    const updatedUser = await UserModel.updateUser(user.id, {
      username,
      firstName,
      lastName,
      bio,
      profilePicture
    });
    if (!updatedUser) {
      res.status(404).json({ error: 'Failed to update user profile' });
      return;
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
    return;
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
    return;
  }
});

// Update user preferences
router.patch('/preferences', checkJwt, async (req: JWTRequest, res) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    if (!email) {
      res.status(400).json({ error: 'Missing email in token' });
      return;
    }
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const updatedUser = await UserModel.updateUser(user.id, {
      ...req.body
    });
    if (!updatedUser) {
      res.status(404).json({ error: 'Failed to update user' });
      return;
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
    return;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
    return;
  }
});

// Change password
router.post('/change-password', checkJwt, async (req: JWTRequest, res) => {
  try {
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    const { currentPassword, newPassword } = req.body;
    if (!userId || !email) {
      res.status(400).json({ error: 'Missing user information in token' });
      return;
    }
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const success = await UserModel.changePassword(user.id, currentPassword, newPassword);
    if (!success) {
      res.status(400).json({ error: 'Failed to change password' });
      return;
    }
    res.json({ message: 'Password changed successfully' });
    return;
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
    return;
  }
});

// Deactivate account (self only)
router.post('/deactivate', checkJwt, async (req: JWTRequest, res) => {
  try {
    const userId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    if (!userId || !email) {
      res.status(400).json({ error: 'Missing user information in token' });
      return;
    }
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const success = await UserModel.deactivateUser(user.id);
    if (!success) {
      res.status(400).json({ error: 'Failed to deactivate account' });
      return;
    }
    res.json({ message: 'Account deactivated successfully' });
    return;
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
    return;
  }
});

// Reactivate account (admin only)
router.post('/reactivate/:id', checkJwt, async (req: JWTRequest, res) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    const userIdToReactivate = req.params.id;
    if (!email) {
      res.status(400).json({ error: 'Missing email in token' });
      return;
    }
    const requester = await UserModel.getUserByEmail(email as string);
    if (!requester) {
      res.status(404).json({ error: 'Requester not found' });
      return;
    }
    if (requester.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to reactivate accounts' });
      return;
    }
    const success = await UserModel.reactivateUser(userIdToReactivate);
    if (!success) {
      res.status(400).json({ error: 'Failed to reactivate account' });
      return;
    }
    res.json({ message: 'Account reactivated successfully' });
    return;
  } catch (error) {
    console.error('Error reactivating account:', error);
    res.status(500).json({ error: 'Failed to reactivate account' });
    return;
  }
});

// Delete account (admin or self only)
router.delete('/:id', checkJwt, async (req: JWTRequest, res) => {
  try {
    const requesterId = req.auth?.sub;
    const email = req.auth?.email || req.auth?.preferred_username;
    const userIdToDelete = req.params.id;
    if (!requesterId || !email) {
      res.status(400).json({ error: 'Missing user information in token' });
      return;
    }
    const requester = await UserModel.getUserByEmail(email as string);
    if (!requester) {
      res.status(404).json({ error: 'Requester not found' });
      return;
    }
    if (requester.role !== 'admin' && requester.id !== userIdToDelete) {
      res.status(403).json({ error: 'Unauthorized to delete this account' });
      return;
    }
    const success = await UserModel.deleteUser(userIdToDelete);
    if (!success) {
      res.status(400).json({ error: 'Failed to delete account' });
      return;
    }
    res.json({ message: 'Account deleted successfully' });
    return;
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
    return;
  }
});

// Create a public demo user (no auth required)
router.post('/demo', async (req, res) => {
  try {
    const existingUser = await UserModel.getUserByEmail('demo@perfectlifetracker.com');
    if (existingUser) {
      res.json({
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        message: 'Using existing demo account'
      });
      return;
    }
    const demoUser = await UserModel.createUser({
      username: 'demouser',
      email: 'demo@perfectlifetracker.com',
      password: 'Demo@123',
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
    return;
  } catch (error) {
    console.error('Error creating demo user:', error);
    res.status(500).json({ error: 'Failed to create demo user' });
    return;
  }
});

export default router;