/**
 * frontend/src/components/TerraAppBar.tsx
 * App bar component for Terra design
 */
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  InputBase,
  Avatar,
  IconButton,
  styled,
  alpha,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { terraColors } from '../../src/theme';
import { useAuth } from '../hooks/useAuth';

// Styled search input
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 16,
  backgroundColor: terraColors.maastrichtBlue,
  '&:hover': {
    backgroundColor: alpha(terraColors.maastrichtBlue, 0.9),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(terraColors.pearl, 0.7),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: terraColors.pearl,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const TerraAppBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userProfile, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDevelopment = import.meta.env.MODE === 'development';

  // Determine the initials to display
  const getUserInitials = (): string => {
    // In development mode, show PLT (PerfectLifeTrack) as initials
    if (isDevelopment) {
      return 'PLT';
    }

    // If we have a user profile, extract initials from name
    if (userProfile && userProfile.name) {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      } else if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
      }
    }

    // Fallback to generic user initials
    return 'UR'; // User
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleMenuClose();
    signOut();
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: terraColors.prussianBlue,
        height: 64,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            display: { xs: 'none', sm: 'block' },
            color: terraColors.pearl,
            fontWeight: 600,
          }}
        >
          PerfectLifeTrack Pro
        </Typography>

        {/* Mobile Logo */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            display: { xs: 'block', sm: 'none' },
            color: terraColors.pearl,
            fontWeight: 600,
          }}
        >
          PLT Pro
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
        </Search>

        {/* User Avatar */}
        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{ ml: 2 }}
          aria-controls="user-menu"
          aria-haspopup="true"
        >
          <Avatar
            sx={{
              bgcolor: terraColors.softTeal,
              color: terraColors.pearl,
              width: 32,
              height: 32,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {getUserInitials()}
          </Avatar>
        </IconButton>

        {/* User Menu */}
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              window.location.href = '/profile';
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              window.location.href = '/settings';
            }}
          >
            Settings
          </MenuItem>
          {isDevelopment && (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                if (typeof (window as any).toggleAuth === 'function') {
                  (window as any).toggleAuth();
                }
              }}
            >
              Toggle Auth (Dev)
            </MenuItem>
          )}
          <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TerraAppBar;
