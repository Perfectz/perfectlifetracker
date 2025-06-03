/**
 * frontend/src/components/Layout/Layout.tsx
 * Core responsive layout component with sidebar and header
 */
import React, { useState, ReactNode } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TasksIcon,
  FitnessCenter as FitnessIcon,
  Settings as SettingsIcon,
  AccountCircle as ProfileIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { terraColors } from '../../theme';
import Header from '../Header';
import Footer from '../Footer';
import { useThemeMode } from '../../theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../../services/MockAuthContext';
import LoginButton from '../LoginButton';
import UserMenu from '../UserMenu';

// Constants
const DRAWER_WIDTH = 240;

// Styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// Navigation items with Home and protected flags
const navigationItems = [
  { name: 'Home', path: '/', icon: <HomeIcon />, protected: false },
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, protected: true },
  { name: 'Tasks', path: '/dashboard/tasks', icon: <TasksIcon />, protected: true },
  { name: 'Fitness', path: '/dashboard/fitness', icon: <FitnessIcon />, protected: true },
  { name: 'Settings', path: '/dashboard/settings', icon: <SettingsIcon />, protected: true },
  { name: 'Profile', path: '/dashboard/profile', icon: <ProfileIcon />, protected: true },
];

interface LayoutProps {
  children?: ReactNode;
  title?: string;
  useStandardHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Perfect LifeTracker Pro',
  useStandardHeader = false,
}) => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Filter items based on authentication
  const drawerItems = navigationItems.filter(item => !item.protected || isAuthenticated);
  const drawer = (
    <>
      <DrawerHeader>
        <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
          LifeTracker Pro
        </Typography>
        {open && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>
      <Divider />
      <List>
        {drawerItems.map(item => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          width: { md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: open ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: terraColors.tropicalRain, // Match the terraColors theme
          color: terraColors.white,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {/* Theme toggle and user menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            {isAuthenticated ? <UserMenu /> : <LoginButton />}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav">
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="persistent"
            open={open}
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: open ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Spacer to push content below the AppBar */}
        {/* Optionally use the standard Header component */}
        {useStandardHeader && <Header height={180} marginBottom={3} />}
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
      {/* Footer at the bottom of the layout */}
      <Footer />
    </Box>
  );
};

export default Layout;
