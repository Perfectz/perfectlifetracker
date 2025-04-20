# Week 4: Tasks, AI Assistant & Final Polish – Daily Plans

## Day 22: Task Management – Data Model & API

### Summary of Tasks
- Design Cosmos DB container `tasks` with partition key `/userId` and recurrence fields.
- Define TypeScript interface `Task` (id, userId, title, dueDate, optional recurrenceRule, completed, createdAt).
- Implement Express CRUD endpoints under `/tasks`, including recurrence logic.
- Write unit tests for CRUD and recurrence scenarios with Jest & Supertest.

### User Stories
- As a user, I want to create tasks with recurrence rules so they repeat automatically.
- As a user, I want to mark tasks complete so I can track progress.
- As a developer, I want a strongly typed `Task` model to catch schema errors early.

### Acceptance Criteria
- Cosmos container `tasks` exists, partitioned by `/userId`.
- TS interface `Task` defined with required fields.
- Express routes:
  - POST `/tasks` → 201 + new task.
  - GET `/tasks` → 200 + list of tasks.
  - GET `/tasks/:id` → 200 or 404.
  - PUT `/tasks/:id` → 200 or 404.
  - DELETE `/tasks/:id` → 204 or 404.
- Recurrence rules processed server‑side for dueDate generation.
- Unit tests cover recurrence cases and CRUD operations.

### IDE Testing Criteria
1. Run backend tests: `npm test` → all task tests pass.
2. Manual REST calls:
   - POST task with recurrence → check generated schedule.
   - GET list and single fetch → correct payload.
3. TypeScript validation: `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline micro‑steps to design the `tasks` container, define the `Task` interface, and implement CRUD endpoints with recurrence logic."
2. "List tasks to configure Cosmos client and declare the `Task` TS interface; after approval, generate the code."
3. "Break down writing POST and GET `/tasks` handlers, including recurrence generation; plan then implement."
4. "Describe subtasks for PUT `/tasks/:id` and DELETE routes; confirm then code."
5. "Outline steps to write Jest & Supertest tests for CRUD and recurrence scenarios; after I confirm, generate test suites."

---

## Day 23: Task Management – UI & Reminder Toggle

### Summary of Tasks
- Build React `TaskList` and `TaskForm` components, including recurrence inputs.
- Add a `ReminderToggle` UI to enable/disable notifications per task.
- Integrate React Query/Axios hooks for `/tasks` API calls.
- Write React Testing Library tests for list, form, and toggle behaviors.

### User Stories
- As a user, I want to view and filter my tasks list.
- As a user, I want to create/edit tasks with recurrence settings.
- As a user, I want to toggle reminders and mark tasks done.

### Acceptance Criteria
- `TaskList` fetches GET `/tasks` and displays title, dueDate, recurrence, and reminder status.
- `TaskForm` validates title (required) and dueDate (valid date), recurrence optional.
- `ReminderToggle` component toggles a reminder flag and updates backend.
- React Query configured for cache invalidation after create/update/delete.
- UI tests cover rendering, form validation, and toggle interactions.

### IDE Testing Criteria
1. Run `npm test` → all Task UI tests pass.
2. In browser:
   - Navigate to `/tasks` → list renders with recurrence and reminder controls.
   - Use `TaskForm` to add/edit tasks; verify task appears.
   - Toggle reminders and mark complete; observe UI updates.
3. `tsc --noEmit` → no type errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline micro‑steps to build `TaskList`, `TaskForm`, and `ReminderToggle` with React Query integration."
2. "Implement the simplest next step: create `TaskList.tsx` that fetches and displays tasks."
3. "List steps to build `TaskForm.tsx` with recurrence inputs and validation; confirm then code."
4. "Describe tasks to implement `ReminderToggle.tsx`; after approval, generate code."
5. "Outline steps to write component tests for the task UI; then create test files."

---

## Day 24: AI Assistant – API

### Summary of Tasks
- Implement Express POST `/ai/tasks-suggestions` endpoint calling Azure OpenAI.
- Define request/response schema in OpenAPI docs.
- Add error handling and retry logic around OpenAI calls.
- Write unit tests mocking the OpenAI client.

### User Stories
- As a user, I want AI suggestions for tasks so I can get inspiration.
- As a developer, I want a robust API with error recovery.

### Acceptance Criteria
- POST `/ai/tasks-suggestions` accepts `{ context: string }` and returns `200` with `{ suggestions: string[] }`.
- Azure OpenAI client integrated with retry/backoff.
- Swagger/OpenAPI definitions updated under `/docs`.
- Jest tests mock OpenAI responses, covering success and failures.

### IDE Testing Criteria
1. Run backend tests: `npm test` → AI endpoint tests pass.
2. Manual API call:
   ```bash
   curl -X POST http://localhost:3001/ai/tasks-suggestions \
     -H 'Content-Type: application/json' \
     -d '{"context":"Plan my week"}'
   ```
   → returns suggestions array.
3. View Swagger UI at `/docs` to confirm schema.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline micro‑steps to implement the AI suggestions endpoint and update docs."
2. "List tasks to integrate Azure OpenAI in `tasks-suggestions` controller; after confirmation, generate the code."
3. "Describe subtasks to write OpenAPI definitions for the new endpoint; confirm then write specs."
4. "Outline steps to write Jest tests mocking the OpenAI client; then create test suites."

---

## Day 25: AI Assistant – UI & Conversation History

### Summary of Tasks
- Build React `AIChat` component for task suggestions and free‑form chat.
- Persist conversation history in backend and fetch on mount.
- Style chat UI with Material UI components.
- Write component and integration tests for chat flows.

### User Stories
- As a user, I want to ask AI for task suggestions in a chat interface.
- As a user, I want my past conversations saved and viewable.

### Acceptance Criteria
- `AIChat` UI sends messages to `/ai/tasks-suggestions` or chat endpoint.
- Conversation history stored in Cosmos and reloaded on mount.
- Chat UI distinguishes user vs AI messages and scrolls to latest.
- Tests cover send/receive logic, history fetch, and error states.

### IDE Testing Criteria
1. Run `npm test` → AIChat tests pass.
2. In browser:
   - Navigate to `/assistant`; send messages; see AI responses.
   - Reload page; verify history persists.
3. `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline micro‑steps to build `AIChat` component, history persistence, and styling."
2. "Describe tasks to fetch and display conversation history; after approval, generate hook code."
3. "List subtasks to implement send/receive logic; confirm then code."
4. "Outline steps to write component and integration tests; then create test files."

