# Solution Architecture Document

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Key Components](#key-components)
- [Data Flow](#data-flow)
- [Third-Party Services](#third-party-services)
- [Environmental Configuration](#environmental-configuration)
- [Architectural Decisions](#architectural-decisions)

## Overview
The LifeTracker application is a personal productivity and wellness tracking platform with features for journal entries, goal setting, habit tracking, and activity logging. The application uses a modern React frontend with a Node.js/Express backend.

## Architecture
The application follows a monorepo structure with clearly separated frontend and backend codebases:

- `/frontend`: React TypeScript application
- `/backend`: Express TypeScript API
- `/infra`: Infrastructure and deployment scripts
- `/.cursor`: Cursor IDE configuration

### Frontend Architecture
- React SPA with TypeScript
- Material-UI component library
- React Router for navigation
- React Query for server state management

### Backend Architecture
- Express.js with TypeScript
- Azure Cosmos DB for data storage
- Azure Blob Storage for file uploads
- Azure Cognitive Search for search functionality
- JWT-based authentication

## Key Components

### Frontend Components
- `App`: Main application component
- `pages/`: Route-level components
- `components/`: Reusable UI components
- `hooks/`: Custom React hooks
- `services/`: API client functions
- `types/`: TypeScript type definitions

### Backend Components
- `routes/`: API endpoint definitions
- `controllers/`: Request handlers
- `models/`: Data models
- `services/`: Business logic and external API integrations
- `middleware/`: Express middlewares

## Data Flow
1. User interacts with the React frontend
2. Frontend uses services to make API calls to the backend
3. Backend validates and processes requests
4. Backend interacts with Cosmos DB and other Azure services
5. Backend returns responses to the frontend
6. Frontend updates UI with new data

## Third-Party Services
- Azure Cosmos DB: NoSQL database
- Azure Blob Storage: File storage
- Azure Cognitive Search: Search indexing
- Azure Text Analytics: Natural language processing
- Azure OpenAI: AI capabilities

## Environmental Configuration
The application uses different configuration for development, testing, and production environments. The backend supports local development with mock services when Azure credentials are not available.

## Architectural Decisions

## [2025-05-09] – Component Architecture Refactoring
- **Decision:** Refactored common UI patterns into reusable components and improved type safety
- **Rationale:** Improved maintainability by extracting repetitive patterns into dedicated components, fixed TypeScript errors, and improved performance with React.useCallback
- **Alternatives:** 
  1. Continue with inline component definitions (rejected due to code duplication)
  2. Use a component library like Storybook (considered for future)

### Components Created/Modified:
1. `LinkButton`: Reusable component for Material-UI Buttons that work with React Router
2. `JournalHeader`: Extracted common journal header pattern
3. `JournalEditor`: Optimized with useCallback for better performance

### Type Definition Improvements:
1. Consolidated Button type definitions in global.d.ts
2. Used proper TypeScript types for all components