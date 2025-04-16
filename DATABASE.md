# Database Configuration

Perfect LifeTracker Pro supports multiple database options to accommodate different development and production scenarios.

## Configuration Options

The application can be configured to use:

1. **Azure Cosmos DB** (with MongoDB API compatibility)
2. **MongoDB** (local or remote)
3. **In-Memory Mock Database** (for development/testing)

## Setting Up the Database

### Option 1: In-Memory Mock Database (Default)

The application defaults to using an in-memory mock database for development. This requires no additional setup:

```
# Set in your .env file
USE_MOCK_DATABASE=true
```

### Option 2: MongoDB

To use MongoDB:

1. **Install MongoDB** locally or use a Docker container
2. **Set environment variables** in your .env file:

```
# MongoDB configuration
MONGODB_URI=mongodb://localhost:27017/perfectltp
USE_MOCK_DATABASE=false
```

3. **Run setup scripts** (optional) to initialize the database:

   - **On Windows:** Always use PowerShell or the integrated terminal, not bash. Run: `./scripts/setup-mongodb.ps1`
   - On Linux/Mac: use bash if available, otherwise use PowerShell Core if installed

These scripts will:
- Check if MongoDB is running
- Create the database and collections
- Set up required indexes

### Option 3: Azure Cosmos DB

To use Azure Cosmos DB with MongoDB API:

1. **Create a Cosmos DB Account** in Azure Portal
2. **Select MongoDB API** when creating the account
3. **Set environment variables** in your .env file:

```
# Cosmos DB configuration
COSMOS_DB_ENDPOINT=<your-cosmos-db-endpoint>
COSMOS_DB_KEY=<your-cosmos-db-key>
COSMOS_DB_DATABASE=perfectltp-db
USE_MOCK_DATABASE=false
```

## Docker Compose Configuration

The Docker Compose configuration includes environment variables for both Cosmos DB and MongoDB:

```yaml
environment:
  # Cosmos DB Configuration
  - COSMOS_DB_ENDPOINT=${COSMOS_DB_ENDPOINT:-https://localhost:8081}
  - COSMOS_DB_KEY=${COSMOS_DB_KEY:-dummy-key-for-development}
  - COSMOS_DB_DATABASE=${COSMOS_DB_DATABASE:-lifetracker}
  # MongoDB Configuration
  - MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/perfectltp}
  # Database Mode
  - USE_MOCK_DATABASE=true
```

## Database Schema

The application uses the following collections:

- **users** - User profiles and authentication information
- **projects** - Project metadata and configuration
- **tasks** - Task descriptions, assignments, and status
- **comments** - User comments on tasks and projects
- **notifications** - System and user notifications
- **files** - Metadata for uploaded files

Each collection has appropriate indexes set up for optimal performance. 