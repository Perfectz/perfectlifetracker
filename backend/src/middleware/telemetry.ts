import * as appInsights from 'applicationinsights';
import * as express from 'express';

let initialized = false;

/**
 * Initialize Application Insights
 */
export const initializeAppInsights = () => {
  if (initialized) return;
  
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn('Application Insights connection string not found. Telemetry disabled.');
    return;
  }
  
  try {
    appInsights.setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();
      
    // Create client for custom tracking
    const client = appInsights.defaultClient;
    
    // Set common properties for all telemetry
    client.commonProperties = {
      environment: process.env.NODE_ENV || 'development'
    };
    
    initialized = true;
    console.log('Application Insights initialized');
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
  }
};

/**
 * Middleware to track request telemetry
 */
export const telemetryMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  if (!initialized) {
    initializeAppInsights();
  }
  
  // Track request start time
  const startTime = Date.now();
  
  // Add response listener to track metrics when request completes
  res.on('finish', () => {
    const client = appInsights.defaultClient;
    if (!client) return;
    
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    // Track custom request metrics
    client.trackRequest({
      name: `${req.method} ${req.path}`,
      url: req.url,
      duration: duration,
      resultCode: res.statusCode.toString(),
      success: success,
      properties: {
        userId: req.user?.id || 'anonymous',
        userAgent: req.headers['user-agent'] || 'unknown',
        contentLength: res.getHeader('content-length') || 0
      }
    });
    
    // Track additional metrics for slower endpoints or errors
    if (duration > 1000 || !success) {
      client.trackMetric({
        name: success ? 'SlowRequest' : 'FailedRequest',
        value: duration,
        properties: {
          endpoint: `${req.method} ${req.path}`,
          statusCode: res.statusCode.toString()
        }
      });
    }
  });
  
  next();
};

/**
 * Track custom events with Application Insights
 */
export const trackEvent = (name: string, properties?: { [key: string]: any }) => {
  const client = appInsights.defaultClient;
  if (client) {
    client.trackEvent({ name, properties });
  }
};

/**
 * Track exceptions with Application Insights
 */
export const trackException = (exception: Error, properties?: { [key: string]: any }) => {
  const client = appInsights.defaultClient;
  if (client) {
    client.trackException({ exception, properties });
  }
}; 