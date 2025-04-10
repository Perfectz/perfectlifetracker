/**
 * frontend/src/components/LoginButton.tsx
 * Button component for login with various identity providers
 */
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../services/AuthContext';
// import { useAppDispatch } from '../hooks/redux';
// import { openLoginModal, openRegisterModal, openResetModal } from '../store/authSlice';

// SVG icons for providers (imported as React components)
const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#1877F2"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.989 4.388 10.953 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </svg>
);

const LoginButton = () => {
  const { loginWithMicrosoft, loginWithGoogle, loginWithFacebook, isLoading } = useAuth();
  // const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMicrosoftLogin = async () => {
    handleClose();
    await loginWithMicrosoft();
  };

  const handleGoogleLogin = async () => {
    handleClose();
    await loginWithGoogle();
  };

  const handleFacebookLogin = async () => {
    handleClose();
    await loginWithFacebook();
  };

  const handleLoginModal = () => {
    handleClose();
    // dispatch(openLoginModal());
    console.log('Login modal would open here');
  };

  const handleRegisterModal = () => {
    handleClose();
    // dispatch(openRegisterModal());
    console.log('Register modal would open here');
  };

  const handleResetPasswordModal = () => {
    handleClose();
    // dispatch(openResetModal());
    console.log('Reset password modal would open here');
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AccountCircleIcon />}
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
        disabled={isLoading}
      >
        Login
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'login-button',
        }}
      >
        <MenuItem onClick={handleLoginModal}>
          <ListItemText>Sign In</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRegisterModal}>
          <ListItemText>Create Account</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleResetPasswordModal}>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>
        <MenuItem divider />
        <MenuItem onClick={handleMicrosoftLogin}>
          <ListItemIcon>
            <MicrosoftIcon />
          </ListItemIcon>
          <ListItemText>Microsoft</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleGoogleLogin}>
          <ListItemIcon>
            <GoogleIcon />
          </ListItemIcon>
          <ListItemText>Google</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleFacebookLogin}>
          <ListItemIcon>
            <FacebookIcon />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LoginButton; 