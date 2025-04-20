import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { profileService } from '../../services/apiService';

/**
 * ProfileContent component fetches and displays the user's profile information
 */
export const ProfileContent: React.FC = () => {
  const { accounts } = useMsal();
  const [profileData, setProfileData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      fetchProfile();
    }
  }, [accounts]);

  const fetchProfile = async () => {
    if (accounts.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await profileService.getProfile();
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching profile');
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="profile-content">
      <h2>User Profile</h2>
      {profileData ? (
        <div className="profile-data">
          <p><strong>Name:</strong> {profileData.name}</p>
          {profileData.email && <p><strong>Email:</strong> {profileData.email}</p>}
          <p><strong>ID:</strong> {profileData.oid || profileData.sub}</p>
          <pre>{JSON.stringify(profileData, null, 2)}</pre>
        </div>
      ) : (
        <p>No profile data available</p>
      )}
      <button onClick={fetchProfile}>Refresh Profile</button>
    </div>
  );
};

export default ProfileContent; 