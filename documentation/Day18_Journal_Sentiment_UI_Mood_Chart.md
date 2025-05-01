<!-- Day18_Journal_Sentiment_UI_Mood_Chart.md -->

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