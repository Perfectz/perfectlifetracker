// backend/src/models/Profile.ts
// Define the Profile interface for user data

/**
 * Profile interface representing a user profile in the system
 */
export interface Profile {
  id: string;           // Unique identifier for the profile (usually matches auth ID)
  name: string;         // User's full name
  email: string;        // User's email address
  avatarUrl?: string;   // Optional URL to user's avatar image
  bio?: string;         // Optional user biography or description
  createdAt: Date;      // When the profile was created
  updatedAt?: Date;     // When the profile was last updated
  preferences?: {       // Optional user preferences
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
  };
}

/**
 * ProfileCreateDTO - Data Transfer Object for creating a new profile
 * Omits system-generated fields like id and timestamps
 */
export type ProfileCreateDTO = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & {
  userId: string;  // Auth ID of the user this profile belongs to
};

/**
 * ProfileUpdateDTO - Data Transfer Object for updating an existing profile
 * Makes all fields optional except those needed for identification
 */
export type ProfileUpdateDTO = Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>; 