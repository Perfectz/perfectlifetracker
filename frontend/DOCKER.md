# Docker Setup for Perfect LifeTracker Pro

This document explains how to run Perfect LifeTracker Pro using Docker for both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Development Environment

The development environment uses hot-reloading and mounts your local files into the container for a smooth development experience.

### Starting the Development Environment

From the project root (where the `docker-compose.yml` file is located):

```bash
# Build and start the containers
docker-compose up

# Run in detached mode (background)
docker-compose up -d

# View logs when running in detached mode
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Stopping the Development Environment

```bash
# Stop the containers but keep volumes and networks
docker-compose down

# Stop and remove volumes (will erase database data)
docker-compose down -v
```

## Production Environment

For production, we use a multi-stage build to create a lightweight Nginx image.

### Building for Production

```bash
# Build only the production frontend image
docker build -f frontend/Dockerfile --target production -t perfectltp-frontend:prod frontend

# Run the production container
docker run -p 8080:80 perfectltp-frontend:prod
```

Alternatively, uncomment the `frontend-prod` service in `docker-compose.yml` and run:

```bash
docker-compose up frontend-prod
```

The production build will be available at http://localhost:8080

## Docker Compose Configuration

Our `docker-compose.yml` includes:

1. **frontend**: Development environment for the React application
2. **frontend-prod**: (Commented out) Production-ready Nginx container
3. **backend**: Node.js API server (creates a placeholder if none exists)

## Environment Variables

Environment variables can be set in multiple ways:

1. In `.env` file at the project root
2. Passed to docker-compose: `AZURE_CLIENT_ID=your-id docker-compose up`
3. Directly in the `docker-compose.yml` file

## Troubleshooting

### Container Won't Start

```bash
# View detailed logs
docker-compose logs

# Check for port conflicts
docker ps -a
```

### Node Modules Issues

If you encounter node modules related issues:

```bash
# Rebuild the node_modules volume
docker-compose down -v
docker-compose up --build
```

### Accessing the Container Shell

```bash
# Access frontend container
docker-compose exec frontend sh

# Access backend container
docker-compose exec backend sh
```

## Building and Running the React App with Docker

There are two different approaches to run the React frontend in Docker:

### Option 1: Development Build with Multi-stage Dockerfile

This approach builds the React app inside Docker and serves it:

```bash
docker build -f Dockerfile -t lifetrack-app:dev .
docker run -p 8080:80 --name lifetrack-app-dev lifetrack-app:dev
```

### Option 2: Using Pre-built Files (Recommended for Production)

This approach uses pre-built files and serves them with Nginx:

1. Build the React app locally:
```bash
npm run build
```

2. Temporarily modify the .dockerignore file to allow the build directory:
```bash
# Save the original .dockerignore
Move-Item .\.dockerignore .\.dockerignore.bak -Force

# Create a new .dockerignore without /build exclusion
# or use the .dockerignore.temp file

# Restore after building
Move-Item .\.dockerignore.bak .\.dockerignore -Force
```

3. Build the Docker image:
```bash
docker build -f Dockerfile.custom -t lifetrack-app:latest .
```

4. Run the container:
```bash
docker run -d -p 8080:80 --name lifetrack-app lifetrack-app:latest
```

5. Access the application at http://localhost:8080

### Stopping and Removing the Container

```bash
docker stop lifetrack-app
docker rm lifetrack-app
``` 