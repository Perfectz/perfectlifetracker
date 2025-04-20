# Day 10: Activities Feature – Data Model & API

## Summary of Tasks
- Design Cosmos DB container for `Activity` with partition key `/userId`: structures user activity data.
- Define TypeScript interface for `Activity`: ensures consistent data shapes.
- Implement Express CRUD endpoints under `/activities`: create, list (with filters), retrieve, update, delete.
- Write unit tests for all endpoints using Jest & Supertest.

## User Stories
- As a user, I want to log an activity so I can track my workouts.
- As a user, I want to view my activity history with optional date or type filters.
- As a user, I want to update or delete an activity entry.
- As a developer, I want a typed `Activity` model to catch errors early.

## Acceptance Criteria
- Cosmos container named `activities` exists, partitioned by `/userId`.
- TS interface `Activity` includes fields: `id`, `userId`, `type`, `duration`, `calories`, `date`, and optional `notes`.
- Express routes implemented:
  - POST `/activities` → returns 201 and new activity JSON.
  - GET `/activities` → returns 200 and array of activities; supports `type`, `startDate`, `endDate` query parameters.
  - GET `/activities/:id` → returns 200 and activity or 404 if not found.
  - PUT `/activities/:id` → returns 200 and updated activity or 404.
  - DELETE `/activities/:id` → returns 204 on success or 404.
- Jest & Supertest tests cover success and error cases for each endpoint.

## IDE Testing Criteria
1. Run backend tests: `npm test` → all activity endpoint tests pass.
2. Manual testing in REST client:
   - POST valid/invalid payloads → correct status codes.
   - GET list with/without filters → returns expected results.
   - GET/PUT/DELETE by ID → behave according to spec.
3. TypeScript check: `tsc --noEmit` → no errors in model or route files.

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑steps to set up the `Activity` Cosmos container, define the TS interface, and implement CRUD endpoints with filters."
2. **Model & Interface:**
   "Describe micro‑tasks to configure the Cosmos client and define the `Activity` interface; after confirmation, generate the code."
3. **Create & List Endpoints:**
   "Break down tasks for POST `/activities` and GET `/activities` (including filters); plan first, then implement handlers."
4. **Retrieve, Update, Delete Endpoints:**
   "List subtasks to add GET `/activities/:id`, PUT `/activities/:id`, and DELETE `/activities/:id`; after planning, write the code."
5. **Unit Tests:**
   "Outline steps to write Jest & Supertest tests for each endpoint including edge cases; confirm before generating test suites." 