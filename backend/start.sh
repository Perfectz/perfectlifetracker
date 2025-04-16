#!/bin/sh
# Start script for backend container

# Set environment variable for development/production
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting backend in production mode..."
  # For production, use the compiled js code
  node dist/index.js
else
  echo "Starting backend in development mode..."
  # For development, use ts-node to run TypeScript directly
  npm run dev
fi 