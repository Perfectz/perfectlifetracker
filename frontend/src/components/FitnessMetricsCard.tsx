/**
 * frontend/src/components/FitnessMetricsCard.tsx
 * Card component for displaying fitness metrics with circular progress
 */
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  circularProgressClasses,
  styled
} from '@mui/material';
import { terraColors } from '../theme';

// Styled circular progress using Terra colors
const TerraCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: terraColors.tropicalRain,
  [`& .${circularProgressClasses.circle}`]: {
    strokeLinecap: 'round',
  },
}));

// Background circular progress
const BackgroundCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: `${terraColors.softTeal}30`,
  position: 'absolute',
  left: 0,
}));

interface FitnessMetricsCardProps {
  steps?: number;
  goal?: number;
  progress?: number; // 0-100
  title?: string;
}

const FitnessMetricsCard: React.FC<FitnessMetricsCardProps> = ({
  steps = 8423,
  goal = 10000,
  progress = 75, // Default to 75% progress
  title = "Fitness Metrics"
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          mt: 2
        }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <BackgroundCircularProgress
              variant="determinate"
              size={120}
              thickness={6}
              value={100}
            />
            <TerraCircularProgress
              variant="determinate"
              size={120}
              thickness={6}
              value={progress}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h4" component="div" color={terraColors.prussianBlue} fontWeight="bold">
                {progress}%
              </Typography>
              <Typography variant="caption" component="div" color={terraColors.softTeal}>
                Weekly Goal
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="h4" color={terraColors.tropicalRain} fontWeight="bold">
              {steps.toLocaleString()}
            </Typography>
            <Typography variant="body2" color={terraColors.prussianBlue}>
              Steps Today
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FitnessMetricsCard; 