---

## Day 26: Cross‑Feature Search – API

### Summary of Tasks
- Index data from tasks, goals, activities, journals, and skills into Azure Cognitive Search.
- Implement Express GET `/search?q=&type=` endpoint querying the search index.
- Support filters by feature type and user scope.
- Write unit tests mocking search service responses.

### User Stories
- As a user, I want to search across all my data in one place.
- As a developer, I want a unified search endpoint with filtering.

### Acceptance Criteria
- Azure Search index defined with fields for each data type.
- GET `/search` returns grouped results by feature type.
- Query params `type` and `q` filter results.
- Unit tests cover search logic and empty responses.

### IDE Testing Criteria
1. Run backend tests: `npm test` → search tests pass.
2. Manual API call:
   ```bash
   curl "http://localhost:3001/search?q=project&type=tasks"
   ```
   → returns grouped JSON.
3. `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline micro‑steps to index data and create the search endpoint with filters."
2. "List tasks to configure Azure Search index and define mapping; after confirmation, generate Terraform or code."
3. "Describe subtasks to implement GET `/search`; plan then implement the handler."
4. "Outline steps to mock search client for Jest tests; then write test files."

---

## Day 27: Cross‑Feature Search – UI & Notifications

### Summary of Tasks
- Create React `SearchBar` with autocomplete and filter dropdown.
- Display grouped search results with icons for each feature.
- Implement real‑time notifications via SignalR or WebSocket for due tasks.
- Write component and integration tests.

### User Stories
- As a user, I want a global search bar that finds items across features.
- As a user, I want real‑time notifications for due tasks or reminders.

### Acceptance Criteria
- `SearchBar` fetches `/search` on input and shows suggestions.
- Results grouped visually by type with feature-specific icons.
- Notification component receives events and displays alerts.
- UI tests cover search input, result rendering, and notifications.

### IDE Testing Criteria
1. Run `npm test` → search and notification tests pass.
2. In browser:
   - Type in the search bar; verify suggestions appear.
   - Simulate notification event; alert appears.
3. `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline micro‑steps to implement `SearchBar`, result grouping, and notification integration."
2. "Describe tasks to build `SearchBar.tsx` with autocomplete; after approval, generate code."
3. "List subtasks to render grouped results; confirm then code."
4. "Outline steps to integrate SignalR for notifications; then create the component."

