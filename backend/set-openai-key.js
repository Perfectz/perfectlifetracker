// set-openai-key.js
// Script to set the OpenAI API key in the .env file directly from command line

const fs = require('fs');
const path = require('path');

// Get API key from command line arguments
const apiKey = process.argv[2];

if (!apiKey || apiKey.trim() === '') {
  console.error('❌ No API key provided. Usage: node set-openai-key.js YOUR_API_KEY');
  process.exit(1);
}

const envFilePath = path.join(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('❌ .env file not found. Running setup-env script first...');
  require('./setup-env');
}

try {
  // Read the current .env file
  let envContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Replace the API key
  envContent = envContent.replace(
    /OPENAI_API_KEY=.*/,
    `OPENAI_API_KEY=${apiKey.trim()}`
  );
  
  // Also make sure FEATURE_OPENAI is enabled
  envContent = envContent.replace(
    /FEATURE_OPENAI=.*/,
    'FEATURE_OPENAI=true'
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(envFilePath, envContent);
  
  console.log('✅ OpenAI API key updated successfully!');
  console.log('✅ OpenAI feature flag enabled.');
} catch (error) {
  console.error('❌ Error updating API key:', error.message);
} 