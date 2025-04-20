# Day 4: React "Hello" + Integrated Build

## Summary of Tasks
- Implement a Hello World page in React to verify frontend setup.
- Configure Webpack for production builds outputting to `dist/`.
- Create a multi-stage Dockerfile (Node build + NGINX serve) for frontend.
- Add Kubernetes manifests in `k8s/frontend/`: Deployment, Service, and update Ingress to route `/`.
- Update CI to build, tag, and push the frontend image to ACR.
- Implement security best practices for Docker containers and Kubernetes.
- Set up Jest testing infrastructure with React Testing Library.

## User Stories
- As a user, I want to see "Hello World" at the application root.
- As a developer, I want Webpack configured for TS so I get production-ready bundles.
- As a DevOps engineer, I want a Dockerfile that produces a small NGINX image serving static assets.
- As a stakeholder, I want the frontend and backend served under the same Ingress domain.
- As a security officer, I want containers to follow least privilege principles and use security headers.
- As a QA engineer, I want automated tests to verify frontend components.

## Acceptance Criteria
- `/frontend/src/App.tsx` returns `<h1>Hello World</h1>`.
- `webpack.config.js` builds production assets into `dist/`.
- `/frontend/Dockerfile` is multi-stage: builds with Node 18, serves via `nginx:1.23.3-alpine`.
- Docker container uses non-root user for improved security.
- Custom NGINX configuration with security headers and caching configured.
- Dedicated `/health` endpoint for Kubernetes health probes.
- `k8s/frontend/` contains:
  - `deployment.yaml` with health probes pointing to `/health`
  - `service.yaml`
  - `ingress.yaml` mapping `/` to the frontend Service with security annotations.
- CI workflow builds `frontend:latest`, logs into ACR, pushes image, and runs tests.
- Jest tests verify that the App component renders correctly.
- Visiting `http://<domain>/` shows Hello World; `/health` returns health status.

## Implementation Status
All acceptance criteria have been successfully implemented and verified through testing:

1. **Frontend Implementation**:
   - ✅ App component with "Hello World" created and styled
   - ✅ Webpack builds production assets into dist/ directory
   - ✅ All Jest tests pass with 100% code coverage

2. **Docker Container**:
   - ✅ Multi-stage build with Node 18 and nginx:1.23.3-alpine
   - ✅ Container runs as non-root user (appuser)
   - ✅ Security headers properly implemented and verified
   - ✅ Health endpoint returns 200 OK

3. **Kubernetes Manifests**:
   - ✅ All required manifests created and validated
   - ✅ Deployment includes proper health probes
   - ✅ Ingress includes security annotations

4. **CI Integration**:
   - ✅ CI workflow updated to build, test and push the frontend image

## IDE Testing Criteria
1. In `/frontend`, run:
   - `npm start` → browse `http://localhost:3000` → "Hello World".
   - `npm run build` → verify `dist/index.html` exists.
   - `npm test` → verify App component tests pass.
2. Locally build/run Docker image:
   - `docker build -t frontend-test .` → no errors.
   - `docker run -p 8080:80 frontend-test` → browse `http://localhost:8080` → Hello World.
   - `curl http://localhost:8080/health` → 200 OK response.
3. Inspect Docker security:
   - `docker inspect frontend-test` → verify non-root user is configured.
   - `curl -I http://localhost:8080` → verify security headers are present.
4. Deploy to AKS:
   - `kubectl apply -f k8s/frontend/` → resources ready.
   - Verify health probes are working with `kubectl describe pod <frontend-pod>`.
   - Curl `http://<ingress-host>/` → 200 OK and content contains Hello World.
   - Curl `http://<ingress-host>/health` → 200 OK for health status.
5. Merge branch to main and ensure CI builds, tests, and pushes without failures.

## Manual Verification
To manually verify the implementation:

1. **View the frontend in development mode**:
   ```bash
   cd frontend
   npm start
   ```
   Open http://localhost:3000 in a browser to see "Hello World".

2. **View the frontend in Docker (production-like)**:
   ```bash
   cd frontend
   docker build -t frontend-test .
   docker run -d -p 8080:80 frontend-test
   ```
   Open http://localhost:8080 in a browser to see "Hello World".
   
3. **Check the health endpoint**:
   Open http://localhost:8080/health in a browser to see the "OK" response.

4. **Verify security headers**:
   ```bash
   $response = Invoke-WebRequest -Uri http://localhost:8080/; $response.Headers | Format-List
   ```
   Headers should include X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, and Content-Security-Policy.

## Automated Test Scripts
We've created additional test scripts to validate the implementation:

1. **test-build.js**: Builds the frontend and validates both the build output and endpoint responses with security headers.
2. **test-server.js**: A simple HTTP server that serves the frontend build with proper security headers.
3. **validate-manifests.js**: Validates the Kubernetes manifest files for proper structure and security configurations.

## Vibe-Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline the micro-steps for React Hello World, Webpack build, Dockerfile, K8s manifests, and CI update."
2. **React Component:**
   "Implement the simplest next step: update `src/App.tsx` to render 'Hello World'."
3. **Webpack Configuration:**
   "List the micro-tasks to configure `webpack.config.js` for a production build to `dist/`; after I confirm, generate the config."
4. **Dockerfile Creation:**
   "Describe steps to write a multi-stage Dockerfile using Node 18 for build and `nginx:alpine` to serve; await my confirmation before coding."
5. **Security Enhancement:**
   "Explain how we can improve container security with non-root users and security headers."
6. **Testing Setup:**
   "Outline how to set up Jest with React Testing Library to test our App component."
7. **K8s & CI Update:**
   "Break down creating `k8s/frontend/` manifests and updating CI pipeline into sub-tasks; show me the plan, then write the YAMLs." 