#!/bin/bash
# PerfectLTP Kubernetes Deployment Script
set -e

# Default variables
NAMESPACE="perfectltp"
RELEASE_NAME="perfectltp"
CHART_PATH="./perfectltp"
ENV="production"
DOMAIN="perfectltp.example.com"
IMAGE_TAG="latest"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    --release)
      RELEASE_NAME="$2"
      shift 2
      ;;
    --chart)
      CHART_PATH="$2"
      shift 2
      ;;
    --env)
      ENV="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --namespace NAME    Kubernetes namespace (default: perfectltp)"
      echo "  --release NAME      Helm release name (default: perfectltp)"
      echo "  --chart PATH        Path to Helm chart (default: ./perfectltp)"
      echo "  --env ENV           Environment (production, staging, dev) (default: production)"
      echo "  --domain DOMAIN     Domain name (default: perfectltp.example.com)"
      echo "  --tag TAG           Docker image tag (default: latest)"
      echo "  --help              Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Show deployment information
echo "Deploying Perfect LifeTracker Pro to Kubernetes"
echo "------------------------------------------------"
echo "Namespace:    $NAMESPACE"
echo "Release name: $RELEASE_NAME"
echo "Chart path:   $CHART_PATH"
echo "Environment:  $ENV"
echo "Domain:       $DOMAIN"
echo "Image tag:    $IMAGE_TAG"
echo "------------------------------------------------"

# Create namespace if it doesn't exist
kubectl get namespace $NAMESPACE > /dev/null 2>&1 || kubectl create namespace $NAMESPACE

# Check if we need to add/update the helm repo
# helm repo add bitnami https://charts.bitnami.com/bitnami
# helm repo update

# Deploy using Helm
echo "Deploying with Helm..."
helm upgrade --install $RELEASE_NAME $CHART_PATH \
  --namespace $NAMESPACE \
  --set global.environment=$ENV \
  --set global.domain=$DOMAIN \
  --set image.tag=$IMAGE_TAG \
  --atomic \
  --timeout 10m0s

echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=$RELEASE_NAME -n $NAMESPACE --timeout=300s

echo "Deployment completed successfully!"
echo "------------------------------------------------"
echo "You can access the application at: https://$DOMAIN"
echo "To check status, run: helm status $RELEASE_NAME -n $NAMESPACE"
echo "To check pods, run: kubectl get pods -n $NAMESPACE"
echo "------------------------------------------------" 