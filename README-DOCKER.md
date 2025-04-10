# Docker Setup for Perfect LifeTracker Pro

This document explains how to run Perfect LifeTracker Pro using Docker containers for simplified deployment.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Quick Start

1. **Run the application stack using Docker Compose:**

```bash
# Start the entire application stack in production mode
docker-compose up -d
```

This will:
- Build the frontend and backend Docker images
- Start containers for both services
- Configure the environment for production use

The application will be available at:
- Frontend UI: http://localhost (or http://localhost:80)
- Backend API: http://localhost:3001

## Environment Variables

You can customize the deployment by setting these environment variables:

```bash
# Set variables for customization
export AZURE_CLIENT_ID=your-azure-client-id
export AZURE_REDIRECT_URI=http://your-domain
export FRONTEND_PORT=8080
export BACKEND_PORT=3001
export NODE_ENV=production

# Run with custom configuration
docker-compose up -d
```

## Development Mode

For development with hot-reloading:

1. Uncomment the `frontend-dev` and `backend-dev` services in `docker-compose.yml`
2. Start the development services:

```bash
# Start only the development services
docker-compose up frontend-dev backend-dev
```

## Production Deployment

For production deployment:

```bash
# Build and start production containers
docker-compose build
docker-compose up -d
```

## Azure DevOps Pipeline Integration

This project is configured with a containerized CI/CD pipeline:

1. The `azure-pipelines.yml` file builds Docker images for both frontend and backend
2. Images are saved as artifacts for deployment
3. Deployment uses the Docker images with an auto-generated docker-compose.yml file

To customize the CI/CD pipeline:
- Update build arguments in the pipeline configuration
- Modify the Docker registry settings for your environment
- Adjust deployment target environments as needed

## Container Architecture

```
┌────────────────┐       ┌────────────────┐
│                │       │                │
│    Frontend    │◄─────►│    Backend     │
│    (Nginx)     │       │   (Node.js)    │
│                │       │                │
└────────────────┘       └────────────────┘
       Port 80                Port 3001
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check for processes using the ports
   netstat -ano | findstr :80
   netstat -ano | findstr :3001
   
   # Kill processes if needed
   npx kill-port 80 3001
   ```

2. **Container not starting:**
   ```bash
   # Check container logs
   docker-compose logs frontend
   docker-compose logs backend
   ```

3. **Authentication issues:**
   Make sure environment variables for Azure authentication are correctly set:
   ```bash
   # Verify environment variables
   docker-compose config
   ```

## CI/CD Workflow

1. Code is committed to the repository
2. Azure Pipeline builds Docker images for frontend and backend
3. Images are saved as artifacts with deployment scripts
4. Deployment stage loads the images and starts containers
5. Health checks verify successful deployment 