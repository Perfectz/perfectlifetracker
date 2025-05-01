<!-- Day20_Skills_Learning_UI_Progress_Dashboard.md -->

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