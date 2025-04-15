# PerfectLTP Troubleshooting Guide

This document contains solutions for common issues encountered while setting up and running the PerfectLTP application.

## Docker Container Issues

### Backend Container Crashes with "Container not initialized" Error

**Problem:** Backend container repeatedly crashes with errors like:
```
Error: Container fitness not initialized
```

**Cause:** The system tries to access container objects before they are properly initialized. This happens because:
1. Model classes are imported and instantiated during module loading
2. They try to access containers before the database initialization process completes
3. The circular dependency between models and database initialization

**Solution:** 
- Implement a lazy initialization pattern in model classes:
  - Don't try to fully initialize containers in the constructor
  - Add a `ensureContainer()` method in each model class
  - Call this method at the beginning of each data operation
  - Handle initialization errors gracefully

Example pattern to follow in model classes:
```typescript
// In model constructor
constructor() {
  try {
    this.container = getContainer('containerName');
  } catch (error) {
    console.error('Error initializing container, will initialize later:', error.message);
    // Will initialize container later when needed
  }
}

// Method to ensure container is available
private async ensureContainer() {
  if (!this.container) {
    try {
      this.container = getContainer('containerName');
    } catch (error) {
      throw new Error(`Failed to initialize container: ${error.message}`);
    }
  }
  return this.container;
}

// Call at beginning of each method
async someOperation() {
  await this.ensureContainer();
  // Rest of the method...
}
```

### Backend Container exits with "/app/start.sh: not found"

**Problem:** Container tries to execute a non-existent start script:
```
/usr/local/bin/docker-entrypoint.sh: exec: line 11: /app/start.sh: not found
```

**Solution:**
1. Create a `start.sh` script in the backend directory
2. Ensure it's properly copied in the Dockerfile
3. Make it executable with `RUN chmod +x /app/start.sh`
4. Update the Dockerfile CMD to use `CMD ["sh", "/app/start.sh"]`

### NPM Package Installation Issues

**Problem:** Dependency errors like:
```
npm ci command can only install with an existing package-lock.json
```

**Solution:**
1. Run `npm install` instead of `npm ci` in development containers 
2. Ensure package-lock.json is included in the Docker context (not ignored)
3. For development, use volume mounts with `:cached` modifier for better performance

### Module Not Found Errors

**Problem:** Missing module errors like:
```
Cannot find module 'uuid'
MODULE_NOT_FOUND
```

**Solution:**
1. Ensure package.json has the correct dependency listed
2. For compatibility issues with Node 20, use specific versions (e.g., uuid@9.0.1)
3. Update package.json and rebuild the container

## Database Connection Issues

### Mock Database Initialization Failures

**Problem:** The mock database fails to initialize properly in development mode

**Solution:**
1. Ensure `initializeCosmosDB()` is called before any model operations
2. Update the database initialization sequence:
   - Initialize containers first
   - Then seed with data if needed
3. Use a singleton pattern for database client to prevent multiple initializations

## Frontend Issues

### Theme Import Error

**Problem:** Frontend failing with error like:
```
Failed to resolve import "../../src/theme" from "src/App.tsx"
```

**Solution:**
1. Fix import paths to use relative paths correctly
2. Update references to theme file with correct location
3. Create the missing theme file if needed

## Docker Compose Configuration

### Volume Mount Issues

**Problem:** Changes to source code not reflected in containers

**Solution:**
1. Use the `:cached` modifier for volume mounts to improve performance
2. Ensure the correct source directories are mapped 
3. Example fixed volume mount:
```yaml
volumes:
  - ./backend:/app:cached
```

### Container Dependency Order

**Problem:** Containers starting in incorrect order, causing connection issues

**Solution:**
1. Add `depends_on` configuration to ensure correct startup order
2. Use `wait-for-it.sh` or similar scripts to wait for dependencies to be ready
3. Implement health checks for critical services

## Debugging Techniques

### Checking Container Logs

Run this command to view detailed logs for a specific container:
```bash
docker-compose logs -f container-name
```

### Entering a Running Container

To get a shell inside a running container for debugging:
```bash
docker-compose exec container-name sh
```

### Rebuilding Containers

To rebuild containers from scratch (no cache):
```bash
docker-compose build --no-cache
docker-compose up
```

### Checking for Port Conflicts

If you encounter port conflicts:
```bash
netstat -ano | findstr 3000
# or
lsof -i :3000  # on Linux/Mac
```

## Production Readiness 

### Security Considerations

For moving to production:
1. Ensure `.env` files are not committed to the repository
2. Use Docker secrets or environment variables for sensitive configurations
3. Implement proper CORS settings
4. Enable HTTPS

### Performance Optimizations

1. Use multi-stage Docker builds to reduce image size
2. Implement proper caching strategies
3. Configure appropriate resource limits for containers 