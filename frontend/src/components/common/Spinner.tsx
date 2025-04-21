import React from 'react';

interface SpinnerProps {
  message?: string;
}

/**
 * A reusable loading spinner component
 */
const Spinner: React.FC<SpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner">
      <div className="spinner-circle"></div>
      <p>{message}</p>
    </div>
  );
};

export default Spinner; 