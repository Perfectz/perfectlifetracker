import request from 'supertest';
import express from 'express';
import { expressjwt as jwt } from 'express-jwt';
import * as profileService from '../../src/services/profileService';
import { Profile } from '../../src/models/Profile';

// Add Jest type declaration
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// Mock the profile service
jest.mock('../../src/services/profileService');

// Mock the CosmosDB container to avoid real client initialization
jest.mock('../../src/services/cosmosClient', () => ({
  getProfilesContainer: jest.fn(() => ({
    items: {
      create: jest.fn(),
      query: jest.fn(),
      upsert: jest.fn()
    },
    item: jest.fn(() => ({
      delete: jest.fn()
    }))
  }))
}));

// Mock the express-jwt middleware
jest.mock('express-jwt', () => ({
  expressjwt: jest.fn(() => (req: any, res: any, next: any) => {
    // Simulate authenticated user
    req.auth = { sub: 'user123', name: 'Test User' };
    next();
  })
}));

describe('Profile API Routes', () => {
  let app: express.Application;
  
  // Mock profile data
  const mockProfile: Profile = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    preferences: {
      theme: 'light',
      notifications: true
    }
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create express app
    app = express();
    app.use(express.json());
    
    // Setup routes (copied from index.ts)
    app.post('/api/profile', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        const profileData = {
          userId: req.auth.sub || req.auth.oid,
          ...req.body
        };
        const newProfile = await profileService.createProfile(profileData);
        res.status(201).json(newProfile);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/profile/:id', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const profile = await profileService.getProfileById(req.params.id);
        if (!profile) {
          return res.status(404).json({ error: 'NotFound', message: 'Profile not found' });
        }
        res.status(200).json(profile);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/profile', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        const userId = req.auth.sub || req.auth.oid;
        const profile = await profileService.getProfileById(userId);
        
        // If no profile exists for this user, return their auth info
        if (!profile) {
          return res.status(200).json(req.auth);
        }
        
        res.status(200).json(profile);
      } catch (error) {
        next(error);
      }
    });

    app.put('/api/profile/:id', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        // Only allow users to update their own profile
        const requestedId = req.params.id;
        const authenticatedId = req.auth.sub || req.auth.oid;
        
        if (requestedId !== authenticatedId) {
          return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'You can only update your own profile' 
          });
        }
        
        const updatedProfile = await profileService.updateProfile(requestedId, req.body);
        if (!updatedProfile) {
          return res.status(404).json({ error: 'NotFound', message: 'Profile not found' });
        }
        
        res.status(200).json(updatedProfile);
      } catch (error) {
        next(error);
      }
    });

    app.delete('/api/profile/:id', jwt({ secret: 'dummy', algorithms: ['HS256'] }), async (req: any, res: express.Response, next: express.NextFunction) => {
      try {
        // Only allow users to delete their own profile
        const requestedId = req.params.id;
        const authenticatedId = req.auth.sub || req.auth.oid;
        
        if (requestedId !== authenticatedId) {
          return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'You can only delete your own profile' 
          });
        }
        
        const success = await profileService.deleteProfile(requestedId);
        if (!success) {
          return res.status(404).json({ error: 'NotFound', message: 'Profile not found' });
        }
        
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    });

    // Error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || 500).json({
        error: err.name || 'InternalServerError',
        message: err.message || 'An unexpected error occurred'
      });
    });
  });

  describe('POST /api/profile', () => {
    it('should create a new profile and return 201', async () => {
      // Mock the createProfile function
      (profileService.createProfile as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app)
        .post('/api/profile')
        .send({ name: 'Test User', email: 'test@example.com' });

      expect(response.status).toBe(201);
      // Use partial matcher to avoid date serialization issues
      expect(response.body).toMatchObject({
        id: mockProfile.id,
        name: mockProfile.name,
        email: mockProfile.email,
        preferences: mockProfile.preferences
      });
      // Check that createdAt is a string (serialized date)
      expect(response.body.createdAt).toEqual(expect.any(String));
      
      expect(profileService.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          name: 'Test User',
          email: 'test@example.com'
        })
      );
    });

    it('should return 500 when profile creation fails', async () => {
      // Mock the createProfile function to throw an error
      (profileService.createProfile as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/profile')
        .send({ name: 'Test User', email: 'test@example.com' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('GET /api/profile/:id', () => {
    it('should return a profile when it exists', async () => {
      // Mock the getProfileById function
      (profileService.getProfileById as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app).get('/api/profile/user123');

      expect(response.status).toBe(200);
      // Use partial matcher to avoid date serialization issues
      expect(response.body).toMatchObject({
        id: mockProfile.id,
        name: mockProfile.name,
        email: mockProfile.email,
        preferences: mockProfile.preferences
      });
      // Check that createdAt is a string (serialized date)
      expect(response.body.createdAt).toEqual(expect.any(String));
      
      expect(profileService.getProfileById).toHaveBeenCalledWith('user123');
    });

    it('should return 404 when profile does not exist', async () => {
      // Mock the getProfileById function to return null
      (profileService.getProfileById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/profile/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'NotFound');
    });
  });

  describe('GET /api/profile (current user)', () => {
    it('should return the user profile when it exists', async () => {
      // Mock the getProfileById function
      (profileService.getProfileById as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app).get('/api/profile');

      expect(response.status).toBe(200);
      // Use partial matcher to avoid date serialization issues
      expect(response.body).toMatchObject({
        id: mockProfile.id,
        name: mockProfile.name,
        email: mockProfile.email,
        preferences: mockProfile.preferences
      });
      // Check that createdAt is a string (serialized date)
      expect(response.body.createdAt).toEqual(expect.any(String));
      
      expect(profileService.getProfileById).toHaveBeenCalledWith('user123');
    });

    it('should return auth info when profile does not exist', async () => {
      // Mock the getProfileById function to return null
      (profileService.getProfileById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/profile');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ sub: 'user123', name: 'Test User' });
    });
  });

  describe('PUT /api/profile/:id', () => {
    const updates = { name: 'Updated User' };
    const updatedProfile = { ...mockProfile, name: 'Updated User' };

    it('should update and return profile when it exists', async () => {
      // Mock the updateProfile function
      (profileService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const response = await request(app)
        .put('/api/profile/user123')
        .send(updates);

      expect(response.status).toBe(200);
      // Use partial matcher to avoid date serialization issues
      expect(response.body).toMatchObject({
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        preferences: updatedProfile.preferences
      });
      // Check that createdAt is a string (serialized date)
      expect(response.body.createdAt).toEqual(expect.any(String));
      
      expect(profileService.updateProfile).toHaveBeenCalledWith('user123', updates);
    });

    it('should return 404 when profile does not exist', async () => {
      // Mock the updateProfile function to return null
      (profileService.updateProfile as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/profile/user123')
        .send(updates);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'NotFound');
    });

    it('should return 403 when updating someone else\'s profile', async () => {
      const response = await request(app)
        .put('/api/profile/another-user')
        .send(updates);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden');
      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/profile/:id', () => {
    it('should delete profile and return 204 when it exists', async () => {
      // Mock the deleteProfile function
      (profileService.deleteProfile as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/profile/user123');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(profileService.deleteProfile).toHaveBeenCalledWith('user123');
    });

    it('should return 404 when profile does not exist', async () => {
      // Mock the deleteProfile function to return false
      (profileService.deleteProfile as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/profile/user123');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'NotFound');
    });

    it('should return 403 when deleting someone else\'s profile', async () => {
      const response = await request(app).delete('/api/profile/another-user');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden');
      expect(profileService.deleteProfile).not.toHaveBeenCalled();
    });
  });
}); 