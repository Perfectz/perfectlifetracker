# Day 8: Goals Feature – Data Model & API

## Summary of Tasks
- Design Cosmos DB container for `FitnessGoal` with partition key `/userId`: organizes data per user.
- Define TypeScript interface for `FitnessGoal`: ensures type safety.
- Implement Express CRUD endpoints under `/goals`: create, read (all & by ID), update, delete.
- Write unit tests for each endpoint using Jest & Supertest.

## User Stories
- As a user, I want to create a fitness goal so I can track my objectives.
- As a user, I want to list all my goals so I can review progress.
- As a user, I want to update or delete a goal so I can manage my plans.
- As a developer, I want a strongly typed `FitnessGoal` model to prevent runtime errors.

## Acceptance Criteria
- Cosmos container named `goals` exists with `/userId` as the partition key.
- TS interface `FitnessGoal` includes fields: `id`, `userId`, `title`, `targetDate`, `createdAt`, and optional `notes`.
- Express routes implemented:
  - POST `/goals` → 201 with new goal payload.
  - GET `/goals` → 200 with array of goals for `req.userId`.
  - GET `/goals/:id` → 200 with single goal or 404 if not found.
  - PUT `/goals/:id` → 200 with updated goal or 404.
  - DELETE `/goals/:id` → 204 on success or 404.
- Unit tests cover all endpoints, asserting correct status codes and response bodies.

## IDE Testing Criteria
1. Run backend unit tests:
   - `npm test` → all goal endpoint tests pass.
2. Manual API testing (using REST client in IDE):
   - POST to `/goals` → returns 201 and valid JSON.
   - GET `/goals` → returns list including created goal.
   - PUT and DELETE `/goals/:id` behave as expected.
3. Verify TypeScript compilation:
   - `tsc --noEmit` → no errors in model or controller files.

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑steps to design the `FitnessGoal` Cosmos container, define TS interface, and implement CRUD endpoints."
2. **Model & Interface:**
   "Describe tasks to configure the Cosmos client and define the `FitnessGoal` interface; after confirmation, generate the code."
3. **Create & List Endpoints:**
   "Break down creating POST `/goals` and GET `/goals` handlers; plan first, then implement with proper status codes."
4. **Get, Update, Delete Endpoints:**
   "List sub‑tasks to add GET `/goals/:id`, PUT, and DELETE handlers; after planning, write the code."
5. **Unit Tests:**
   "Outline steps to write Jest & Supertest tests for each CRUD endpoint; confirm before generating test suites." 