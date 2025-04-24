import React, { lazy, ReactNode } from 'react';
import { 
  Home as HomeIcon, 
  Dashboard as DashboardIcon, 
  Person as PersonIcon,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';

// Lazy load route components for code-splitting
const DashboardWidget = lazy(() => import('./components/dashboard/DashboardWidget'));
const ProfileContent = lazy(() => import('./components/profile/ProfileContent'));
const GoalRoutes = lazy(() => import('./components/goals/GoalRoutes'));

export interface RouteConfig {
  path: string;
  key: string;
  exact?: boolean;
  text: string;
  icon: ReactNode;
  ariaLabel?: string;
  requireAuth: boolean;
  showInNav: boolean;
  component?: ReactNode;
  lazyComponent?: React.LazyExoticComponent<React.ComponentType<any>>;
  children?: RouteConfig[];
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
    showInNav: true,
    lazyComponent: DashboardWidget
  },
  {
    path: '/profile',
    key: 'PROFILE',
    text: 'Profile',
    icon: <PersonIcon />,
    ariaLabel: 'Navigate to your profile',
    requireAuth: true,
    showInNav: true,
    lazyComponent: ProfileContent
  },
  {
    path: '/goals',
    key: 'GOALS',
    text: 'Fitness Goals',
    icon: <FitnessCenterIcon />,
    ariaLabel: 'Manage your fitness goals',
    requireAuth: true,
    showInNav: true,
    lazyComponent: GoalRoutes
  }
];

export const getAuthorizedRoutes = () => routes.filter(route => route.requireAuth);
export const getPublicRoutes = () => routes.filter(route => !route.requireAuth);
export const getNavigationRoutes = () => routes.filter(route => route.showInNav);

export default routes; 