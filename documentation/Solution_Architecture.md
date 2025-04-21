# Solution Architecture – LifeTracker Pro

## Overview
LifeTracker Pro is a full‑stack health and wellness platform, comprised of a React 18 + TypeScript frontend, an Express TS backend, and Azure‑based infrastructure. The system follows an **API‑first** design, with microservices patterns introduced as needed. Infrastructure is managed via Terraform, containerized via Docker, and deployed to Azure Kubernetes Service (AKS).

## High‑Level Diagram
```
[ React SPA ]  <-->  [ API Gateway / Ingress ]  <-->  [ Express TS API Services ]
                                          |                  |
                                          v                  v
                                   [ Azure AD B2C ]     [ Azure SDKs ]
                                                              |
                                                              v
                             [ Cosmos DB ]  [ Blob Storage ]  [ Redis ]  [ Cognitive Search ]
```

## Core Components

- **Monorepo** (`/frontend`, `/backend`, `/infra`, `/k8s`): shared config, consistency in tooling.  
- **Frontend**: React 18 & TypeScript, Material UI, MSAL React for auth, React Query + Redux Toolkit for state, Axios for HTTP, Recharts for analytics.  
- **Backend**: Node 18 + Express TS, JWT middleware, Swagger/OpenAPI, Azure SDK clients (Cosmos, Blob, Redis, Search).  
- **Auth**: Azure AD B2C with MSAL; Express verifies JWTs via JWKS.  
- **Infra‑as‑Code**: Terraform defines Azure RG, Cosmos DB, Storage, Redis Cache, Search, ACR, AKS; `backend.tf`, `variables.tf`, `outputs.tf`.  
- **Containerization**: Dockerfiles for both services; push to Azure Container Registry; multi‑stage for React → NGINX (non-root user, pinned versions).  
- **Orchestration**: Helm charts + Kubernetes manifests (`k8s/`); Ingress via Azure Front Door (blue‑green support) with TLS and security headers.  

## Major Design Decisions

| Decision                        | Rationale                                                | Alternatives Considered           |
|---------------------------------|----------------------------------------------------------|-----------------------------------|
| Monorepo structure              | Single repo simplifies coordination & shared configs     | Separate repos (more isolation)   |
| API‑First workflow              | Clear contract for frontend, decoupling dev teams        | Backend‑driven endpoints          |
| Azure AD B2C for auth           | Enterprise‑grade identity, OOTB UI for login/signup      | Auth0; custom JWT provider        |
| Cosmos DB (SQL API)             | Globally distributed, auto‑scale, JSON document model    | PostgreSQL on Azure DB for Postgres|
| AKS + Helm charts               | Kubernetes standard for scale, extensible CI/CD          | App Service + Web App containers   |
| Terraform remote state in Blob  | Single source of truth with locking, team safety        | Local state; Terraform Cloud       |
| React Query for data caching    | Automatic background refresh and mutation handling      | Redux Toolkit Query; custom hooks  |
| Non-root containers             | Enhanced security posture by dropping privileges        | Default root-user containers       |
| Security headers                | Protection against common web vulnerabilities           | No headers (default behavior)      |
| Centralized route configuration | Single source of truth for all routes with typed interface | Individual route definitions in components |

## Infrastructure & Deployment

- **CI/CD**: GitHub Actions → lint, build, test, Docker build/push, helm lint/deploy.  
- **Stateful Services**: Cosmos as primary datastore; Redis for low‑latency cache; Blob for user assets.  
- **Search**: Azure Cognitive Search indexes all data for global feature.  
- **Monitoring**: Azure Monitor + Application Insights track performance, errors, and custom events.  
- **Backups & DR**: Automated backup policies for Cosmos & Blob; Geo‑redundant storage.  
- **Container Security**: Pinned versions, non-root users, content security policies, and regular vulnerability scanning.

## Security Architecture

- **Authentication**: Azure AD B2C manages user identity with JWT tokens verified by backend services.
- **Authorization**: Role-based access control (RBAC) in API middleware.
- **Container Security**:
  - Non-root users for all containers (frontend NGINX, backend Node)
  - Explicitly pinned image versions to prevent drift
  - Minimized image sizes through multi-stage builds
  - Custom NGINX configuration with security-focused defaults
- **Network Security**:
  - Ingress configured with TLS and security headers
  - Content-Security-Policy restricting resource origins
  - X-Content-Type-Options, X-Frame-Options, and X-XSS-Protection headers
- **API Security**:
  - Health endpoints for monitoring without exposing sensitive data
  - Rate limiting and throttling for all public endpoints
  - Input validation for all request parameters

## Observability & Testing

- **Unit & Integration**: Jest + Supertest on backend; Jest + React Testing Library on frontend with 80% code coverage threshold.  
- **E2E**: Cypress flows: login → profile → tasks → dashboard.  
- **Smoke tests**: Active at CI startup for core health checks.  
- **Telemetry**: Request/response logging middleware, custom metrics for key endpoints.  
- **Health Probes**: Dedicated health endpoints for each service with standardized responses for Kubernetes liveness/readiness checks.
- **Automated Validation**:
  - Test scripts validate Docker image security configurations
  - K8s manifest validation ensures proper configuration of probes and security annotations
  - CI pipeline includes security scanning steps

## Testing Strategy

We've implemented a comprehensive testing strategy with multiple layers:

1. **Unit Testing**:
   - Frontend: Jest + React Testing Library for components
   - Backend: Jest for business logic and service layers

2. **Integration Testing**:
   - Frontend: Mock server or API with MSW
   - Backend: Supertest for API endpoints

3. **E2E Testing**:
   - Cypress for critical user journeys including navigation flow and route validation
   - Contract testing for API endpoints
   - Dedicated tests for route configuration and navigation state management

4. **Security Testing**:
   - Docker image scanning with Trivy
   - Kubernetes manifest validation 
   - Content Security Policy verification

5. **Performance Testing**:
   - Load testing key API endpoints
   - Frontend bundle size monitoring
   - Memory usage tracking

## Next Steps

- Expand microservice boundaries for chat/AI assistant.  
- Introduce feature flags for controlled rollout.  
- Refine Azure Policy & RBAC for tighter security.  
- Implement automated security scanning for Docker images in CI pipeline.
- Add contract testing between frontend and backend.
- Enhance monitoring with custom dashboards for security events.  
- Expand test coverage for route configuration and navigation flow.

## Recent Architecture Updates

### [2023-05-15] – Centralized Route Configuration
- **Decision:** Implemented a centralized route configuration in `routes.tsx` with a typed interface to standardize route definitions throughout the application.
- **Rationale:** This approach provides a single source of truth for route definitions, simplifies adding new routes, and ensures consistent route handling across components (NavBar, App routing, etc.).
- **Alternatives:** Individual route definitions in components (more flexible but prone to inconsistencies), or using a routing library with built-in centralized routing (adds dependency but provides more features).
- **Testing:** Added dedicated Cypress tests to verify route configuration, ensuring navigation items are properly displayed, active states are correctly applied, and invalid routes are redirected appropriately.  