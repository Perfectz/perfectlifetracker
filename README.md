# LifeTracker Pro

A comprehensive health and fitness tracking application built with React, TypeScript, and Azure services.

## Features

- **Authentication** - Secure login with Azure AD B2C (with fallback to mock auth for development)
- **User Profiles** - Personal information management
- **Fitness Tracking** - Set and monitor workout and health goals
- **Habit Building** - Track daily habits and streaks
- **Personal Development** - Journal entries, skill tracking, and learning management
- **Accessibility** - ARIA-compliant components and screen reader support
- **Notifications** - Toast notifications for important events and feedback

## Project Structure

- `/frontend`: React TypeScript application (run commands here for UI)
- `/backend`: Express TypeScript API (run commands here for server)
- `/infra`: Infrastructure and deployment scripts
- `/scripts`: Development and utility scripts

## Technologies

### Frontend
- React 18 with TypeScript
- MSAL for Microsoft Authentication
- MUI (Material-UI) for components
- React Hot Toast for notifications
- Webpack for bundling
- Jest and React Testing Library for unit testing
- Cypress for end-to-end testing
- axe-core for accessibility testing

### Backend
- Express.js with TypeScript
- JWT authentication with express-jwt
- Azure integrations (Cosmos DB, Blob Storage)

## Development Setup

### Prerequisites

- Node.js v18+ and npm
- PowerShell 7+ (for Windows)
- Azure Cosmos DB Emulator (installed automatically by startup script)
- Azurite Storage Emulator (installed via npm)

### Quick Start

To start the development environment with all services:

```powershell
# From the project root
./scripts/start-dev.ps1
```

This script will:
1. Check for and install Azure Cosmos DB Emulator if needed
2. Kill any processes using required ports
3. Start Azure emulators (Cosmos DB and Azurite)
4. Start the backend server
5. Start the frontend application

### Manual Setup

If you prefer to start services individually:

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm start
# or
npm run dev
```

## Troubleshooting

### Port Conflicts

If you encounter "address already in use" errors:

```bash
# Kill processes on specific ports
npm run kill-services
```

### Azure Emulators Not Running

The application will fall back to mock data if emulators are not available. To manually start emulators:

```powershell
# Start Cosmos DB Emulator
Start-Process "C:\Program Files\Azure Cosmos DB Emulator\CosmosDB.Emulator.exe" -ArgumentList "/NoFirewall", "/NoUI"

# Start Azurite
npx azurite --silent
```

### API JSON Parsing Errors

When using curl or other tools to make API requests, ensure JSON is properly formatted:

```bash
# CORRECT
curl -X POST -H "Content-Type: application/json" -d "{\"title\":\"Run 5K\",\"targetDate\":\"2023-12-31\"}" http://localhost:3001/api/goals

# INCORRECT (escaped quotes)
curl -X POST -H "Content-Type: application/json" -d '{\"title\":\"Run 5K\",\"targetDate\":\"2023-12-31\"}' http://localhost:3001/api/goals
```

See `scripts/request-examples.http` for more examples.

### TypeScript Errors

If you encounter TypeScript errors during build:

1. Check interface definitions match implementations
2. Run `npm run build` to see detailed error messages
3. Fix type errors in the relevant files

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run E2E tests
cd frontend
npm run test:e2e
```

## Authentication Flow

The application supports two authentication modes:

1. **Production Mode**: Uses Azure AD B2C with MSAL for authentication
2. **Development Mode**: Uses mock authentication with session storage

To test the authentication flow in development:
1. Visit the landing page
2. Click the "Sign In" button
3. The mock auth system will authenticate you and redirect to dashboard
4. Your session will persist in `sessionStorage` until you sign out

## Environment Configuration

### Backend Environment Variables

The backend requires certain environment variables to be set:

```
# Required for JWT authentication (development)
JWT_SECRET=your-dev-secret

# For production with Azure AD B2C
JWKS_URI=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/discovery/v2.0/keys
AZURE_AD_B2C_API_IDENTIFIER=api://your-api-id
AZURE_AD_B2C_ISSUER=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/v2.0/
```

## Building and Deployment

### Frontend

To build the frontend:

```bash
cd frontend
npm run build
```

This will create a production build in the `dist/` directory.

### Backend

To build the backend:

```bash
cd backend
npm run build
```

## Notifications

The application uses `react-hot-toast` for a seamless notification system:

