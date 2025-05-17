// frontend/src/components/journals/LazyMoodChart.tsx
// Lazy-loaded version of the MoodChart component to optimize initial page load

import React, { Suspense } from 'react';
import LoadingPlaceholder from '../common/LoadingPlaceholder';
import { MoodChartProps } from './MoodChart';

// Lazy-load the MoodChart component
const MoodChart = React.lazy(() => import('./MoodChart'));

/**
 * Wrapper component that lazy-loads the MoodChart component
 * Shows a loading spinner while the chart component is being loaded
 */
const LazyMoodChart: React.FC<MoodChartProps> = (props) => {
  const { height = 300 } = props;
  
  return (
    <Suspense
      fallback={
        <LoadingPlaceholder 
          type="spinner"
          height={height}
          message="Loading mood chart..."
        />
      }
    >
      <MoodChart {...props} />
    </Suspense>
  );
};

export default LazyMoodChart; 