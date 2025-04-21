import React from 'react';
import { useUser } from '../../hooks/useUser';

/**
 * SignOutButton component renders a button that handles user sign out
 */
export const SignOutButton: React.FC = () => {
  const { logout, userName } = useUser();

  return (
    <div className="sign-out-container">
      <span className="user-name">Hello, {userName}</span>
      <button 
        className="sign-out-button" 
        onClick={logout}
      >
        Sign Out
      </button>
    </div>
  );
};

export default SignOutButton; 