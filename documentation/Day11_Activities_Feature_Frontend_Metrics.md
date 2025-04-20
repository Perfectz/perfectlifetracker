# Day 11: Activities Feature – Frontend & Metrics

## Summary of Tasks
- Build `ActivityForm` component to log new activities with validation.
- Create `ActivityList` with date and type filters to browse history.
- Implement `MetricsSummary` component to calculate total duration, total calories, and average per day.
- Integrate React Query/Axios hooks for `/activities` API calls.
- Write React Testing Library tests for forms, lists, and metrics.

## User Stories
- As a user, I want to log an activity so I can track my workouts.
- As a user, I want to filter my activities by date and type so I can find specific entries.
- As a user, I want to see key metrics (total time, calories burned) so I can assess my performance.
- As a developer, I want typed React hooks and components to catch errors at compile time.

## Acceptance Criteria
- `ActivityForm` uses Formik or React Hook Form, validates required fields (`type`, `duration`, `date`), and submits to POST `/activities`.
- `ActivityList` fetches GET `/activities` and displays entries; supports filters via query params.
- `MetricsSummary` computes and displays:
  - Total duration (in minutes)
  - Total calories burned
  - Average duration per day
- React Query is used for caching and invalidation after form submission or deletion.
- Component tests cover:
  - Form validation and submission
  - List rendering and filter interactions
  - Metrics calculations based on mock data

## IDE Testing Criteria
1. Run `npm test` → all React tests for activities pass.
2. Manual in browser:
   - Navigate to `/activities` → list and metrics display existing data.
   - Use filters → list updates correctly.
   - Submit new activity via `ActivityForm` → list and metrics refresh.
3. TypeScript check: `tsc --noEmit` → no errors in component or hook files.

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑steps to build `ActivityForm`, `ActivityList`, `MetricsSummary`, and React Query integration for activities."
2. **ActivityForm Component:**
   "Implement the simplest next step: create `ActivityForm.tsx` with form fields for `type`, `duration`, `date`, and submit handler."  
3. **ActivityList with Filters:**
   "Describe tasks to build `ActivityList.tsx` with GET `/activities` and UI filters; confirm then code the component."
4. **MetricsSummary Implementation:**
   "List sub‑tasks to compute and render total duration, calories, and average per day in `MetricsSummary.tsx`; after approval, generate code."
5. **Component Tests:**
   "Break down writing React Testing Library tests for `ActivityForm`, `ActivityList`, and `MetricsSummary`; show me the plan, then write test files." 