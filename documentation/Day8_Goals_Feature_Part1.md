# Day 8: Goals Feature – Data Model & API

## Summary of Tasks
- Design Cosmos DB container for `FitnessGoal` with partition key `/userId`: organizes data per user.
- Define TypeScript interface for `FitnessGoal`: ensures type safety.
- Implement Express CRUD endpoints under `/goals`: create, read (all & by ID), update, delete.
- Write unit tests for each endpoint using Jest & Supertest.

## User Stories
- As a user, I want to create a fitness goal so I can track my objectives.
- As a user, I want to list all my goals so I can review progress.
- As a user, I want to update or delete a goal so I can manage my plans.
- As a developer, I want a strongly typed `FitnessGoal` model to prevent runtime errors.

## Acceptance Criteria
- Cosmos container named `goals` exists with `/userId` as the partition key.
- TS interface `FitnessGoal` includes fields: `id`, `userId`, `title`, `targetDate`, `createdAt`, and optional `notes`.
- Express routes implemented:
  - POST `/goals` → 201 with new goal payload.
  - GET `/goals` → 200 with array of goals for `req.userId`.
  - GET `/goals/:id` → 200 with single goal or 404 if not found.
  - PUT `/goals/:id` → 200 with updated goal or 404.
  - DELETE `/goals/:id` → 204 on success or 404.
- Unit tests cover all endpoints, asserting correct status codes and response bodies.

## IDE Testing Criteria
1. Run backend unit tests:
   ```bash
   cd backend
   npm test
   ```
   - All goal endpoint tests pass.
   
2. Manual API testing (using REST client in IDE):
   ```http
   ### Create a new goal
   POST http://localhost:3001/api/goals
   Content-Type: application/json
   Authorization: Bearer {{token}}
   
   {
     "title": "Run 5K",
     "targetDate": "2023-12-31T00:00:00.000Z",
     "notes": "Train 3 times per week"
   }
   
   ### Get all goals
   GET http://localhost:3001/api/goals
   Authorization: Bearer {{token}}
   ```
   - Verify response payloads match expected schemas.
   
3. Verify TypeScript compilation:
   ```bash
   cd backend
   npx tsc --noEmit
   ```
   - No errors in model or controller files.

## Implementation Plan

### 1. Data Model & Storage Setup

1. Define the `FitnessGoal` TypeScript interface:
   ```typescript
   interface FitnessGoal {
     id: string;               // Unique identifier
     userId: string;           // Owner of the goal (for partitioning)
     title: string;            // Goal title/description
     targetDate: Date;         // Target completion date
     createdAt: Date;          // Creation timestamp
     updatedAt: Date;          // Last update timestamp
     notes?: string;           // Optional notes/details
     achieved: boolean;        // Whether goal is complete
     progress: number;         // Progress percentage (0-100)
   }
   ```

2. Create DTOs for create and update operations:
   ```typescript
   interface CreateFitnessGoalDto {
     title: string;
     targetDate: Date | string;
     notes?: string;
   }
   
   interface UpdateFitnessGoalDto {
     title?: string;
     targetDate?: Date | string;
     notes?: string;
     achieved?: boolean;
     progress?: number;
   }
   ```

3. Configure Cosmos DB container for goals storage with appropriate indexing policy.

### 2. API Endpoints Implementation

1. Create goals controller with the following methods:
   - `createGoal`: Handle POST requests to create new goals
   - `getGoals`: Handle GET requests to retrieve all goals for the user
   - `getGoalById`: Handle GET requests to retrieve a specific goal
   - `updateGoal`: Handle PUT requests to update an existing goal
   - `deleteGoal`: Handle DELETE requests to remove a goal

2. Implement middleware for:
   - Validating request bodies using a validation library
   - Extracting user ID from JWT token
   - Error handling for database operations

3. Register routes in the main Express application.

### 3. Unit Testing

1. Create test fixtures with sample goal data.
2. Write tests for each endpoint:
   - Test successful operations with valid data
   - Test error cases (invalid input, not found, etc.)
   - Test authentication requirements

## Vibe‑Coding Prompts
1. **Planning Prompt:**
   "Tell me your plan first; don't code. Outline micro‑steps to design the `FitnessGoal` Cosmos container, define TS interface, and implement CRUD endpoints."
2. **Model & Interface:**
   "Describe tasks to configure the Cosmos client and define the `FitnessGoal` interface; after confirmation, generate the code."
3. **Create & List Endpoints:**
   "Break down creating POST `/goals` and GET `/goals` handlers; plan first, then implement with proper status codes."
4. **Get, Update, Delete Endpoints:**
   "List sub‑tasks to add GET `/goals/:id`, PUT, and DELETE handlers; after planning, write the code."
5. **Unit Tests:**
   "Outline steps to write Jest & Supertest tests for each CRUD endpoint; confirm before generating test suites."

## Current Status

### Tasks to Complete

1. **Data Model and TypeScript Interfaces**:
   - [x] Define `FitnessGoal` interface with all required fields
   - [x] Create DTOs for create and update operations
   - [x] Set up validation schemas for request bodies

2. **Cosmos DB Configuration**:
   - [x] Configure Cosmos DB container for goals with `/userId` partition key
   - [x] Set up appropriate indexing policy for queries
   - [x] Add database initialization to application startup

3. **API Implementation**:
   - [x] Implement POST `/goals` endpoint for creating goals
   - [x] Implement GET `/goals` endpoint for listing user's goals
   - [x] Implement GET `/goals/:id` endpoint for retrieving a specific goal
   - [x] Implement PUT `/goals/:id` endpoint for updating goals
   - [x] Implement DELETE `/goals/:id` endpoint for removing goals

4. **Testing**:
   - [x] Create test fixtures with sample goal data
   - [x] Write unit tests for all endpoints
   - [x] Verify error handling and edge cases
   - [x] Create manual testing script for API validation

### Optimizations Added

1. **Data Model Improvements**:
   - Made `updatedAt` a required field in the `FitnessGoal` interface
   - Converted type aliases to explicit interface definitions for better documentation
   - Initialized `updatedAt` automatically when creating a new goal

2. **Performance Enhancements**:
   - Added explicit indexing for `createdAt` field to optimize sorting operations
   - Made RU throughput configurable via environment variable (`COSMOS_GOALS_RU`)

3. **Code Quality Improvements**:
   - Extracted common userId extraction logic into middleware
   - Leveraged Express validator's `.toInt()` for automatic query parameter conversion
   - Improved type safety throughout API endpoints

### Integration Considerations

1. **Frontend Integration**:
   - Consider how frontend will integrate with these APIs in Day 9
   - Plan for proper error handling and loading states in UI
   - Design data refresh strategies after mutations

2. **Authentication**:
   - Ensure JWT validation is properly applied to all goal endpoints
   - Extract user ID consistently from auth token

3. **Performance**:
   - Consider pagination for GET `/goals` if users may have many goals
   - Add appropriate indexes for common query patterns

## Next Steps After Completion

1. Implement frontend components for goals management (Day 9)
2. Add charts and visualizations for goal progress
3. Consider implementing notifications for approaching target dates
4. Add batch operations for managing multiple goals 