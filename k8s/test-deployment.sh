#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t backend-test ./backend

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/backend/

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/lifetracker-backend

# Get the Ingress IP/hostname
INGRESS_HOST=$(kubectl get ingress lifetracker-backend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -z "$INGRESS_HOST" ]; then
  INGRESS_HOST=$(kubectl get ingress lifetracker-backend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
fi

echo "Ingress Host: $INGRESS_HOST"

# Test the health endpoint
echo "Testing /health endpoint..."
ATTEMPTS=0
MAX_ATTEMPTS=10

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$INGRESS_HOST/health)
  
  if [ $RESPONSE -eq 200 ]; then
    echo "Health check passed: HTTP $RESPONSE"
    curl -s http://$INGRESS_HOST/health
    exit 0
  else
    ATTEMPTS=$((ATTEMPTS+1))
    echo "Attempt $ATTEMPTS: Health check returned HTTP $RESPONSE, retrying in 5 seconds..."
    sleep 5
  fi
done

echo "Health check failed after $MAX_ATTEMPTS attempts"
exit 1 