# Docker Setup Guide

This document provides instructions for setting up and running the PerfectLTP application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed
- Git repository cloned locally

## Docker Configuration Files

The project includes several Docker configuration files:

1. **docker-compose.yml**: Complete setup for production-like environment
2. **docker-compose.simple.yml**: Simplified setup for development
3. **backend/Dockerfile**: Multi-stage backend container configuration
4. **backend/Dockerfile.simple**: Simplified backend container for development
5. **frontend/Dockerfile**: Production frontend container configuration
6. **frontend/Dockerfile.simple**: Development frontend container configuration

## Quick Start

For local development with the simplified setup:

```bash
# Build and start the containers
docker-compose -f docker-compose.simple.yml up

# In a separate terminal, to rebuild containers
docker-compose -f docker-compose.simple.yml build --no-cache
```

## Container Structure

The application consists of:

- **lifetrack-frontend-dev**: React frontend application
- **lifetrack-backend-dev**: Node.js Express backend
- **Database**: In-memory mock for development, Azure CosmosDB for production

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory with:

```
# Auth Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-audience
AUTH0_ISSUER=https://your-domain.auth0.com/
AZURE_AUTHORITY=https://login.microsoftonline.com/common
AZURE_CLIENT_ID=your-client-id

# Database Configuration
COSMOS_DB_ENDPOINT=your-cosmos-endpoint
COSMOS_DB_KEY=your-cosmos-key
COSMOS_DB_DATABASE=lifetrackpro-db
USE_MOCK_DATABASE=true

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER=uploads

# Application Settings
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory with:

```
VITE_API_URL=http://localhost:3001
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience
```

## Working with Containers

### Viewing Logs

```bash
# View logs from all containers
docker-compose -f docker-compose.simple.yml logs

# View logs from a specific container
docker-compose -f docker-compose.simple.yml logs lifetrack-backend-dev

# Follow logs in real time
docker-compose -f docker-compose.simple.yml logs -f
```

### Accessing Container Shell

```bash
# Access the backend container
docker-compose -f docker-compose.simple.yml exec lifetrack-backend-dev sh

# Access the frontend container
docker-compose -f docker-compose.simple.yml exec lifetrack-frontend-dev sh
```

### Stopping Containers

```bash
# Stop containers but preserve data
docker-compose -f docker-compose.simple.yml stop

# Stop and remove containers
docker-compose -f docker-compose.simple.yml down

# Stop, remove containers, and remove volumes
docker-compose -f docker-compose.simple.yml down -v
```

## Troubleshooting

### Port Conflicts

If you encounter "port already in use" errors:

1. Check for processes using the ports:
   ```bash
   netstat -ano | findstr 3000  # Frontend port
   netstat -ano | findstr 3001  # Backend port
   ```

2. Stop any conflicting processes:
   ```bash
   taskkill /F /PID <process-id>
   ```

3. Alternatively, modify the port mappings in `docker-compose.simple.yml`

### Container Restart Issues

If containers keep restarting:

1. Check logs for error messages:
   ```bash
   docker-compose -f docker-compose.simple.yml logs
   ```

2. Ensure all required environment variables are set

3. Rebuild containers from scratch:
   ```bash
   docker-compose -f docker-compose.simple.yml down
   docker-compose -f docker-compose.simple.yml build --no-cache
   docker-compose -f docker-compose.simple.yml up
   ```

### Volume Mount Issues

If changes to source files aren't reflected in the container:

1. Ensure volume mounts are correctly configured
2. Use `:cached` modifier in volume mounts for better performance
3. Restart the containers

## Development Workflow

1. Start the containers with:
   ```bash
   docker-compose -f docker-compose.simple.yml up
   ```

2. Access the application at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

3. Make changes to the source code (containers use volume mounts for hot reloading)

4. If you add new dependencies, rebuild the affected container:
   ```bash
   docker-compose -f docker-compose.simple.yml build lifetrack-backend-dev
   ```

## Production Deployment

For production deployment:

1. Use the main `docker-compose.yml` file
2. Configure all environment variables for production
3. Set `USE_MOCK_DATABASE=false` to use the real Cosmos DB
4. Deploy to a container orchestration platform like Kubernetes

```bash
# Production build
docker-compose build

# Production start
docker-compose up -d
``` 