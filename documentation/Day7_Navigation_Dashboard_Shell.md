# Day 7: Navigation & Dashboard Shell

## Summary of Tasks
- Create `NavBar` component with MUI Drawer (desktop) and BottomNavigation (mobile) for responsive navigation.
- Implement `ThemeContext` and a toggle button, persisting user preference in `localStorage`.
- Add `/dashboard` route and a `DashboardWidget` stub component for future analytics.
- Write a Cypress E2E test covering login → profile → dashboard flow to validate integration.

## User Stories
- As a user, I want consistent navigation on desktop and mobile so I can move between pages easily.
- As a user, I want a theme toggle so I can switch between light and dark modes.
- As a user, I want a dashboard placeholder so I know where analytics will appear.
- As a QA engineer, I want an end-to-end test for the core flow to catch issues early.

## Acceptance Criteria
- `NavBar` uses MUI `Drawer` on `md`+ viewports and `BottomNavigation` on smaller screens.
- `ThemeContext` provides theme state (`light`/`dark`) and a `ThemeToggle` button; preference saved to and loaded from `localStorage`.
- React Router includes a `/dashboard` route rendering `DashboardWidget` with placeholder content.
- Cypress spec under `/cypress/integration/nav.spec.ts` automates:
  1. Login via MSAL flow.
  2. Navigate to `/profile` and assert profile page loaded.
  3. Navigate to `/dashboard` and assert the stub widget is visible.
  4. No uncaught exceptions during test.

## IDE Testing Criteria
1. Unit tests (Jest + React Testing Library):
   - `NavBar` renders correct elements based on viewport breakpoints.
   - `ThemeContext` toggles theme and persists in `localStorage`.
2. Manual:
   - Run `npm start`; in desktop viewport, sidebar appears; in mobile viewport, bottom nav appears.
   - Click theme toggle; reload page; ensure theme persists.
3. End-to-end:
   - Run `npx cypress run`; verify `nav.spec.ts` passes without failures.

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑steps for building responsive `NavBar`, `ThemeContext`, `DashboardWidget`, and Cypress E2E test."
2. **NavBar Implementation:**
   "Implement the simplest next step: create `NavBar.tsx` with MUI Drawer on desktop and BottomNavigation on mobile."
3. **ThemeContext Setup:**
   "Describe tasks to build a `ThemeContext` and toggle button with `localStorage` persistence; after I confirm, generate the code."
4. **Dashboard Stub Route:**
   "List steps to add the `/dashboard` route and `DashboardWidget` stub component; await my approval before coding."
5. **E2E Test Creation:**
   "Break down writing the Cypress spec for the login → profile → dashboard flow; show me the plan, then implement the test file." 