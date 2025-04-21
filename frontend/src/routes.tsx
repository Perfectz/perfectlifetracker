import React from 'react';
import { 
  Home as HomeIcon, 
  Dashboard as DashboardIcon, 
  Person as PersonIcon 
} from '@mui/icons-material';

export interface RouteConfig {
  path: string;
  key: string;
  exact?: boolean;
  text: string;
  icon: React.ReactNode;
  ariaLabel?: string;
  requireAuth: boolean;
  showInNav: boolean;
}

const routes: RouteConfig[] = [
  {
    path: '/',
    key: 'HOME',
    exact: true,
    text: 'Home',
    icon: <HomeIcon />,
    ariaLabel: 'Navigate to home page',
    requireAuth: false,
    showInNav: true
  },
  {
    path: '/dashboard',
    key: 'DASHBOARD',
    text: 'Dashboard',
    icon: <DashboardIcon />,
    ariaLabel: 'Navigate to dashboard',
    requireAuth: true,
    showInNav: true
  },
  {
    path: '/profile',
    key: 'PROFILE',
    text: 'Profile',
    icon: <PersonIcon />,
    ariaLabel: 'Navigate to your profile',
    requireAuth: true,
    showInNav: true
  }
];

export const getAuthorizedRoutes = () => routes.filter(route => route.requireAuth);
export const getNavigationRoutes = () => routes.filter(route => route.showInNav);
export const getPublicRoutes = () => routes.filter(route => !route.requireAuth);

export default routes; 