---

## Day 28: Final Testing & Optimization – Test Suite & CI

### Summary of Tasks
- Consolidate unit, integration, and E2E tests in CI pipeline.
- Enforce code coverage threshold (e.g., ≥80%).
- Configure test reports and artifacts.
- Add smoke tests for critical flows.

### User Stories
- As a QA engineer, I want all tests automatically run and reported on each PR.
- As a developer, I want test coverage metrics enforced.

### Acceptance Criteria
- CI workflow runs `npm test`, `npm run integration`, and `npx cypress run`.
- Fails build if coverage <80%.
- Generates test report artifacts.
- Smoke tests for login, profile, tasks, goals, activities pass.

### IDE Testing Criteria
1. Locally run: `npm test && npm run integration && npx cypress run` → all pass.
2. `npm run coverage` → report meets thresholds.
3. Verify CI pipeline on GitHub Actions passes and uploads reports.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to configure CI test jobs, coverage thresholds, and smoke tests."
2. "List tasks to add coverage enforcement in GitHub Actions; after confirmation, generate YAML."
3. "Describe subtasks to write smoke test scripts; then implement them."

---

## Day 29: Final Testing & Optimization – Performance & Accessibility

### Summary of Tasks
- Run Lighthouse audits and fix critical performance issues.
- Implement React Query caching strategies and lazy loading.
- Perform accessibility audits with axe and address violations.
- Optimize Cosmos DB queries and add indexes for frequent queries.

### User Stories
- As a user, I want fast load times and an accessible interface.
- As a developer, I want guidelines to maintain performance and accessibility.

### Acceptance Criteria
- Lighthouse scores ≥90 for Performance and Accessibility.
- React Query prefetch and cache hydration implemented.
- axe-core audit reports zero severe violations.
- Cosmos DB indexes added for key query patterns.

### IDE Testing Criteria
1. Run: `npm run audit:ci` → outputs performance and accessibility metrics.
2. Use axe in browser to confirm no severe issues.
3. Check logs to confirm indexed queries.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to run performance and accessibility audits and implement fixes."
2. "List tasks to configure React Query caching and lazy loading; confirm then code."
3. "Describe subtasks to run axe audits and fix violations; then implement revisions."

---

## Day 30: Production‑Ready Deployment

### Summary of Tasks
- Finalize Helm charts and Kubernetes manifests with configurable values.
- Configure blue‑green deployments via Azure Front Door.
- Set up automated backups for Cosmos DB and Blob Storage.
- Create alerts and dashboards in Azure Monitor & Application Insights.
- Update README with runbooks and hand‑off documentation.

### User Stories
- As an operator, I want zero‑downtime deployments and backups.
- As a stakeholder, I want runbooks and monitoring dashboards for operations.

### Acceptance Criteria
- Helm charts define service, ingress, and values for each environment.
- GitHub Actions or Azure Pipelines configured for blue‑green rollout.
- Automated backup schedules in Terraform or CLI for Cosmos and Blob.
- Alerts for high latency and error rates configured.
- README includes runbooks and deployment steps.

### IDE Testing Criteria
1. Deploy to staging: `helm upgrade --install` → no downtime.
2. Verify backups in Azure portal.
3. Trigger alert condition (e.g., simulated error) and confirm notification.
4. Review README for clarity and completeness.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to finalize Helm charts, configure blue‑green rollout, set up backups, alerts, and hand‑off docs."
2. "List tasks to update CI/CD pipeline for production deployment; after approval, generate YAML."
3. "Describe subtasks to implement backup scripts and alert rules; then write code/config." 