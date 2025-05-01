<!-- Day21_Feature_Integration_Tests.md -->

## Day 21: Feature Integration & Tests

### Summary of Tasks
- Tie together habits, journals, and skills features in a unified dashboard.
- Write Supertest integration tests for combined API flows.
- Create Cypress E2E tests for multi-feature user journeys.
- Optimize queries and document performance tips.
- Update project README with Week 3 instructions and test commands.

### User Stories
- As a user, I want a single flow from recording habits, journaling, and skill tracking so I see cross‑feature insights.
- As a QA engineer, I want integration and E2E tests covering combined scenarios.
- As a stakeholder, I want performance optimizations and clear docs.

### Acceptance Criteria
- Integration tests cover:
  - Creating profile → habits → journals → skills → dashboard data fetch.
- Cypress tests automate cross‑feature flows with assertions.
- Queries optimized with indexing or batch fetch where needed.
- README updated with commands: `npm run integration`, `npm run e2e`, and performance notes.

### IDE Testing Criteria
1. Run combined tests: `npm test && npm run integration && npx cypress run` → all pass.
2. Validate query performance via logs or simple benchmarks.
3. Review README for clarity and accuracy.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to integrate habits, journals, skills, write integration tests, optimize queries, and update docs."
2. "List micro‑tasks to write Supertest integration scenarios across features; after approval, generate tests."
3. "Describe steps to create Cypress E2E tests for multi-feature flows; plan then code."
4. "Outline ways to optimize database queries and index usage; after confirmation, implement improvements."
5. "Break down updating README with Week 3 guides and commands; then draft documentation." 