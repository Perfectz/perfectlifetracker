/**
 * frontend/src/components/UserMenu.tsx
 * User menu component for authenticated users
 */
import React, { useState } from 'react';
import { Button, Menu, MenuItem, Avatar, Typography } from '@mui/material';
import { useAuth } from '../services/MockAuthContext';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    signOut();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          color: 'inherit',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar
          alt={user?.name || 'User'}
          src="/avatar-placeholder.png"
          sx={{ width: 32, height: 32 }}
        />
        <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {user?.name || 'User'}
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'user-menu-button',
        }}
      >
        <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
