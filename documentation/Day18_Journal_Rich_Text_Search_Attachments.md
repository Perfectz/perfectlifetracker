<!-- Day18_Journal_Rich_Text_Search_Attachments.md -->

## Day 18: Journal Enhancements – Rich Text, Attachments & Search

### Summary of Implementation
- Enhanced the JournalEntry model with Markdown support and attachments
- Implemented Azure Blob Storage for file attachments
- Added Azure Cognitive Search for full-text search of journal entries
- Created new API endpoints for file uploads and text search
- Added appropriate feature flags and tests

### Data Model Changes
- Added `contentFormat` field to specify 'plain' or 'markdown' format
- Added `attachments` array to store file attachments with the following properties:
  - `id`: Unique identifier for the attachment
  - `fileName`: Original file name
  - `contentType`: MIME type (e.g., image/jpeg)
  - `size`: Size in bytes
  - `url`: URL to access the file

### New Services
1. **Blob Storage Service** 
   - `initializeBlobStorage()`: Sets up blob containers for journal attachments
   - `uploadAttachment()`: Uploads files to Azure Blob Storage
   - `deleteAttachment()`: Removes files from storage

2. **Search Service**
   - `initializeSearchService()`: Creates and configures search index
   - `indexJournalEntry()`: Adds journal entries to the search index
   - `deleteJournalEntryFromIndex()`: Removes entries from the index
   - `searchJournalEntries()`: Performs full-text search with filters

### New API Endpoints
- `GET /api/journals/search?q=keyword`: Search journal entries by text
- `POST /api/journals/attachments`: Upload file attachments

### Feature Flags
- Added `ENABLE_SEARCH` in `featureFlags.ts` for Cognitive Search integration
- Configurable via `FEATURE_SEARCH` environment variable

### Testing
- Unit tests for Blob Storage and Search services
- Test mocks for Azure services
- Error handling and graceful degradation when services unavailable

### Usage Examples

#### Creating a Journal Entry with Markdown
```typescript
// Client-side code
const journalEntry = {
  content: "# Today's Thoughts\n\nI had a **great** day today!",
  contentFormat: "markdown",
  date: new Date(),
  tags: ["daily", "reflection"]
};

await api.post("/api/journals", journalEntry);
```

#### Uploading an Attachment
```typescript
// Client-side code
const formData = new FormData();
formData.append("file", imageFile);

const response = await api.post("/api/journals/attachments", formData);
const attachment = response.data;

// Add attachment to journal entry
const journalEntry = {
  content: "Check out this photo from today!",
  attachments: [attachment],
  tags: ["photo", "memory"]
};

await api.post("/api/journals", journalEntry);
```

#### Searching Journal Entries
```typescript
// Client-side code
const searchResults = await api.get("/api/journals/search", {
  params: {
    q: "vacation beach",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    minSentiment: 0.6,
    tags: "vacation,travel"
  }
});
```

### Next Steps
1. Integrate Markdown editor in the frontend
2. Add image previews and galleries for attachments
3. Implement faceted search with sentiment analysis insights
4. Add more advanced filtering options using Cognitive Search capabilities 