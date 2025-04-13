/**
 * frontend/src/components/GoalsCard.tsx
 * Card component for displaying user's daily goals with progress
 */
import React from 'react';
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

// Define the goal interface
interface Goal {
  id: number;
  name: string;
  progress: number;
}

// Sample goals data
const sampleGoals: Goal[] = [
  { id: 1, name: 'Morning Run', progress: 75 },
  { id: 2, name: 'Study Spanish', progress: 50 },
  { id: 3, name: 'Project Tasks', progress: 25 },
];

// Styled progress bar using Terra colors
const TerraLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 10,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: terraColors.pearl,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 10,
    backgroundColor: terraColors.tropicalRain,
  },
}));

// Progress label inside the progress bar
const ProgressLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  left: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#fff',
  fontWeight: 500,
  fontSize: '0.875rem',
  zIndex: 1,
}));

// Progress percentage label
const ProgressPercentage = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#fff',
  fontWeight: 500,
  fontSize: '0.875rem',
  zIndex: 1,
}));

interface GoalsCardProps {
  goals?: Goal[];
  title?: string;
}

const GoalsCard: React.FC<GoalsCardProps> = ({ goals = sampleGoals, title = "Today's Goals" }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
          {title}
        </Typography>

        {goals.map(goal => (
          <Box key={goal.id} sx={{ mt: 2, position: 'relative' }}>
            <ProgressLabel>{goal.name}</ProgressLabel>
            <ProgressPercentage>{goal.progress}%</ProgressPercentage>
            <TerraLinearProgress variant="determinate" value={goal.progress} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default GoalsCard;
