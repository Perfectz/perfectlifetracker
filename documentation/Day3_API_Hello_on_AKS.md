# Day 3: API "Hello" on AKS

## Summary of Tasks
- Implement GET `/health` endpoint: verifies the API is running.
- Containerize the backend with a Dockerfile: enables deployment to ACR.  
- Write Kubernetes manifests under `k8s/backend/` (Deployment, Service, Ingress): deploys and exposes the API on AKS.  
- Update CI pipeline to build, tag, and push the Docker image to ACR.

## User Stories
- As an operator, I want a `/health` endpoint so I can monitor service availability.
- As a DevOps engineer, I want the backend containerized so it runs consistently in AKS.
- As a team member, I want Kubernetes manifests so I can deploy the service reliably.
- As a stakeholder, I want CI to automatically build and publish images on merges.

## Acceptance Criteria
- Express app defines GET `/health` returning HTTP 200 with `{ "status": "ok" }`.
- `Dockerfile` in `/backend` builds a Node 18 image and defines `CMD npm start`.
- `k8s/backend/` contains:
  - `deployment.yaml` for backend Deployment
  - `service.yaml` for ClusterIP Service
  - `ingress.yaml` routing `/health` to the backend Service
- CI workflow updated to build `backend:latest`, login to ACR, and push the image.
- After `kubectl apply -f k8s/backend/`, `curl http://<ingress-host>/health` returns 200 and JSON.

## IDE Testing Criteria
1. In `/backend`:
   - Run `npm start` → server starts.
   - Run `curl http://localhost:3000/health` → `{ "status": "ok" }`.
2. Build & run container locally:
   - `docker build -t backend-test .` → no errors.
   - `docker run -p 3000:3000 backend-test` → `curl http://localhost:3000/health` → OK.
3. Deploy to AKS:
   - `kubectl apply -f k8s/backend/` → resources created.
   - `curl http://<ingress-host>/health` → 200 OK.
4. Merge to main and verify CI run builds & pushes image without errors.

## Vibe-Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline the micro-steps to implement and deploy a health-check endpoint: Express handler, Dockerfile, Kubernetes YAML, and CI update."
2. **Express Endpoint:**
   "Implement the simplest next step: add GET `/health` in `src/index.ts` returning `{ status: 'ok' }`."
3. **Dockerfile Creation:**
   "Describe the steps to write a Dockerfile that builds the backend image on Node 18; after I confirm, generate the file."
4. **Kubernetes Manifests:**
   "List tasks to create `deployment.yaml`, `service.yaml`, and `ingress.yaml` under `k8s/backend/`; await my confirmation before writing."
5. **CI Pipeline Update:**
   "Break the CI update into steps: build image, login to ACR, tag and push; plan first, then write the GitHub Actions YAML." 