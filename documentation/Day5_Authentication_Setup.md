# Day 5: Authentication Setup

## Summary of Tasks
- Register SPA and API apps in Azure AD B2C via CLI: establishes identity provider.
- Integrate MSAL React in the frontend: enables login/logout flows.
- Add JWT validation middleware in Express: secures API endpoints.
- Protect a sample `/profile` route: verifies auth integration.

## User Stories
- As a user, I want to log in via Azure AD B2C for secure access.
- As a developer, I want MSAL React set up so I can obtain tokens in the client.
- As an API consumer, I want JWT‑protected endpoints to prevent unauthorized access.
- As a stakeholder, I want a demo `/profile` route that returns user claims.

## Acceptance Criteria
- CLI script (`infra/register_b2c.sh` or PowerShell) creates:
  - AD B2C tenant registrations for SPA and API.
  - Correct reply URLs and scopes.
- `/frontend` updates:
  - Uses the shared `msalInstance` import in both `index.tsx` and `authContext.tsx`.
  - Sets the `apiProfile` endpoint to `http://localhost:4000/api/profile`.
  - Excludes `setupTests.ts` and `setupTests.tsx` from ts-loader to prevent TypeScript module augmentation conflicts.
  - Adds npm scripts: `prestart`, `lint`, `test`, `build`, and `analyze` for streamlined development and testing.
- `/backend` updates:
  - Installs `express-jwt` and `jwks-rsa`.
  - Adds a `jwtCheck` middleware in `index.ts` for JWT validation.
  - Protects GET `/api/profile` → returns 401 if unauthenticated, 200 + JWT claims if authenticated.

## IDE Testing Criteria
1. Run `infra/register_b2c.sh` → registrations created; record SPA and API App IDs.
2. In `/frontend`:
   ```bash
   cd frontend
   npm install
   npm run prestart      # kills port 3000 if in use
   npm start             # starts webpack-dev-server
   npm run lint          # runs ESLint
   npm test              # runs Jest tests
   npm run build         # production build
   npm run analyze       # optional: launch bundle analyzer
   ```
3. In `/backend`:
   ```bash
   cd backend
   npm install
   npm run predev        # kills port 4000 if in use
   npm run lint          # runs ESLint
   npm run build         # compiles TypeScript
   npm test              # runs Jest tests (allows no tests)
   npm run dev           # starts dev server with ts-node-dev
   node test-api-contract.js  # contract test for /health endpoint
   ```

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline steps for Azure AD B2C registration, frontend MSAL integration, and backend JWT middleware."
2. **B2C Registration Script:**
   "List micro‑steps to script Azure CLI commands for AD B2C app registrations; after confirmation, generate the script."
3. **Frontend Auth Setup:**
   "Describe the tasks to integrate MSAL React (install, config, wrap App, add buttons); confirm then generate code."
4. **Backend JWT Middleware:**
   "Break down adding `express-jwt` and `jwks-rsa` middleware; plan then write the middleware code in `index.ts`."
5. **Protected Route:**
   "Draft the plan to protect `/profile` and return user claims; after approval, implement the route handler."

## Current Status

### Completed Tasks

- **Authentication Framework**:
  - ✅ Successfully integrated MSAL React packages for frontend authentication
  - ✅ Created `authConfig.ts` with configuration for authentication parameters
  - ✅ Implemented comprehensive `AuthProvider` using React Context
  - ✅ Created sign-in/sign-out UI components that update based on auth state
  - ✅ Implemented JWT validation middleware in the backend (express-jwt)
  - ✅ Protected API route `/api/profile` for authenticated access

- **Development Approach**:
  - ✅ Implemented mock authentication system for development without requiring actual Azure B2C tenant
  - ✅ Created simulation for token generation with proper interface compatibility
  - ✅ Added session storage persistence for auth state between page refreshes
  - ✅ Configured dummy profile data for testing user information display

- **Performance Optimizations**:
  - ✅ Added code splitting with React.lazy for ProfileContent component
  - ✅ Configured webpack bundle analyzer for monitoring production bundle size 
  - ✅ Implemented chunk splitting to separate MSAL from main bundle
  - ✅ Added compression middleware on backend for faster API responses
  - ✅ Enhanced security with proper Content-Security-Policy via Helmet

- **Error Handling & Reliability**:
  - ✅ Implemented ErrorBoundary component to catch and display React rendering errors
  - ✅ Added comprehensive error handling middleware in Express
  - ✅ Created graceful API error responses with proper status codes
  - ✅ Implemented 404 handler for undefined routes

- **Development Workflow**:
  - ✅ Added `prestart`/`predev` scripts to automatically kill ports before server start
  - ✅ Configured `lint`, `test`, and `build` scripts for both frontend and backend
  - ✅ Fixed TypeScript configuration to properly exclude test files from build
  - ✅ Implemented API contract testing with `test-api-contract.js`

### Next Steps

1. **Azure AD B2C Integration**:
   - Create actual Azure AD B2C tenant for production deployment
   - Register SPA and backend API applications in Azure
   - Configure proper scopes and permissions
   - Update `authConfig.ts` with real tenant values

2. **Authentication Testing**:
   - Add unit tests for authentication flows
   - Create integration tests for protected routes
   - Test token acquisition and refresh scenarios

3. **User Profiles**:
   - Design and implement user profile data structure
   - Create backend API for profile CRUD operations
   - Build profile UI components
   - Transition to Day 6 implementation 