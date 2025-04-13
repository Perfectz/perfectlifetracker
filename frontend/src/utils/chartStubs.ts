/**
 * frontend/src/utils/chartStubs.ts
 * Stub implementations for react-native-chart-kit to work in web environment
 */
import React from 'react';

// Basic props type for chart components
interface ChartProps {
  data: any;
  width: number;
  height: number;
  chartConfig: any;
  style?: React.CSSProperties;
  [key: string]: any;
}

// Create a basic placeholder component for BarChart
export const BarChart: React.FC<ChartProps> = ({ width, height, style }) => {
  return React.createElement('div', {
    style: {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    },
  }, 'Bar Chart Placeholder');
};

// Create a basic placeholder component for LineChart
export const LineChart: React.FC<ChartProps> = ({ width, height, style }) => {
  return React.createElement('div', {
    style: {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    },
  }, 'Line Chart Placeholder');
};

// Create a basic placeholder component for PieChart
export const PieChart: React.FC<ChartProps> = ({ width, height, style }) => {
  return React.createElement('div', {
    style: {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#f0f0f0',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    },
  }, 'Pie Chart Placeholder');
};

// Create a basic placeholder component for ProgressChart
export const ProgressChart: React.FC<ChartProps> = ({ width, height, style }) => {
  return React.createElement('div', {
    style: {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    },
  }, 'Progress Chart Placeholder');
};

// Export a default configuration object
export const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726'
  }
}; 