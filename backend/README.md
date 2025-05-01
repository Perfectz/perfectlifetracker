# LifeTracker Pro Backend

Express TypeScript backend for LifeTracker Pro application.

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   # General settings
   NODE_ENV=development
   PORT=4000
   
   # OpenAI API settings
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-4-mini
   OPENAI_API_URL=https://api.openai.com/v1
   
   # Feature flags
   FEATURE_OPENAI=true
   FEATURE_ANALYTICS=true
   
   # Development settings
   COSMOS_INSECURE_DEV=true
   MOCK_DATA_ON_FAILURE=true
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Adding Your OpenAI API Key

To enable the AI-powered fitness summary feature, you need to:

1. Get an API key from OpenAI: https://platform.openai.com/api-keys
2. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Set the feature flag to enable the OpenAI integration:
   ```
   FEATURE_OPENAI=true
   ```

**IMPORTANT: Never commit your API key to version control. The `.env` file is included in `.gitignore` for your protection.**

## Available Scripts

- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the project for production
- `npm start`: Run the production build
- `npm test`: Run tests
- `npm run lint`: Lint the codebase
- `npm run lint:fix`: Fix linting issues automatically

## API Endpoints

### Fitness Analytics API

- `GET /api/analytics/fitness`: Get fitness statistics for a date range
  - Query params: `startDate`, `endDate` (ISO dates)
  - Returns: Total duration, calories, averages, and activity breakdowns

- `GET /api/analytics/weekly-trends`: Compare current week vs previous week
  - Returns: Current and previous week metrics with percentage changes

### OpenAI API

- `POST /api/openai/fitness-summary`: Generate AI-powered fitness summary
  - Body params: `startDate`, `endDate` (ISO dates)
  - Returns: `{ summary: string }` containing AI-generated fitness advice

## Feature Flags

The application uses feature flags to control certain functionality:

- `FEATURE_OPENAI`: Enables/disables the OpenAI integration
- `FEATURE_ANALYTICS`: Enables/disables the analytics endpoints

You can control these features via:
1. Environment variables: `FEATURE_OPENAI=true|false`
2. Updating the `featureFlags.ts` file 