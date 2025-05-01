<!-- Day19_Skills_Learning_Data_Model_API.md -->

## Day 19: Skills & Learning – Data Model & API

### Summary of Tasks
- Design Cosmos DB containers `skills` and `milestones`.
- Define TS interfaces `Skill` and `Milestone`.
- Implement Express endpoints for skills CRUD and nested milestones under `/skills/:id/milestones`.
- Write unit tests.

### User Stories
- As a user, I want to track skills and set milestones so I can plan learning.
- As a developer, I want nested APIs for skills and milestones.

### Acceptance Criteria
- Containers `skills`, `milestones` exist.
- `Skill` and `Milestone` interfaces defined.
- Routes:
  - POST/GET/PUT/DELETE `/skills`.
  - POST/GET/PUT/DELETE `/skills/:id/milestones`.
- Tests cover all cases.

### IDE Testing Criteria
1. Run `npm test` → skill and milestone tests pass.
2. Manual API calls:
   - CRUD on skills and milestones per spec.
3. `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to create `skills` and `milestones` containers, interfaces, and endpoints."
2. "Describe tasks to define `Skill` and `Milestone` interfaces; after approval, generate code."
3. "Break down CRUD for `/skills`; plan then implement."
4. "List subtasks for nested `/skills/:id/milestones` endpoints; confirm then code."
5. "Outline steps to write unit tests for both sets of endpoints; then generate test suites." 