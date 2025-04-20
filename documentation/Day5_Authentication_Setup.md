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
  - Configures `HtmlWebpackPlugin` to include and serve `favicon.ico`.
  - Excludes `setupTests.ts` from ts-loader to prevent TypeScript module augmentation conflicts.
- `/backend` updates:
  - Installs `express-jwt` and `jwks-rsa`.
  - Adds a `jwtCheck` middleware in `index.ts` for JWT validation.
  - Protects GET `/api/profile` → returns 401 if unauthenticated, 200 + JWT claims if authenticated.

## IDE Testing Criteria
1. Run `infra/register_b2c.sh` → registrations created; record SPA and API App IDs.
2. In `/frontend`:
   - `npm install` → MSAL packages installed.
   - `npm start` → compiles without TypeScript errors; app available at `http://localhost:3000`.
   - Visit `http://localhost:3000/favicon.ico` to verify favicon is served.
   - Perform login/logout → MSAL popup works; network tab shows `Authorization` header on profile fetch.
3. In `/backend`:
   - `npm install` → JWT middleware installed.
   - `npm run dev` → backend running on `http://localhost:4000`.
   - `curl http://localhost:4000/api/health` → responds 200 with OK message.
   - `curl http://localhost:4000/api/profile` (no token) → responds 401.
   - `curl -H "Authorization: Bearer <token>" http://localhost:4000/api/profile` → responds 200 + claims.

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