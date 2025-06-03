/**
 * frontend/src/components/Dashboard/Dashboard.tsx
 * Dashboard component with grid layout for widgets
 */
import React, { ReactNode } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import Grid from '../../components/Grid';
import { styled } from '@mui/material/styles';

// Widget types
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface WidgetProps {
  id: string;
  title: string;
  size?: WidgetSize;
  children: ReactNode;
  height?: number | string;
}

// Styled components
const WidgetContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const WidgetHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const WidgetContent = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
});

// Map widget sizes to grid columns
const sizeToColumns = {
  small: { xs: 12, sm: 6, md: 4, lg: 3 },
  medium: { xs: 12, sm: 12, md: 6, lg: 6 },
  large: { xs: 12, md: 8, lg: 8 },
  full: { xs: 12 },
};

/**
 * Individual Widget Component
 */
export const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  children,
  size = 'medium',
  height = 'auto',
}) => {
  return (
    <Grid item {...sizeToColumns[size]}>
      <WidgetContainer elevation={1} id={`widget-${id}`} sx={{ height }}>
        <WidgetHeader>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        </WidgetHeader>
        <WidgetContent>{children}</WidgetContent>
      </WidgetContainer>
    </Grid>
  );
};

/**
 * Dashboard Container Component
 */
interface DashboardProps {
  children: ReactNode;
  spacing?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ children, spacing = 3 }) => {
  return (
    <Box sx={{ flexGrow: 1, py: 2 }}>
      <Grid container spacing={spacing}>
        {children}
      </Grid>
    </Box>
  );
};

export default Dashboard;
