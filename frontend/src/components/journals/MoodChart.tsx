import React, { useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  TooltipProps
} from 'recharts';
import { useJournalEntries } from '../../hooks/useJournals';
import { JournalEntry } from '../../types/journal';
import { format, parseISO, isValid } from 'date-fns';

export interface MoodChartProps {
  // Either pass data directly or fetch using limit
  data?: Array<{ date: string; sentiment: number; id?: string }>;
  limit?: number;
  height?: number;
  title?: string;
}

// Custom tooltip for the chart
const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  
  const value = payload[0]?.value;
  if (value === undefined) {
    return null;
  }
  
  return (
    <Paper elevation={3} sx={{ p: 1.5, bgcolor: 'background.paper' }} data-testid="mood-chart-tooltip">
      <Typography variant="body2">
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Sentiment: {typeof value === 'number' ? value.toFixed(2) : 'N/A'}
      </Typography>
    </Paper>
  );
};

const MoodChart: React.FC<MoodChartProps> = ({ 
  data: propData, 
  limit = 30, 
  height = 300,
  title = 'Your Mood Trends'
}) => {
  // Only fetch data if not provided as prop
  const { data: fetchedData, isLoading, error } = useJournalEntries(
    undefined, 
    limit,
    undefined, // cursor parameter (undefined for initial load)
    propData === undefined // only enable the query if props.data is not provided
  );
  
  // Use provided data or data from the query
  const sourceData = propData !== undefined ? { 
    items: propData.map(item => ({ 
      ...item, 
      id: item.id || `temp-${item.date}`, 
      sentimentScore: item.sentiment
    }))
  } : fetchedData;
  
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!sourceData?.items || sourceData.items.length === 0) return [];
    
    // Sort entries by date
    const sortedEntries = [...sourceData.items].sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Map to chart data format
    return sortedEntries.map((entry: any) => {
      const date = parseISO(entry.date);
      return {
        date: isValid(date) ? format(date, 'MMM d') : 'Invalid Date',
        sentiment: entry.sentimentScore || entry.sentiment,
        id: entry.id
      };
    });
  }, [sourceData]);

  if (isLoading && propData === undefined) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }} data-testid="mood-chart-loading">
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error && propData === undefined) {
    return (
      <Alert severity="error" sx={{ my: 2 }} data-testid="mood-chart-error">
        Error loading mood data: {(error as Error).message}
      </Alert>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }} data-testid="mood-chart-empty">
        <Box display="flex" justifyContent="center" alignItems="center" height={height / 2}>
          <Typography variant="body1" color="text.secondary">
            No mood data available. Start journaling to see your mood patterns.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }} data-testid="mood-chart-container">
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      <Box height={height} data-testid="mood-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              data-testid="mood-chart-x-axis"
            />
            <YAxis 
              domain={[0, 1]} 
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(value) => value.toFixed(2)}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Sentiment', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              data-testid="mood-chart-y-axis"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine 
              y={0.5} 
              stroke="#666" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Neutral', 
                position: 'right', 
                fill: '#666',
                fontSize: 10
              }}
            />
            <Area 
              type="monotone" 
              dataKey="sentiment" 
              name="Mood Score"
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
              data-testid="mood-chart-area"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="caption" color="text.secondary" component="p" align="center" sx={{ mt: 1 }}>
        Chart shows sentiment scores from your journal entries over time (0 = negative, 1 = positive)
      </Typography>
    </Paper>
  );
};

export default MoodChart; 