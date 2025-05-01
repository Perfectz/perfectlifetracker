// setup-env.js
// Script to create a .env file with OpenAI API configuration

const fs = require('fs');
const path = require('path');

const envContent = `# Environment variables for LifeTracker Pro Backend

# General settings
NODE_ENV=development
PORT=4000

# OpenAI API settings
# Replace with your actual OpenAI API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4-mini
OPENAI_API_URL=https://api.openai.com/v1

# Feature flags
FEATURE_OPENAI=true
FEATURE_ANALYTICS=true

# Development settings for Cosmos DB and other services
COSMOS_INSECURE_DEV=true
MOCK_DATA_ON_FAILURE=true

# Keep existing settings below if they exist in your environment
`;

const envFilePath = path.join(__dirname, '.env');

try {
  // Write the .env file
  fs.writeFileSync(envFilePath, envContent);
  console.log(`✅ .env file created successfully at ${envFilePath}`);
  console.log('⚠️ Please edit the file to add your actual OpenAI API key');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 