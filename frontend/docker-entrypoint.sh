#!/bin/bash
set -e

# Check if we need to build the app
if [ ! -d "/app/build" ] || [ "$REBUILD" = "true" ]; then
    echo "Building application..."
    npx tsc && npx vite build --config /app/vite.config.custom.js
    chmod -R 755 /app/build
fi

# Start nginx or development server based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    echo "Starting in production mode with nginx..."
    nginx -g "daemon off;"
else
    echo "Starting in development mode with Vite..."
    npx vite --config /app/vite.config.dev.js
fi 