# Day 9: Goals Feature – Frontend & Charts

## Summary of Tasks
- Build `GoalsList`, `GoalCreateEdit`, and `GoalDetail` React components.
- Integrate React Query and Axios for data fetching from `/goals` API.
- Add a Recharts progress chart on the detail page to visualize goal progress.
- Write React Testing Library tests for components and chart rendering.

## User Stories
- As a user, I want to view a list of my fitness goals so I can track them at a glance.
- As a user, I want to create and edit goals through a validated form so my data is accurate.
- As a user, I want to see detailed information and progress charts for each goal.
- As a developer, I want typed React components and API hooks to minimize runtime errors.

## Acceptance Criteria
- `GoalsList` fetches GET `/goals` and displays each goal's `title` and `targetDate`.
- `GoalCreateEdit` presents a form (using Formik or React Hook Form) to POST or PUT `/goals` with validation (required fields, date).  
- `GoalDetail` fetches GET `/goals/:id`, displays all fields, and renders a Recharts line or area chart showing progress mock data.
- React Query is configured for caching and invalidation after create/update/delete.
- Component tests cover rendering, user interactions, and chart data presence.

## IDE Testing Criteria
1. Run `npm test` → all React tests pass.
2. Manually in browser:
   - Navigate to `/goals` → list displays existing goals.
   - Click "New Goal" → `/goals/new` → form validation triggers.
   - Submit form → new goal appears in list.
   - Click a goal → `/goals/:id` → detail and chart visible.

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑steps to build the `GoalsList`, `GoalCreateEdit`, and `GoalDetail` components with chart integration."  
2. **GoalsList Component:**
   "Implement the simplest next step: create `GoalsList.tsx` that fetches `/goals` and renders a list."  
3. **Create/Edit Form:**
   "Break down tasks to add `GoalCreateEdit.tsx` with Formik (or React Hook Form) and validation; confirm then code."  
4. **Detail & Recharts:**
   "Describe steps to fetch goal by ID and render a Recharts chart in `GoalDetail.tsx`; after approval, generate code."  
5. **Component Tests:**
   "List sub‑tasks to write React Testing Library tests for these components; plan first, then write test files." 