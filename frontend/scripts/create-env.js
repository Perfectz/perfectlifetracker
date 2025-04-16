/**
 * frontend/scripts/create-env.js
 * Creates a .env file with development environment variables if it doesn't exist
 */
const fs = require('fs-extra');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envTemplatePath = path.join(rootDir, '.env.template');

// Default environment variables
const defaultEnvVars = `# Frontend development environment variables
VITE_REACT_APP_AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965
VITE_REACT_APP_AZURE_AUTHORITY=https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d
VITE_REACT_APP_AZURE_REDIRECT_URI=http://localhost:3000
VITE_API_URL=http://localhost:3001
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