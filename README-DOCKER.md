# Docker Setup for Perfect LifeTracker Pro

This document explains how to run Perfect LifeTracker Pro services using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Quick Start for Development

For now, we've simplified the Docker setup to run only the backend API service while you develop the frontend locally:

1. **Run the backend API:**

```bash
# Start the backend service only
docker-compose up backend
```

The backend API will be available at http://localhost:3001 with a health check endpoint at http://localhost:3001/api/health

2. **Run the frontend locally:**

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000 and will connect to the backend running in Docker.

## Docker Compose Configuration

The `docker-compose.yml` file is configured to run both frontend and backend services, but we're experiencing some compatibility issues with the frontend in Docker. For now, it's recommended to run the frontend locally.

### Backend API Endpoints

The backend creates a simple placeholder API with the following endpoints:

- `GET /api/health` - Returns a status message indicating the API is running

## Troubleshooting

### Container Won't Start

```bash
# View detailed logs
docker-compose logs

# Check for port conflicts
docker ps -a
```

### Port Already In Use

If you see errors about ports already being in use:

```bash
# Find processes using port 3001
netstat -ano | findstr :3001

# Kill the process using the port
npx kill-port 3001
```

### Accessing the Container Shell

```bash
# Access backend container
docker-compose exec backend sh
```

## Production Deployment

For production, we provide a multi-stage Dockerfile that builds an optimized nginx-based image:

```bash
# Build production frontend image
docker build -f frontend/Dockerfile --target production -t perfectltp-frontend:prod frontend

# Run the production container
docker run -p 8080:80 perfectltp-frontend:prod
```

## Known Issues

1. The frontend container currently has issues with the rollup module in Docker. We're working on a fix. In the meantime, run the frontend locally.

2. Environment variables need to be properly configured in both environments. Make sure your `.env` file in the frontend directory has:

```
VITE_REACT_APP_AZURE_CLIENT_ID=your-client-id
VITE_REACT_APP_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_REACT_APP_AZURE_REDIRECT_URI=http://localhost:3000
``` 