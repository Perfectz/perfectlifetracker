<!-- Week3_Daily_Plans.md -->

> **Note:** This file is kept for reference. For detailed daily plans, please refer to the following standalone files:
> - [Day 15: Habit Tracker – Data Model & API](./Day15_Habit_Tracker_Data_Model_API.md)
> - [Day 16: Habit Tracker – UI & Streak Visualization](./Day16_Habit_Tracker_UI_Streak_Visualization.md)
> - [Day 17: Journal & Sentiment – Data Model & API](./Day17_Journal_Sentiment_Data_Model_API.md)
> - [Day 18: Journal & Sentiment – UI & Mood Chart](./Day18_Journal_Sentiment_UI_Mood_Chart.md)
> - [Day 19: Skills & Learning – Data Model & API](./Day19_Skills_Learning_Data_Model_API.md)
> - [Day 20: Skills & Learning – UI & Progress Dashboard](./Day20_Skills_Learning_UI_Progress_Dashboard.md)
> - [Day 21: Feature Integration & Tests](./Day21_Feature_Integration_Tests.md)

# Week 3: Personal Development – Daily Plans

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

---

## Day 16: Habit Tracker – UI & Streak Visualization

### Summary of Tasks
- Build `HabitList`, `HabitForm` (create/edit) React components.
- Create `StreakChart` (Recharts) to visualize consecutive days.
- Integrate React Query/Axios for `/habits` API calls.
- Write React Testing Library tests for components.

### User Stories
- As a user, I want to view my habits list so I can track routines.
- As a user, I want to add or edit habits through a form with validation.
- As a user, I want to see a streak chart so I know my consistency.

### Acceptance Criteria
- `HabitList` fetches GET `/habits` and displays habit names.
- `HabitForm` validates required fields and submits to POST or PUT `/habits`.
- `StreakChart` uses mock data to render a Recharts line chart of streak values.
- React Query caching/invalidation on create/update/delete.
- Component tests cover rendering, form validation, and chart presence.

### IDE Testing Criteria
1. Run `npm test` → all UI tests pass.
2. In browser:
   - Navigate to `/habits`; list and chart display.
   - Use form to add/edit; view updated list and chart.
3. `tsc --noEmit` → no type errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to build `HabitList`, `HabitForm`, and `StreakChart` with React Query integration."
2. "Implement the simplest next step: create `HabitList.tsx` that fetches and displays habits."
3. "List micro‑tasks to build `HabitForm.tsx` with validation; confirm then code."
4. "Describe tasks to implement `StreakChart.tsx` using Recharts; after approval, generate code."
5. "Outline steps to write component tests for these elements; then create test files."

---

## Day 17: Journal & Sentiment – Data Model & API

### Summary of Tasks
- Design Cosmos DB container `journals` with `/userId` partition key.
- Define TS interface `JournalEntry` (id, userId, content, date, sentiment).
- Implement Express CRUD endpoints under `/journals`.
- Integrate Azure Text Analytics to analyze sentiment on create.
- Write unit tests mocking Text Analytics.

### User Stories
- As a user, I want to save journal entries so I can reflect later.
- As a user, I want sentiment scores for each entry so I can track mood.
- As a developer, I want automated sentiment analysis integration tested.

### Acceptance Criteria
- Cosmos container `journals` exists.
- TS interface `JournalEntry` includes `sentimentScore`.
- Routes:
  - POST `/journals` → analyze sentiment, store entry.
  - GET `/journals` → list entries with sentiment.
  - PUT/DELETE `/journals/:id` per spec.
- Unit tests cover CRUD and mock sentiment calls.

### IDE Testing Criteria
1. Run `npm test` → all journal endpoint tests pass.
2. Manual API calls:
   - POST entry → sentimentScore present.
   - GET/PUT/DELETE behave as expected.
3. `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to set up `journals` container, define `JournalEntry` interface, CRUD routes, and sentiment integration."
2. "Describe micro‑tasks to integrate Azure Text Analytics in POST `/journals`; after confirmation, generate controller code."
3. "Break down GET, PUT, DELETE `/journals` endpoints; plan then implement."
4. "List subtasks to write unit tests mocking Text Analytics client; confirm then code tests."
5. "Outline steps to define the `JournalEntry` interface and configure Cosmos client; then write code snippets."

---

## Day 18: Journal & Sentiment – UI & Mood Chart

### Summary of Tasks
- Create `JournalList` and `JournalEditor` React components.
- Build `MoodChart` (Recharts) to visualize sentiment over time.
- Use React Query/Axios for `/journals` API calls.
- Write component and integration tests.

### User Stories
- As a user, I want to view past entries and their sentiment.
- As a user, I want to write and edit entries with real‑time sentiment analysis.
- As a user, I want a mood trend chart to understand my emotional patterns.

### Acceptance Criteria
- `JournalList` fetches entries and displays content and sentiment icon.
- `JournalEditor` includes a text area; on submit, POST updates list and chart.
- `MoodChart` renders sentiment scores over dates.
- Component tests cover list, editor, and chart behaviors.

### IDE Testing Criteria
1. Run `npm test` → journal UI tests pass.
2. In browser:
   - Navigate to `/journals`; list and chart appear.
   - Edit entry; verify updates and chart refresh.
3. `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to build `JournalList`, `JournalEditor`, and `MoodChart` with React Query."
2. "Implement `JournalList.tsx` to fetch and show entries with sentiment."
3. "Describe tasks to create `JournalEditor.tsx` with sentiment display; confirm then code."
4. "List subtasks to build `MoodChart.tsx`; after approval, implement chart code."
5. "Outline steps to write tests for these components; then generate test files."

---

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

---

## Day 20: Skills & Learning – UI & Progress Dashboard

### Summary of Tasks
- Build `SkillList` and `SkillForm` components.
- Create `MilestoneList` and `MilestoneForm` under each skill.
- Implement `ProgressDashboard` using Recharts or charts of completed milestones.
- Integrate React Query for skills and milestones.
- Write UI tests.

### User Stories
- As a user, I want to add skills and set milestones so I can plan learning.
- As a user, I want to view progress dashboards visualizing completed milestones.

### Acceptance Criteria
- `SkillList` fetches and displays skills.
- `SkillForm` validates and submits new skills.
- `MilestoneList` under each skill shows milestones.
- `MilestoneForm` adds milestones to a skill.
- `ProgressDashboard` shows % milestones completed per skill.
- UI tests cover all components.

### IDE Testing Criteria
1. Run `npm test` → skill UI tests pass.
2. In browser:
   - Navigate to `/skills`; list, forms, and dashboard render.
   - Add skill and milestones; observe dashboard updates.
3. `tsc --noEmit` → no errors.

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to build `SkillList`, `SkillForm`, `MilestoneList`, `MilestoneForm`, and `ProgressDashboard` with React Query."
2. "Implement `SkillList.tsx` to fetch and render skills."
3. "Describe tasks to create `SkillForm.tsx`; after confirmation, generate the form code."
4. "List subtasks to build milestones UI under skills; plan then implement."
5. "Outline steps to write UI tests for these components; then create test files."

---

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