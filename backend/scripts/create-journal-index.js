// backend/scripts/create-journal-index.js
// Script to create composite index for journals container

const { CosmosClient } = require('@azure/cosmos');
const https = require('https');

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

async function createCompositeIndex() {
  try {
    // Get container reference
    const database = client.database(databaseId);
    const container = database.container(containerId);
    
    // Get current container definition
    const { resource: containerDef } = await container.read();
    console.log(`Current container definition: ${JSON.stringify(containerDef, null, 2)}`);

    // Create index policy with composite index
    const indexPolicy = {
      indexingMode: "consistent",
      automatic: true,
      includedPaths: [
        {
          path: "/*"
        }
      ],
      excludedPaths: [
        {
          path: "/\"_etag\"/?"
        }
      ],
      compositeIndexes: [
        [
          {
            path: "/date",
            order: "descending"
          },
          {
            path: "/id",
            order: "descending"
          }
        ]
      ]
    };

    // Update container with new index policy
    console.log('Updating container with composite index...');
    const { resource: updatedContainer } = await container.replace({
      id: containerDef.id,
      partitionKey: containerDef.partitionKey,
      indexingPolicy: indexPolicy
    });

    console.log('Container updated successfully');
    console.log(`New index policy: ${JSON.stringify(updatedContainer.indexingPolicy, null, 2)}`);
    
    return updatedContainer;
  } catch (error) {
    console.error('Error creating composite index:', error);
    throw error;
  }
}

// Execute the function
createCompositeIndex()
  .then(() => console.log('Index creation complete'))
  .catch(err => {
    console.error('Failed to create index:', err);
    process.exit(1);
  }); 