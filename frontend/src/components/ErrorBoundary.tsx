/**
 * frontend/src/components/ErrorBoundary.tsx
 * Basic React Error Boundary component
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="error">
              Oops! Something went wrong.
            </Typography>
            <Typography variant="body1">
              We encountered an error. Please try refreshing the page.
            </Typography>
            {/* Optionally display error details during development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Typography variant="caption" display="block" sx={{ mt: 2, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                {this.state.error.toString()}
              </Typography>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 