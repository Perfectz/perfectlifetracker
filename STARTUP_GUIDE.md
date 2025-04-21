# LifeTracker Pro Startup Guide

## Prerequisites
- Node.js 14+ installed
- npm 6+ installed
- Internet connection (development mode uses fallbacks if Azure services are unavailable)

## Starting the Application

### Method 1: Using npm scripts from project root (Recommended)
Always run these commands from the project root directory (`D:\PLTP`):

```powershell
# Start backend server
npm run start:backend

# In a new terminal window, start frontend server
npm run start:frontend
```

### Method 2: From individual directories
If you need to start the services separately:

```powershell
# Navigate to backend directory
cd backend
npm run dev

# In a new terminal, navigate to frontend directory
cd frontend
npm start
```

## Common Issues

### PowerShell Navigation
- Use `cd` without slashes: `cd backend` not `cd /backend`
- To change drives completely, use: `cd D:\PLTP` not `cd /D D:\PLTP`
- Check your current directory with `pwd` before running commands

### Port Already in Use
If you see `EADDRINUSE` errors:
```powershell
# For backend (port 3001)
npx kill-port 3001

# For frontend (port 3000)
npx kill-port 3000
```

### Services Not Connecting
- Backend errors connecting to Cosmos DB/Blob Storage are normal in development
- The application uses in-memory fallbacks when Azure services are unavailable

## Accessing the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

## Testing Features
1. Login using test credentials
2. Navigate to Profile section
3. Use the Edit Profile form to update information and upload avatars
4. Test avatar upload/removal functionality 