/**
 * frontend/src/components/DevelopmentCard.tsx
 * Card component for tracking personal development activities
 */
import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  linearProgressClasses,
  styled,
} from '@mui/material';
import { terraColors } from '../../src/theme';

// Define the development activity interface
interface DevelopmentActivity {
  id: number;
  name: string;
  progress: number;
}

// Sample development activities data
const sampleActivities: DevelopmentActivity[] = [
  { id: 1, name: 'Spanish Fluency', progress: 65 },
  { id: 2, name: 'Piano Practice', progress: 40 },
  { id: 3, name: 'Business Strategy', progress: 80 },
];

// Styled progress bar using Terra colors
const TerraLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: `${terraColors.pearl}`,
    borderRadius: 5,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: terraColors.tropicalRain,
  },
}));

interface DevelopmentCardProps {
  activities?: DevelopmentActivity[];
  title?: string;
}

const DevelopmentCard: React.FC<DevelopmentCardProps> = ({
  activities = sampleActivities,
  title = 'Development',
}) => {
  // Memoize the rendered activities list
  const renderedActivities = useMemo(() => (
    activities.map(activity => (
      <Box key={activity.id} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color={terraColors.maastrichtBlue}>
            {activity.name}
          </Typography>
          <Typography variant="body2" color={terraColors.tropicalRain} fontWeight="medium">
            {activity.progress}%
          </Typography>
        </Box>
        <TerraLinearProgress variant="determinate" value={activity.progress} />
      </Box>
    ))
  ), [activities]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
          {title}
        </Typography>
        {renderedActivities}
      </CardContent>
    </Card>
  );
};

export default DevelopmentCard;
