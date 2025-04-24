# LifeTracker Pro Backend

Express TypeScript API for the LifeTracker Pro application.

## Environment Setup

The backend requires the following Azure services for full functionality:

- Azure Cosmos DB (or local emulator)
- Azure Blob Storage (or local emulator)

### Local Development Environment

Create a `.env.local` file in the backend root with the following configuration:

```env
# Azure Cosmos DB Emulator settings
COSMOS_ENDPOINT=https://localhost:8081
COSMOS_KEY=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
COSMOS_DATABASE_ID=lifetracker
COSMOS_PROFILES_CONTAINER_ID=profiles
COSMOS_GOALS_CONTAINER_ID=goals

# Azure Storage Emulator (Azurite) settings
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;
AZURE_STORAGE_ACCOUNT=devstoreaccount1
AZURE_STORAGE_CONTAINER=avatars

# Server settings
PORT=3001
NODE_ENV=development
```

### Fallback Behavior

For development convenience, the backend will use in-memory fallbacks when Azure services are unavailable:

- In-memory database for Cosmos DB
- In-memory storage for Blob Storage

**Note**: These fallbacks provide limited functionality and are intended for development only.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```

## Production

For production deployment, update the environment variables with actual Azure service credentials.

## API Endpoints

- `/api/profile` - User profile management
- `/api/goals` - Fitness goal management 