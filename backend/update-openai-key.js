// update-openai-key.js
// Script to update the OpenAI API key in the .env file

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envFilePath = path.join(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('❌ .env file not found. Please run "npm run setup-env" first.');
  process.exit(1);
}

// Ask for API key
rl.question('Enter your OpenAI API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_api_key_here') {
    console.error('❌ Invalid API key provided.');
    rl.close();
    process.exit(1);
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
  } finally {
    rl.close();
  }
}); 