# Day 6: User Profile CRUD

## Summary of Tasks
- Design Cosmos DB container and TS interface for `Profile`: defines data schema.
- Implement Express CRUD endpoints: basic create, read, update, delete operations.
- Build React components for ProfileView and ProfileEdit: UIs for interacting with profile data.
- Integrate Azure Blob Storage SDK for avatar uploads: stores user images.

## User Stories
- As a user, I want to view my profile so I can see my details.
- As a user, I want to edit my profile so I can update my information.
- As a user, I want to upload an avatar so my profile is personalized.
- As a developer, I want typed interfaces for Profile so I avoid runtime errors.

## Acceptance Criteria
- Cosmos container `profiles` exists, partitioned by `/id`, with correct throughput settings.
- TS interface `Profile` includes fields: `id`, `name`, `email`, `avatarUrl`, and `createdAt`.
- Express routes:
  - POST `/profile` → creates a new profile.
  - GET `/profile/:id` → returns profile by ID.
  - PUT `/profile/:id` → updates profile.
  - DELETE `/profile/:id` → removes profile.
- React:
  - `ProfileView` component fetches and displays profile data.
  - `ProfileEdit` component has a form with validation and avatar upload.
- Avatar uploads to Blob Storage; `avatarUrl` is stored in Cosmos and renders in `ProfileView`.

## IDE Testing Criteria
1. Cosmos setup:
   - Use Azure CLI or Terraform to verify `profiles` container exists.
2. Backend unit tests (Jest + Supertest):
   - CRUD endpoints return correct status codes and payloads.
3. Frontend tests (React Testing Library):
   - Profile form validation works (required fields, email format).
   - Avatar upload button triggers Blob Storage client.
4. Manual flow:
   - Run both servers, use UI to create, view, edit, and delete profiles; upload avatar; verify image displays.

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑tasks for Cosmos container, TS interface, CRUD routes, React components, and Blob upload integration."
2. **Cosmos & Interface:**
   "List steps to define the `Profile` interface and configure the Cosmos client for container `profiles`; after confirmation, write code snippets."
3. **Express CRUD:**
   "Break down creating each CRUD endpoint in Express; confirm then generate handlers with proper status codes."
4. **React Components:**
   "Describe tasks to build `ProfileView` and `ProfileEdit` components with form validation; after approval, write the component code."
5. **Avatar Upload:**
   "Outline steps to integrate Azure Blob Storage SDK for avatar uploads; show plan, then implement the upload handler and update profile." 