# Changelog

All notable changes to Perfect LifeTracker Pro will be documented in this file.

## [Unreleased]

### Added
- CI/CD pipeline integration with containerized builds
- Docker-based deployment workflow with production optimization
- Azure DevOps pipeline configuration for container deployment
- Backend Docker configuration with multi-stage builds
- Environment variable support for container customization
- Docker multi-stage builds for frontend and backend services
- Nginx configuration for production deployments
- Docker Compose setup with frontend and backend services
- Microsoft Entra ID integration for authentication
- Google sign-in support through Microsoft Entra ID

## [0.2.0] - 2023-04-09

### Day 2 Completion
- Implemented authentication system using Microsoft Entra ID
- Added support for both Microsoft and Google authentication
- Fixed UI loading issues
- Removed Redux in favor of Context API for state management
- Created authentication context and providers
- Updated environment variables for Vite compatibility
- Fixed client ID and authority URL configuration
- Enhanced user experience with responsive design
- Added sign-in/sign-out functionality
- Implemented protected routes

### Technical Improvements
- Fixed port conflicts and process management
- Enhanced error handling for authentication flows
- Upgraded to Vite for faster development experience
- Improved TypeScript type definitions 