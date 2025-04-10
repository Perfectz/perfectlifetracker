# CI/CD Pipeline Documentation for Perfect LifeTracker Pro

This document outlines the Continuous Integration/Continuous Deployment (CI/CD) pipeline for the Perfect LifeTracker Pro application.

## Pipeline Overview

The Azure DevOps pipeline builds and deploys the application using Docker containers for both frontend and backend components.

### Pipeline Stages

1. **Build and Test**
   - Verifies Docker is installed
   - Builds the React frontend application
   - Creates Docker images for both frontend and backend
   - Generates deployment artifacts including Docker images and docker-compose file

2. **Deploy**
   - Downloads build artifacts
   - Stops any existing containers
   - Loads Docker images
   - Deploys containers using docker-compose

## Container Architecture

The application is deployed as two containers:

1. **Frontend Container (lifetrack-app)**
   - Based on nginx:stable-alpine
   - Serves pre-built React application files
   - Configured with custom Nginx settings for SPA routing
   - Exposed on port 8080

2. **Backend Container (lifetrack-backend)**
   - Node.js-based API
   - Includes health check endpoint
   - Exposed on port 3001

## Build Process Details

### Frontend Build

1. The React application is built using `npm run build`
2. A temporary .dockerignore is created to allow including the build directory
3. A Docker image is created using the `Dockerfile.fixed` configuration
4. Original .dockerignore is restored after build

### Backend Build

1. The backend Docker image is built from backend/Dockerfile
2. The image includes all necessary dependencies and environment settings

## Deployment

The pipeline deploys the application using docker-compose, which:

1. Configures network between containers
2. Maps container ports to host ports
3. Sets appropriate environment variables
4. Configures health checks and restart policies

## Troubleshooting

If you encounter issues with the pipeline:

1. Check Docker is properly installed on the build agent
2. Verify Nginx configuration is correctly formatted
3. Ensure the .dockerignore is properly configured during build
4. Check container logs using `docker logs <container_name>`

## Environment Configuration

The application uses the following environment variables:

- `NODE_ENV`: Backend environment (production/development)
- `PORT`: Backend port (default: 3001)

For Azure Entra ID authentication:
- `REACT_APP_AZURE_CLIENT_ID`: Azure client ID
- `REACT_APP_AZURE_AUTHORITY`: Azure authority URL
- `REACT_APP_AZURE_REDIRECT_URI`: Redirect URI after authentication

## Pipeline Updates

When updating the pipeline configuration:

1. Modify the `azure-pipelines.yml` file
2. Update Docker-related files if necessary (Dockerfiles, docker-compose.yml)
3. Commit changes to trigger a new build
4. Monitor the build process in Azure DevOps 