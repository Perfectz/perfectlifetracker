/**
 * backend/scripts/create-env.js
 * Creates a .env file with development environment variables if it doesn't exist
 */
const fs = require('fs-extra');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envTemplatePath = path.join(rootDir, '.env.template');

// Default environment variables
const defaultEnvVars = `# Backend development environment variables
NODE_ENV=development
PORT=3001
USE_MOCK_DATABASE=true

# Cosmos DB Configuration
COSMOS_DB_ENDPOINT=https://localhost:8081
COSMOS_DB_KEY=dummy-key-for-development
COSMOS_DB_DATABASE=lifetracker

# MongoDB Configuration (alternative to Cosmos DB)
MONGODB_URI=mongodb://localhost:27017/perfectltp

# Azure Authentication
AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965
AZURE_AUTHORITY=https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d
FRONTEND_URL=http://localhost:3000

# Azure Storage (for file uploads)
# Note: For development, you'll need to set up an Azure Storage account or use Azurite emulator
# AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=yourstorageaccount;AccountKey=yourkey;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true
AZURE_STORAGE_CONTAINER_NAME=perfectltp-uploads

# Azure OpenAI Service (optional for AI features)
# AZURE_OPENAI_API_KEY=your-azure-openai-key
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# OPENAI_API_KEY=your-openai-key
`;

async function createEnvFile() {
  try {
    // Check if .env file already exists
    const envExists = await fs.pathExists(envPath);
    
    if (!envExists) {
      console.log('No .env file found, creating one with default values...');
      
      // Check if .env.template exists and use it if available
      const templateExists = await fs.pathExists(envTemplatePath);
      
      if (templateExists) {
        console.log('Using .env.template as source...');
        await fs.copy(envTemplatePath, envPath);
      } else {
        // Use default environment variables
        console.log('Using default environment variables...');
        await fs.writeFile(envPath, defaultEnvVars, 'utf8');
      }
      
      console.log('.env file created successfully!');
    } else {
      console.log('.env file already exists, skipping creation.');
    }
  } catch (error) {
    console.error('Error creating .env file:', error);
    process.exit(1);
  }
}

// Create the .env file
createEnvFile(); 