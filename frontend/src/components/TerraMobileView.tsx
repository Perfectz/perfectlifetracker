/**
 * frontend/src/components/TerraMobileView.tsx
 * Mobile view demonstration of the Terra UI
 */
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  styled, 
  LinearProgress,
  linearProgressClasses,
  IconButton,
  Fab
} from '@mui/material';
import { terraColors } from '../theme';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Container for the mobile device frame
const MobileFrame = styled(Paper)(({ theme }) => ({
  width: 320,
  height: 600,
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
}));

// App bar for mobile view
const MobileAppBar = styled(Box)(({ theme }) => ({
  backgroundColor: terraColors.prussianBlue,
  padding: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

// Content area
const MobileContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: terraColors.pearl,
  padding: 16,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}));

// Welcome card
const WelcomeCard = styled(Paper)(({ theme }) => ({
  padding: 16,
  backgroundColor: '#fff',
  borderRadius: 8,
  border: `1px solid ${terraColors.softTeal}20`,
}));

// Progress bar using Terra colors
const TerraProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: `${terraColors.pearl}`,
  },
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: terraColors.tropicalRain,
  },
}));

// Quick action buttons
const QuickActionButton = styled(Paper)(({ theme }) => ({
  width: 80,
  height: 80,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  borderRadius: 8,
  cursor: 'pointer',
  border: `1px solid ${terraColors.softTeal}20`,
}));

// Upcoming item
const UpcomingItem = styled(Paper)(({ theme }) => ({
  padding: '12px 16px',
  backgroundColor: '#fff',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: `1px solid ${terraColors.softTeal}20`,
}));

// Action buttons
const ActionButton = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: terraColors.pearl,
  color: terraColors.maastrichtBlue,
  fontSize: 18,
  fontWeight: 'bold',
  margin: '0 4px',
}));

const TerraMobileView: React.FC = () => {
  return (
    <MobileFrame>
      {/* App Bar */}
      <MobileAppBar>
        <Typography variant="h6" color="#fff" fontWeight="medium">
          PerfectLifeTrack
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: terraColors.pearl }}>
            <HelpOutlineIcon />
          </IconButton>
        </Box>
      </MobileAppBar>

      {/* Content */}
      <MobileContent>
        {/* Welcome Card */}
        <WelcomeCard>
          <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
            Good Morning, Jane!
          </Typography>
          <Typography variant="body2" color={terraColors.maastrichtBlue} gutterBottom>
            You have 3 goals to complete today
          </Typography>
          <Typography variant="caption" color={terraColors.softTeal}>
            AI-powered insights available
          </Typography>
        </WelcomeCard>

        {/* Progress Bar */}
        <Paper sx={{ p: 2, backgroundColor: '#fff', borderRadius: 8, border: `1px solid ${terraColors.softTeal}20` }}>
          <Typography variant="subtitle2" color={terraColors.prussianBlue} gutterBottom>
            Today's Progress
          </Typography>
          <TerraProgressBar variant="determinate" value={75} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color={terraColors.tropicalRain}>
              75% Complete
            </Typography>
            <Typography variant="caption" color={terraColors.softTeal}>
              25% remaining
            </Typography>
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <QuickActionButton>
            <FitnessCenterIcon sx={{ color: terraColors.tropicalRain, mb: 1 }} />
            <Typography variant="caption" color={terraColors.maastrichtBlue}>
              Workout
            </Typography>
          </QuickActionButton>
          <QuickActionButton>
            <MenuBookIcon sx={{ color: terraColors.tropicalRain, mb: 1 }} />
            <Typography variant="caption" color={terraColors.maastrichtBlue}>
              Journal
            </Typography>
          </QuickActionButton>
          <QuickActionButton>
            <ChecklistIcon sx={{ color: terraColors.tropicalRain, mb: 1 }} />
            <Typography variant="caption" color={terraColors.maastrichtBlue}>
              Tasks
            </Typography>
          </QuickActionButton>
        </Box>

        {/* Upcoming */}
        <Box>
          <Typography variant="subtitle2" color={terraColors.prussianBlue} gutterBottom>
            Coming Up Next
          </Typography>
          <UpcomingItem>
            <Typography variant="body2" color={terraColors.maastrichtBlue}>
              Team Meeting
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <ActionButton>H</ActionButton>
              <ActionButton>F</ActionButton>
              <ActionButton>D</ActionButton>
              <ActionButton>T</ActionButton>
            </Box>
          </UpcomingItem>
        </Box>
      </MobileContent>

      {/* Floating Action Button */}
      <Box sx={{ position: 'absolute', bottom: 24, right: 24 }}>
        <Fab 
          size="medium" 
          sx={{ 
            backgroundColor: terraColors.tropicalRain, 
            color: terraColors.pearl,
            '&:hover': {
              backgroundColor: terraColors.prussianBlue,
            }
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    </MobileFrame>
  );
};

export default TerraMobileView; 