#!/bin/bash

# Check if server is running
if ! pgrep -f "node.*index" > /dev/null; then
  echo "Starting server..."
  cd "$(dirname "$0")"
  npm start &
  SERVER_PID=$!
  # Wait for server to start
  sleep 5
  echo "Server started with PID: $SERVER_PID"
else
  echo "Server is already running"
fi

# Test the health endpoint
echo "Testing /health endpoint..."
PORT="${PORT:-4000}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)

if [ $RESPONSE -eq 200 ]; then
  echo "Health check passed: HTTP $RESPONSE"
  curl -s http://localhost:$PORT/health | jq
  exit 0
else
  echo "Health check failed: HTTP $RESPONSE"
  exit 1
fi 