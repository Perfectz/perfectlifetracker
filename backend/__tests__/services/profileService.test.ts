import { Profile, ProfileCreateDTO } from '../../src/models/Profile';
import * as cosmosClientModule from '../../src/services/cosmosClient';
import { createProfile, getProfileById, updateProfile, deleteProfile } from '../../src/services/profileService';

// Mock the cosmosClient module
jest.mock('../../src/services/cosmosClient', () => ({
  getProfilesContainer: jest.fn()
}));

describe('Profile Service', () => {
  // Mock data
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

  const mockCreateDTO: ProfileCreateDTO = {
    userId: 'user123',
    name: 'Test User',
    email: 'test@example.com'
  };

  // Mock container for CosmosDB operations
  const mockContainer = {
    items: {
      create: jest.fn().mockResolvedValue({ resource: mockProfile }),
      query: jest.fn().mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [mockProfile] })
      }),
      upsert: jest.fn().mockResolvedValue({ resource: { ...mockProfile, name: 'Updated User' } })
    },
    item: jest.fn().mockReturnValue({
      delete: jest.fn().mockResolvedValue({ resource: { id: 'user123' } })
    })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the getProfilesContainer to return our mock container
    (cosmosClientModule.getProfilesContainer as jest.Mock).mockReturnValue(mockContainer);
  });

  describe('createProfile', () => {
    it('should create a profile and return it', async () => {
      const result = await createProfile(mockCreateDTO);
      
      expect(mockContainer.items.create).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      }));
      
      expect(result).toEqual(mockProfile);
    });

    it('should throw an error if creation fails', async () => {
      mockContainer.items.create.mockResolvedValueOnce({ resource: undefined });
      
      await expect(createProfile(mockCreateDTO)).rejects.toThrow('Failed to create profile');
    });
  });

  describe('getProfileById', () => {
    it('should return a profile when it exists', async () => {
      const result = await getProfileById('user123');
      
      expect(mockContainer.items.query).toHaveBeenCalledWith(expect.objectContaining({
        query: expect.stringContaining('c.id = @id'),
        parameters: expect.arrayContaining([
          expect.objectContaining({ value: 'user123' })
        ])
      }));
      
      expect(result).toEqual(mockProfile);
    });

    it('should return null when profile does not exist', async () => {
      mockContainer.items.query.mockReturnValueOnce({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] })
      });
      
      const result = await getProfileById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile when it exists', async () => {
      const updates = { name: 'Updated User' };
      const result = await updateProfile('user123', updates);
      
      expect(mockContainer.items.upsert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user123',
        name: 'Updated User',
      }));
      
      expect(result).toEqual(expect.objectContaining({
        name: 'Updated User'
      }));
    });

    it('should return null when profile does not exist', async () => {
      // Mock getProfileById to return null
      mockContainer.items.query.mockReturnValueOnce({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] })
      });
      
      const updates = { name: 'Updated User' };
      const result = await updateProfile('nonexistent', updates);
      
      expect(mockContainer.items.upsert).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteProfile', () => {
    it('should delete profile and return true when it exists', async () => {
      const result = await deleteProfile('user123');
      
      expect(mockContainer.item).toHaveBeenCalledWith('user123', 'user123');
      expect(mockContainer.item('user123', 'user123').delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when profile does not exist', async () => {
      // Mock getProfileById to return null
      mockContainer.items.query.mockReturnValueOnce({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] })
      });
      
      const result = await deleteProfile('nonexistent');
      
      expect(mockContainer.item).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
}); 