import React, { useState, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import SignOutButton from '../auth/SignOutButton';
import { getNavigationRoutes } from '../../routes';

const drawerWidth = 240;

const NavBar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get routes from centralized configuration
  const navItems = getNavigationRoutes();

  // Memoize handlers to prevent unnecessary re-renders
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  }, [mobileOpen, navigate]);

  // Calculate which navigation item is active based on current path
  const getActiveIndex = useCallback(() => {
    const index = navItems.findIndex(item => location.pathname === item.path);
    return index >= 0 ? index : 0;
  }, [location.pathname, navItems]);

  // Keyboard navigation handler for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent, path: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigation(path);
    }
  }, [handleNavigation]);

  // Sidebar drawer content
  const drawer = (
    <div>
      <Toolbar />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              aria-label={item.ariaLabel}
              onKeyDown={(e) => handleKeyDown(e, item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open navigation menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            LifeTracker Pro
          </Typography>
          <SignOutButton />
        </Toolbar>
      </AppBar>
      
      {/* The mobile drawer (temporary) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      {/* The desktop drawer (permanent) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
      
      {/* Content wrapper */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Space for AppBar
          mb: { xs: 7, md: 0 }, // Space for BottomNavigation on mobile
        }}
      >
        {/* This is where the main content will go */}
      </Box>
      
      {/* Bottom navigation for mobile */}
      {isMobile && (
        <nav aria-label="mobile navigation">
          <Paper
            sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
            elevation={3}
          >
            <BottomNavigation
              showLabels
              value={getActiveIndex()}
              onChange={(_, newValue) => {
                handleNavigation(navItems[newValue].path);
              }}
            >
              {navItems.map((item) => (
                <BottomNavigationAction
                  key={item.key}
                  label={item.text}
                  icon={item.icon}
                  aria-label={item.ariaLabel}
                />
              ))}
            </BottomNavigation>
          </Paper>
        </nav>
      )}
    </Box>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(NavBar); 