```typescript
import { toastService } from './services/toastService';

// Display success notification
toastService.success('Profile updated successfully');

// Show loading toast that updates on completion
const toastId = toastService.loading('Saving changes...');
// Later update the toast:
toastService.update(toastId, 'success', 'Changes saved successfully');

// Track a promise with automatic status updates
toastService.promise(saveData(), {
  loading: 'Saving data...',
  success: 'Data saved successfully',
  error: 'Failed to save data'
});
```

## Accessibility

The application follows WCAG 2.1 AA standards:

- Proper semantic HTML
- ARIA attributes for interactive elements
- Keyboard navigation
- Focus management
- Screen reader announcements
- Color contrast compliance

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Prerequisites

Before running the application locally, ensure you have the following installed:

- Node.js (v16+)
- npm (v7+)
- Azure Cosmos DB Emulator (for local database)
- Azurite (for local blob storage)

## Local Development with Azure Emulators

This application depends on Azure services (Cosmos DB and Blob Storage) which must be emulated locally for full functionality:

### Setting up Azure Emulators

1. **Azure Cosmos DB Emulator**:
   - Download and install from [Microsoft's website](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator)
   - Default installation path: `C:\Program Files\Azure Cosmos DB Emulator\CosmosDB.Emulator.exe`
   - Default endpoint: `https://localhost:8081`

2. **Azurite (Azure Storage Emulator)**:
   - Install globally: `npm install -g azurite`
   - Run manually: `azurite --silent`
   - Default blob endpoint: `http://127.0.0.1:10000/devstoreaccount1`

### Starting the Application

For convenience, we've set up npm scripts to manage the local development environment:

```bash
# Start both Azure emulators (Cosmos DB and Azurite)
npm run start:emulators

# Start both backend and frontend services
npm run start:dev

# Start everything (emulators and services)
npm run start:all

# Run E2E tests with Cypress (starts all services first)
npm run test:e2e

# Stop all running services and emulators
npm run stop:all
```

### Troubleshooting

If you encounter connection errors to Cosmos DB or Blob Storage:

1. Verify the emulators are running:
   - Cosmos DB Emulator: Check at https://localhost:8081/_explorer/index.html
   - Azurite: Check ports 10000, 10001, and 10002 are in use

2. Check connection strings in `.env.local` files:
   - Backend has default fallbacks for local development
   - If changing ports, update connection strings accordingly

3. Fallback mode:
   - The application includes in-memory fallbacks for development
   - Limited functionality will be available if emulators fail to connect

## Development Setup

### Prerequisites

- Node.js (v18+)
- npm (v8+)

### Running the Application

The application consists of both frontend and backend services.

#### Option 1: Normal Setup (requires Azure services)

1. Start Azure services (Cosmos DB and Blob Storage):
   ```
   .\start-dev-environment.ps1
   ```

2. Or manually run the services:
   ```powershell
   # Start Cosmos DB Emulator (if installed)
   Start-Process -FilePath "C:\Program Files\Azure Cosmos DB Emulator\CosmosDB.Emulator.exe"
   
   # Start Azurite for Blob Storage
   npx azurite --silent
   ```

3. Start backend and frontend:
   ```
   cd backend
   npm run dev
   
   # In another terminal
   cd frontend
   npm start
   ```

#### Option 2: Development Mode (without Azure services)

The application includes fallbacks for development without Azure services:

1. Backend uses in-memory storage when Cosmos DB is unavailable
2. Frontend uses mock data when API calls fail

To run in this mode:

```powershell
# Start backend with in-memory fallback
cd backend
npm run dev

# In another terminal
cd frontend
npm start
```

### Testing

#### Backend Tests

```
cd backend
npm test
```

#### Frontend Tests

```
cd frontend
npm test
```

#### E2E Tests

```
cd frontend
npm run cypress:open
```

## Troubleshooting

### Authentication Issues

For local development, the application includes authentication fallbacks. If you see errors related to missing JWT tokens or user IDs, ensure you're using the development mode.

### Database Connection Issues

If you encounter database connection issues:

1. Ensure Cosmos DB emulator is running (or use the in-memory fallback)
2. Check that Azurite is running for blob storage
3. Verify that the ports are not blocked (8081 for Cosmos DB, 10000 for Azurite)

### Clear In-Memory Data

The in-memory fallback retains data only for the current backend session. To clear data, restart the backend server. 