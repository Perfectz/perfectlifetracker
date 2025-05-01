<!-- Day17_Journal_Sentiment_Data_Model_API.md -->

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