// backend/scripts/add-test-journal.js
// Script to add a test journal entry to validate functionality

const { CosmosClient } = require('@azure/cosmos');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

// Connection configuration
const endpoint = process.env.COSMOS_ENDPOINT || 'https://localhost:8081/';
const key = process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='; // Default emulator key
const databaseId = process.env.COSMOS_DATABASE || 'lifetracker';
const containerId = 'journals';

// Create HTTPS agent to ignore certificate errors (only for local development)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Initialize Cosmos client with custom HTTPS agent for local development
const client = new CosmosClient({ 
  endpoint, 
  key,
  connectionPolicy: {
    enableEndpointDiscovery: false
  },
  agent: httpsAgent
});

// Sample journal entry
const testJournalEntry = {
  id: uuidv4(),
  userId: 'test-user-123',
  content: 'This is a test journal entry for testing the journal functionality',
  contentFormat: 'markdown',
  tags: ['test', 'sample', 'journal'],
  mood: 'happy',
  location: 'Home',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
  type: 'journal'
};

async function addTestJournalEntry() {
  try {
    console.log('Connecting to Cosmos DB...');
    const database = client.database(databaseId);
    const container = database.container(containerId);
    
    console.log('Creating test journal entry...');
    const { resource: createdItem } = await container.items.create(testJournalEntry);
    
    console.log(`Successfully created journal entry with id: ${createdItem.id}`);
    console.log(JSON.stringify(createdItem, null, 2));
    
    console.log('Successfully added test journal entry.');
  } catch (error) {
    console.error('Error creating test journal entry:');
    console.error(error);
  }
}

// Run the function
addTestJournalEntry(); 