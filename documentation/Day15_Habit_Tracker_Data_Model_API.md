<!-- Day15_Habit_Tracker_Data_Model_API.md -->

## Day 15: Habit Tracker – Data Model & API

### Summary of Tasks
- Design Cosmos DB container `habits` with partition key `/userId`.
- Define TS interface `Habit` (id, userId, name, frequency, streak, createdAt).
- Implement Express CRUD endpoints under `/habits`.
- Write unit tests for each endpoint using Jest & Supertest.

### User Stories
- As a user, I want to add habits so I can track routines.
- As a user, I want to update and delete habits so I can manage my plans.
- As a developer, I want a typed `Habit` model to catch schema errors early.

### Acceptance Criteria
- Cosmos container `habits` exists, partitioned by `/userId`.
- TS interface `Habit` defined with required fields.
- Express routes:
  - POST `/habits` → 201 + new habit.
  - GET `/habits` → 200 + list of habits.
  - GET `/habits/:id` → 200 or 404.
  - PUT `/habits/:id` → 200 or 404.
  - DELETE `/habits/:id` → 204 or 404.
- Unit tests for all routes pass.

### IDE Testing Criteria
1. Run `npm test` → habit endpoint tests pass.
2. Manual REST calls:
   - POST, GET, PUT, DELETE `/habits` behave per spec.
3. TypeScript check: `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to set up the `habits` container, define the `Habit` interface, and implement CRUD endpoints."
2. "List micro‑tasks to configure the Cosmos client and add the `Habit` TS interface; after approval, generate code."
3. "Break down writing POST and GET `/habits` handlers; plan then implement with proper codes and payloads."
4. "List subtasks for GET `/habits/:id`, PUT, and DELETE routes; confirm then code."
5. "Outline steps to write Jest & Supertest tests for each endpoint; after I confirm, generate test suites." 