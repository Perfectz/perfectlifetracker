# PerfectLTP Architecture Overview

This document outlines the architecture of the PerfectLTP application, focusing on the database design, model structure, and initialization patterns.

## System Overview

PerfectLTP is a comprehensive personal assistant application designed to help users track fitness goals, personal development activities, and daily tasks. The application has both web and mobile interfaces, with a shared backend infrastructure.

## Technology Stack

- **Frontend:** React with TypeScript, Material UI
- **Backend:** Node.js with Express, TypeScript
- **Database:** Azure Cosmos DB (with in-memory mock for development)
- **Authentication:** Azure AD / Auth0
- **Deployment:** Docker containers, Azure Kubernetes Service

## Database Architecture

### CosmosDB Structure

The application uses Azure Cosmos DB as its primary database, with a simple structure:

- Single database instance
- Multiple containers for different entity types
- JSON document storage with partition keys

Key containers:
- `users` - User accounts and profiles
- `tasks` - Task and to-do items 
- `fitness` - Fitness tracking data (workouts, measurements)
- `development` - Personal development activities
- `analytics` - Usage statistics and analytics 
- `files` - File metadata (actual files stored in Blob Storage)

### Mock Database for Development

For local development, we use an in-memory mock implementation that mimics Cosmos DB operations:

- `MockDatabase` class simulates a Cosmos DB database
- `MockContainer` class mimics container operations
- In-memory arrays store data during development

## Initialization Flow

The database initialization follows this sequence:

1. Application startup begins
2. `initializeCosmosDB()` from `cosmosClient.ts` is called
   - Detects environment (development/production)
   - Creates the database if it doesn't exist
   - Creates containers if they don't exist
3. After database initialization, `seedDatabase()` is called (in development only)
   - Creates default admin user if it doesn't exist
   - Populates test data for development

## Model Design Pattern

### Lazy Container Initialization

Each model follows a lazy initialization pattern to avoid circular dependencies and initialization issues:

1. **Constructor Phase**: 
   - Attempts to get the container, but doesn't fail if unavailable
   - Sets up class properties

2. **ensureContainer Method**:
   - Called at the beginning of each data operation
   - Initializes the container if it wasn't available during construction
   - Returns the container reference once initialized

3. **Data Operations**:
   - Each CRUD method begins with `await this.ensureContainer()`
   - Implements error handling for database operations
   - Returns strongly typed data

Example Model Pattern:
```typescript
export class SomeModel {
  private container: any;

  constructor() {
    try {
      this.container = getContainer('containerName');
    } catch (error) {
      console.error('Initialization error, will retry later:', error.message);
    }
  }

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

  async create(data: InputType): Promise<OutputType> {
    await this.ensureContainer();
    // Implementation...
  }
}
```

## API Structure

The backend follows a RESTful API design with these key groups:

- **/api/users** - User management endpoints
- **/api/tasks** - Task management endpoints
- **/api/fitness** - Fitness tracking endpoints
- **/api/uploads** - File upload endpoints

Routes use middleware for:
- Authentication
- Request validation
- Error handling
- Logging

## Docker Deployment

The application uses Docker for deployment:

- Multi-stage builds for optimized images
- Separate containers for frontend and backend
- Shared volume mounts for development
- Environment variable configuration

### Container Communication

- Frontend communicates with backend via REST API
- Backend connects to Azure services (Cosmos DB, Blob Storage)
- Authentication handled via OAuth flows

## Security Architecture

- JWT-based authentication
- Role-based access control
- HTTPS for all communications
- Environment-based configuration

## Development vs Production

### Development Environment
- Uses mock in-memory database
- Hot-reloading for both frontend and backend
- Debug logging enabled
- Test data auto-seeded

### Production Environment
- Connects to Azure Cosmos DB
- Production-optimized builds
- Minimal logging
- No test data seeding 