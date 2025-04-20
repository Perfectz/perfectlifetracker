# Day 14: End-to-End Integration & Testing

## Summary of Tasks
- Wire together Goals, Activities, Profile, and Analytics flows to validate full-stack integration.
- Write end-to-end tests using Supertest for backend routes and Cypress for UI flows.
- Configure monitoring in Application Insights for key endpoints.
- Update GitHub Actions to run integration and E2E tests on PRs.
- Ensure documentation reflects end-to-end setup and test commands.

## User Stories
- As a user, I want to complete a flow of logging in, creating goals and activities, and viewing insights, so I know everything works together.
- As a developer, I want automated integration tests so I catch regressions early.
- As a QA engineer, I want E2E UI tests for core user journeys to validate real-world scenarios.
- As a stakeholder, I want monitoring alerts configured so I'm notified of production issues.

## Acceptance Criteria
- Backend supertest suite covers combined scenarios:
  - Authenticated POST → GET → DELETE on `/profile`, `/goals`, and `/activities`.
  - GET `/analytics/fitness` returns aggregated data.
  - POST `/openai/fitness-summary` returns summary text.
- Cypress E2E tests in `/cypress/integration/e2e.spec.ts` automate:
  - Login → Create Profile → Add Goal → Log Activity → View Dashboard insights.
  - Assertions on page navigation, data display, and no uncaught errors.
- GitHub Actions workflow updated:
  - Runs `npm test` (unit) and `npm run integration` (supertest).
  - Runs `npx cypress run` for E2E.
- Application Insights telemetry configured in Express middleware for request tracking.
- README updated with commands: `npm run integration`, `npm run e2e`, and monitoring setup.

## IDE Testing Criteria
1. Run unit and integration tests locally:
   - `npm test && npm run integration` → all tests pass.
2. Run Cypress locally:
   - `npx cypress open` → tests execute and pass.
3. Validate monitoring:
   - Trigger a sample request; verify telemetry appears in Application Insights.
4. Commit and open PR:
   - Ensure GitHub Actions runs integration and E2E jobs successfully.

## Vibe-Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro-steps to wire services together, write Supertest and Cypress tests, update CI, and configure monitoring."
2. **Backend Integration Tests:**
   "List tasks to write Supertest scenarios covering profile, goals, activities, and analytics; after approval, generate the test file."
3. **Cypress E2E Tests:**
   "Describe micro-steps to implement UI E2E spec for the login → goal/activity → dashboard flow; plan then code the tests."
4. **CI Workflow Update:**
   "Break down adding integration and E2E jobs in GitHub Actions; show plan, then update `.github/workflows/ci.yml`."
5. **Monitoring Setup:**
   "Outline steps to add Application Insights middleware in Express and verify telemetry; after confirmation, implement the code and config." 