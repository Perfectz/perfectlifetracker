// backend/src/services/profileService.ts
// Service for profile CRUD operations

import { getProfilesContainer } from './cosmosClient';
import { Profile, ProfileCreateDTO, ProfileUpdateDTO } from '../models/Profile';

/**
 * Create a new user profile
 * @param profileData Profile creation data
 * @returns The created profile
 */
export async function createProfile(profileData: ProfileCreateDTO): Promise<Profile> {
  const container = getProfilesContainer();
  
  const profile: Profile = {
    id: profileData.userId, // Use the auth userId as the profile id
    name: profileData.name,
    email: profileData.email,
    avatarUrl: profileData.avatarUrl,
    bio: profileData.bio,
    createdAt: new Date(),
    preferences: profileData.preferences || {
      theme: 'system',
      notifications: true
    }
  };
  
  const { resource } = await container.items.create(profile);
  // Handle potential undefined return value
  if (!resource) {
    throw new Error('Failed to create profile');
  }
  return resource as unknown as Profile;
}

/**
 * Get a profile by its ID
 * @param id Profile ID to retrieve
 * @returns The profile or null if not found
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const container = getProfilesContainer();
  
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.id = @id',
    parameters: [
      {
        name: '@id',
        value: id
      }
    ]
  };
  
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources.length > 0 ? resources[0] : null;
}

/**
 * Update an existing profile
 * @param id Profile ID to update
 * @param updates Profile fields to update
 * @returns The updated profile
 */
export async function updateProfile(id: string, updates: ProfileUpdateDTO): Promise<Profile | null> {
  const container = getProfilesContainer();
  
  // First get the existing profile
  const existingProfile = await getProfileById(id);
  if (!existingProfile) {
    return null;
  }
  
  // Merge updates with existing profile
  const updatedProfile: Profile = {
    ...existingProfile,
    ...updates,
    id, // Ensure ID doesn't change
    createdAt: existingProfile.createdAt, // Preserve original creation date
    updatedAt: new Date() // Update the updated timestamp
  };
  
  const { resource } = await container.items.upsert(updatedProfile);
  // Handle potential undefined return value
  if (!resource) {
    throw new Error('Failed to update profile');
  }
  return resource as unknown as Profile;
}

/**
 * Delete a profile by ID
 * @param id Profile ID to delete
 * @returns True if successful, false if profile not found
 */
export async function deleteProfile(id: string): Promise<boolean> {
  const container = getProfilesContainer();
  
  // Check if profile exists
  const profile = await getProfileById(id);
  if (!profile) {
    return false;
  }
  
  // Delete the profile - Fix: Use item() method instead of items.delete
  const { resource } = await container.item(id, id).delete();
  return !!resource;
}

/**
 * Get all profiles (for admin purposes)
 * @param limit Maximum number of profiles to return
 * @returns Array of profiles
 */
export async function getAllProfiles(limit = 100): Promise<Profile[]> {
  const container = getProfilesContainer();
  
  const querySpec = {
    query: 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit',
    parameters: [
      {
        name: '@limit',
        value: limit
      }
    ]
  };
  
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
} 