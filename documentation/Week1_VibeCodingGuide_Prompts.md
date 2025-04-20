# Week 1: Vibe Coding Prompts

This document recrafts the Day 1–7 Cursor prompts following Peter Yang's "12 Rules to Vibe Code Without Frustration." Each prompt follows vibe coding best practices: request a plan first, offer options, break tasks into small steps, and confirm before coding.

## Day 1: Repo & Infra Scaffold
**Prompt:**
"Tell me your plan first; don't code. Generate a concise README spec that includes:
1. High-level requirements for a monorepo with `/frontend` and `/backend` (React TS, Express TS).
2. Tech stack details.
3. Up to 5 milestones covering scaffolding ESLint/Prettier, Webpack, Terraform stub, and CI pipeline stub.
After I review and confirm, scaffold the directory structure and initial configs."

## Day 2: Azure Resources Provisioned
**Prompt:**
"Give me two options—starting with the simplest—for Terraform configuration to provision:
- Azure Resource Group
- Cosmos DB (SQL API)
- Blob Storage
- Redis Cache
- Cognitive Search
- ACR
- AKS
Present the plans; wait for me to choose one before generating the Terraform code."

## Day 3: API "Hello" on AKS
**Prompt:**
"Outline the smallest next steps to implement and deploy a health-check endpoint:
1. Draft the Express GET `/health` handler.
2. Sketch a Dockerfile to containerize the backend.
3. Define Kubernetes YAML for Deployment, Service, and Ingress.
Show me this plan; after I approve each substep, write the code or manifests."

## Day 4: React "Hello" + Integrated Build
**Prompt:**
"Provide three options—from simplest to most robust—for building and deploying a React Hello World app:
- React code and Webpack build.
- Multi-stage Dockerfile serving via NGINX.
- Kubernetes Deployment and Ingress configuration under the same domain as the backend.
List the pros/cons; wait for me to pick an approach before coding."

## Day 5: Authentication Setup
**Prompt:**
"Ask which versions of MSAL and JWT middleware you support. Then outline the key steps:
1. Azure CLI script to register SPA and API in AD B2C.
2. Client-side MSAL React integration.
3. Server-side JWT validation middleware.
Present the step-by-step plan; after approval, generate the scripts and code."

## Day 6: User Profile CRUD
**Prompt:**
"Break the profile CRUD feature into these micro-tasks:
1. Define Cosmos DB container and TS interface for Profile.
2. Implement Express routes for GET/POST/PUT/DELETE.
3. Create React ProfileView and ProfileEdit components.
4. Integrate Blob Storage for avatar uploads.
Describe each in one sentence; confirm before writing code for each task."

## Day 7: Navigation & Dashboard Shell
**Prompt:**
"Propose two approaches for responsive navigation and theming:
- MUI Drawer + BottomNavigation with Context-based theming.
- Custom hook for media queries and styled-components theming.
Outline both plans; after I choose, break the implementation into steps (NavBar, ThemeContext, Dashboard stub, E2E test) and code each incrementally." 