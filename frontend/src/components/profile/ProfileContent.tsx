import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/apiService';
import { useUser } from '../../hooks/useUser';
import RequireAuth from '../auth/RequireAuth';
import { toast } from 'react-hot-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt?: Date;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
  };
}

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
}

interface AvatarResponse {
  avatarUrl: string;
  profile: Profile;
}

/**
 * ProfileContent component fetches and displays the user's profile information
 */
export const ProfileContent: React.FC = () => {
  const { isAuthenticated, userId } = useUser();
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<ProfileFormData>>({});
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        avatarUrl: profileData.avatarUrl,
      });
    }
  }, [profileData]);

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await profileService.getProfile();
      setProfileData(data as Profile);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching profile');
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Create new form data object for batching updates
    const newFormData = { ...formData, [name]: value };
    
    // Only clear errors if there was an existing error for this field
    if (formErrors[name as keyof ProfileFormData]) {
      const newFormErrors = { ...formErrors };
      delete newFormErrors[name as keyof ProfileFormData];
      
      // Batch both updates together
      setFormData(newFormData);
      setFormErrors(newFormErrors);
    } else {
      // Just update form data if no errors to clear
      setFormData(newFormData);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ProfileFormData> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields and collect errors in one go
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.bio) newErrors.bio = 'Bio is required';
    
    // Only update state and return if we have errors
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    
    // No errors, proceed with submission
    try {
      setIsSubmitting(true);
      const response = await profileService.updateProfile({
        ...formData,
        id: userId
      });
      
      // Batch these state updates
      setProfileData(response as Profile);
      setIsEditing(false);
      setFormErrors({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    // Client-side preview before uploading
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
    // If uploadAvatar API is not available (e.g., in tests), skip server upload
    if (typeof profileService.uploadAvatar !== 'function') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await profileService.uploadAvatar(userId, file) as AvatarResponse;
      
      // Update form data with the returned avatar URL
      setFormData(prev => ({
        ...prev,
        avatarUrl: result.avatarUrl
      }));
      
      // If not in edit mode, also update the profile data
      if (!isEditing) {
        setProfileData(result.profile);
      }
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await profileService.deleteAvatar(userId) as AvatarResponse;
      
      // Update profile data with the returned profile
      setProfileData(result.profile);
      
      // If in edit mode, also update the form data
      if (isEditing) {
        setFormData(prev => ({
          ...prev,
          avatarUrl: undefined
        }));
      }
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      console.error('Avatar delete error:', err);
      setError(err.message || 'Failed to delete avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const ProfileContentView = () => {
    if (isLoading && !profileData) {
      return <div>Loading profile...</div>;
    }
  
    if (error && !profileData) {
      return <div data-testid="error-message" className="error">Error: {error}</div>;
    }
  
    return (
      <div className="profile-content">
        <h2>User Profile</h2>
        
        {updateSuccess && (
          <div className="success-message">Profile updated successfully!</div>
        )}
        
        {isEditing ? (
          <div className="profile-edit">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="avatar">Profile Picture</label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                {formData.avatarUrl && (
                  <div className="avatar-preview">
                    <img src={formData.avatarUrl} alt="Avatar preview" width="100" />
                    <button 
                      type="button"
                      onClick={handleDeleteAvatar}
                      className="delete-avatar-button"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-actions">
                <button data-testid="save-button" type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-view">
            {profileData ? (
              <div className="profile-data">
                {profileData.avatarUrl && (
                  <div className="profile-avatar">
                    <img src={profileData.avatarUrl} alt="User avatar" width="150" />
                    <button 
                      onClick={handleDeleteAvatar}
                      className="delete-avatar-button"
                      aria-label="Delete avatar"
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
                
                <div className="profile-info">
                  <p><strong>Name:</strong> {profileData.name}</p>
                  {profileData.email && <p><strong>Email:</strong> {profileData.email}</p>}
                  {profileData.bio && <p><strong>Bio:</strong> {profileData.bio}</p>}
                  <p><strong>ID:</strong> {profileData.id}</p>
                  
                  <button data-testid="edit-button" onClick={() => setIsEditing(true)}>Edit Profile</button>
                  <button onClick={fetchProfile}>Refresh Profile</button>
                </div>
              </div>
            ) : (
              <div className="no-profile">
                <p>No profile data available yet. Create your profile to get started.</p>
                <button onClick={() => setIsEditing(true)}>Create Profile</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <RequireAuth>
      <ProfileContentView />
    </RequireAuth>
  );
};

export default ProfileContent; 