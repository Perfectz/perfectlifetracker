<!-- Day17_Journal_Sentiment_Data_Model_API.md -->

## Day 17: Journal & Sentiment – Enhanced Data Model & API

### Summary of Tasks
- Design Cosmos DB container `journals` with `/userId` partition key
- Define enhanced TS interfaces for `JournalEntry` with rich text and attachment support
- Implement Express CRUD endpoints under `/journals`
- Create Azure Blob Storage integration for file attachments
- Implement Azure Text Analytics for sentiment analysis and key phrase extraction
- Add Azure Cognitive Search for full-text search capabilities
- Build advanced insights engine for sentiment trends and pattern recognition
- Write comprehensive unit tests for all services

### Data Model
- **JournalEntry**
  - id, userId, content
  - contentFormat: 'plain' | 'markdown'
  - date, sentimentScore
  - attachments: Array of file references
  - createdAt, updatedAt
  - tags: Array of categorization strings
- **Attachment**
  - id, fileName, contentType
  - size, url

### Services
1. **Journal Service**
   - Basic CRUD operations with sentiment analysis
   - Filtering by date, sentiment, and tags
   - Integration with search and blob storage

2. **Blob Storage Service**
   - File upload and management for attachments
   - Secure URL generation with user-specific paths

3. **Text Analytics Service**
   - Sentiment analysis for emotional context
   - Key phrase extraction for topic identification

4. **Search Service**
   - Full-text search across journal content
   - Faceted filtering with multiple criteria

5. **Journal Insights Service**
   - Sentiment trend analysis over time
   - Topic identification and correlation
   - Personalized recommendations based on patterns

### API Endpoints
- **Core Journal Operations**
  - POST `/journals` → Create entry with sentiment analysis
  - GET `/journals` → List entries with filtering
  - GET `/journals/:id` → Retrieve specific entry
  - PUT `/journals/:id` → Update entry
  - DELETE `/journals/:id` → Remove entry

- **Enhanced Functionality**
  - POST `/journals/attachments` → Upload file attachments
  - GET `/journals/search` → Full-text search with filters
  - GET `/journals/insights/sentiment-trends` → Analyze mood patterns
  - GET `/journals/insights/topic-analysis` → Identify important topics
  - GET `/journals/insights/mood-recommendations` → Get personalized insights

### Feature Flags
- `ENABLE_TEXT_ANALYTICS` → Controls sentiment analysis
- `ENABLE_SEARCH` → Controls full-text search
- `ENABLE_ADVANCED_INSIGHTS` → Controls advanced analytics

### Testing Strategy
- Unit tests with mocked dependencies for all services
- Router tests with supertest for API validation
- Graceful degradation tests for when services are unavailable

### Implementation Details
- Date handling with proper ISO string conversion
- Robust error handling with appropriate status codes
- Mock implementations for local development without Azure services
- Feature flags for controlled rollout of capabilities

### IDE Testing Criteria
1. Run `npm test` → all journal endpoint tests pass
2. Manual API calls:
   - POST entry → sentimentScore present
   - GET/PUT/DELETE behave as expected
   - Search and insights endpoints return appropriate data
3. `tsc --noEmit` → no errors

### Vibe‑Coding Prompts
1. "Tell me your plan first; don't code. Outline steps to set up `journals` container, define `JournalEntry` interface, CRUD routes, and sentiment integration."
2. "Describe micro‑tasks to integrate Azure Text Analytics in POST `/journals`; after confirmation, generate controller code."
3. "Break down GET, PUT, DELETE `/journals` endpoints; plan then implement."
4. "List subtasks to write unit tests mocking Text Analytics client; confirm then code tests."
5. "Outline steps to define the `JournalEntry` interface and configure Cosmos client; then write code snippets." 