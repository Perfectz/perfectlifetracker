# Day 12: Analytics & AI Insights – API

## Summary of Tasks
- Implement analytics calculations endpoint in Express: computes weekly trends (e.g., total duration, average calories).
- Integrate Azure OpenAI Service to generate a textual weekly fitness summary: calls OpenAI API with activity data.
- Add Swagger/OpenAPI definitions for the new endpoints.
- Write unit tests and mock OpenAI responses.

## User Stories
- As a user, I want an `/analytics/fitness` endpoint so I can retrieve my weekly workout statistics.
- As a user, I want AI-generated summaries of my fitness trends so I can get insights without manual analysis.
- As a developer, I want clear API documentation so frontend can integrate easily.
- As a QA engineer, I want tests covering both analytics logic and OpenAI integration.

## Acceptance Criteria
- Express GET `/analytics/fitness?startDate=&endDate=` returns JSON:
  - `totalDuration`
  - `totalCalories`
  - `averageDurationPerDay`
  - `averageCaloriesPerDay`
- Express POST `/openai/fitness-summary` accepts date range, returns `{ summary: string }` from Azure OpenAI.
- Swagger/OpenAPI docs updated under `/docs` for both endpoints.
- Jest tests cover:
  - Analytics calculations with mock activity data.
  - OpenAI integration using mocked Azure OpenAI client.

## IDE Testing Criteria
1. Run `npm test` in `/backend`:
   - Analytics logic tests pass.
   - OpenAI mock tests pass.
2. Manual API testing:
   - `curl http://localhost:3001/analytics/fitness?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` → returns expected JSON.
   - `curl -X POST http://localhost:3001/openai/fitness-summary -d '{"startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD"}'` → returns a summary string.
3. Swagger UI (`/docs`) shows accurate schema and examples.

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑steps to implement analytics calculations, OpenAI summary endpoint, and update Swagger definitions."
2. **Analytics Endpoint:**
   "Describe tasks to write GET `/analytics/fitness` handler calculating duration and calories trends; after I confirm, generate the code."
3. **OpenAI Integration:**
   "List micro‑steps to integrate Azure OpenAI Service for POST `/openai/fitness-summary`; plan then implement the controller."
4. **Swagger Documentation:**
   "Break down adding OpenAPI specs for both endpoints in `swagger.json`; show plan, then write the definitions."
5. **Tests:**
   "Outline steps to mock activity data and OpenAI client for Jest tests; confirm then create test suites." 