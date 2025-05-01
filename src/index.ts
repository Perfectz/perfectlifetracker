// Import the feature flags
import { isFeatureEnabled } from './utils/featureFlags';

// Use the activities router
app.use('/api/activities', jwtCheck, activitiesRouter);

// Use the analytics router
app.use('/api/analytics', jwtCheck, analyticsRouter);

// Use the OpenAI router only if the feature is enabled
if (isFeatureEnabled('ENABLE_OPENAI')) {
  console.log('OpenAI integration enabled');
  app.use('/api/openai', jwtCheck, openaiRouter);
} else {
  console.log('OpenAI integration disabled');
}

// Error handler 