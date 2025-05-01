import React, { useMemo, lazy, Suspense } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Skeleton 
} from '@mui/material';
import { StreakData } from '../../services/habitService';

// Lazy load Recharts components for better performance
const ResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
const LineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const Line = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);
const XAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const YAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);
const CartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);
const Tooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);
const Legend = lazy(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);

interface StreakChartProps {
  data: StreakData[];
  isLoading?: boolean;
  title?: string;
  height?: number;
}

const StreakChart: React.FC<StreakChartProps> = ({ 
  data, 
  isLoading = false,
  title = 'Habit Streak Progress',
  height = 300 
}) => {
  // Format dates for display
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Convert ISO date to more readable format (e.g. "Jul 15")
      displayDate: new Date(item.date)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);

  // Define chart colors
  const chartColor = '#3f51b5'; // Primary color

  // Show loading skeleton
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={height} 
          role="skeleton" 
        />
      </Paper>
    );
  }

  // Show empty state if no data
  if (!data.length) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={height}
          bgcolor="#f9f9f9"
          borderRadius={1}
        >
          <Typography variant="body1" color="textSecondary">
            No streak data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      {/* Chart with suspense fallback */}
      <Box height={height} width="100%" role="img" aria-label="Streak progress chart">
        <Suspense fallback={<CircularProgress sx={{ m: 'auto', display: 'block' }} />}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }}
                height={60}
              />
              <YAxis 
                label={{ 
                  value: 'Streak Days', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
                allowDecimals={false}
                domain={[0, 'dataMax + 2']}
              />
              <Tooltip 
                formatter={(value) => [`${value} days`, 'Streak']}
                labelFormatter={(date) => `Date: ${date}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="streak"
                name="Streak"
                stroke={chartColor}
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Suspense>
      </Box>
    </Paper>
  );
};

export default StreakChart; 