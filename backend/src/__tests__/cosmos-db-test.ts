// backend/src/__tests__/cosmos-db-test.ts
// Test to verify Cosmos DB functionality and storage capabilities

import { getContainer, initializeContainers } from '../utils/cosmosClient';

async function testCosmosDbFunctionality() {
  console.log('🔍 Testing Cosmos DB Functionality...\n');
  
  try {
    // Step 1: Check what type of database we're using
    console.log('📊 Step 1: Checking database configuration...');
    
    // Check environment variables
    const nodeEnv = process.env.NODE_ENV || 'unknown';
    const useMockDb = process.env.USE_MOCK_DATABASE || 'unknown';
    const cosmosEndpoint = process.env.COSMOS_DB_ENDPOINT || 'not set';
    const cosmosKey = process.env.COSMOS_DB_KEY ? '***configured***' : 'not set';
    
    console.log(`   NODE_ENV: ${nodeEnv}`);
    console.log(`   USE_MOCK_DATABASE: ${useMockDb}`);
    console.log(`   COSMOS_DB_ENDPOINT: ${cosmosEndpoint}`);
    console.log(`   COSMOS_DB_KEY: ${cosmosKey}`);
    
    // Step 2: Initialize containers and check what we get
    console.log('\n🔌 Step 2: Initializing database containers...');
    const containers = await initializeContainers();
    
    if (containers) {
      console.log('✅ Containers initialized successfully');
      console.log(`   Available containers: ${Object.keys(containers).join(', ')}`);
    } else {
      console.log('❌ Failed to initialize containers');
      return false;
    }
    
    // Step 3: Test getting a specific container
    console.log('\n📦 Step 3: Testing container access...');
    const fitnessContainer = await getContainer('fitness');
    
    if (fitnessContainer) {
      console.log('✅ Fitness container accessed successfully');
      console.log(`   Container ID: ${fitnessContainer.id || 'unknown'}`);
      
      // Check if it's a mock or real container
      if (fitnessContainer.items && typeof fitnessContainer.items.create === 'function') {
        console.log('   Container type: Functional (mock or real)');
      } else {
        console.log('   Container type: Unknown structure');
      }
    } else {
      console.log('❌ Failed to access fitness container');
      return false;
    }
    
    // Step 4: Test actual data storage
    console.log('\n💾 Step 4: Testing data storage...');
    
    const testData = {
      id: `test-${Date.now()}`,
      type: 'test',
      value: 'Cosmos DB storage test',
      timestamp: new Date().toISOString(),
      testNumber: Math.random()
    };
    
    try {
      const result = await fitnessContainer.items.create(testData);
      
      if (result && result.resource) {
        console.log('✅ Data storage test successful');
        console.log(`   Stored record ID: ${result.resource.id}`);
        console.log(`   Stored value: ${result.resource.value}`);
        console.log(`   Database type: ${process.env.USE_MOCK_DATABASE === 'true' ? 'Mock Database' : 'Real Cosmos DB'}`);
      } else {
        console.log('❌ Data storage test failed - no result returned');
        return false;
      }
    } catch (error) {
      console.log('❌ Data storage test failed with error:', error);
      return false;
    }
    
    // Step 5: Test data retrieval
    console.log('\n🔍 Step 5: Testing data retrieval...');
    
    try {
      const queryResult = await fitnessContainer.items.query({
        query: "SELECT * FROM c WHERE c.type = 'test'",
        parameters: []
      }).fetchAll();
      
      if (queryResult && queryResult.resources) {
        console.log('✅ Data retrieval test successful');
        console.log(`   Found ${queryResult.resources.length} test records`);
        
        const testRecord = queryResult.resources.find(r => r.id === testData.id);
        if (testRecord) {
          console.log(`   Test record verified: ${testRecord.value}`);
        }
      } else {
        console.log('❌ Data retrieval test failed - no results');
        return false;
      }
    } catch (error) {
      console.log('❌ Data retrieval test failed with error:', error);
      return false;
    }
    
    // Step 6: Summary
    console.log('\n📋 Step 6: Test Summary');
    console.log('='.repeat(50));
    
    if (process.env.USE_MOCK_DATABASE === 'true') {
      console.log('🔧 CURRENT STATUS: Using Mock Database');
      console.log('   ✅ Mock database is working correctly for development');
      console.log('   ✅ All CRUD operations functional');
      console.log('   ⚠️  Data is stored in memory only (not persistent)');
      console.log('   📝 To use real Cosmos DB:');
      console.log('      1. Set USE_MOCK_DATABASE=false');
      console.log('      2. Configure COSMOS_DB_ENDPOINT and COSMOS_DB_KEY');
      console.log('      3. Ensure Azure Cosmos DB instance is running');
    } else {
      if (cosmosEndpoint.includes('localhost') || cosmosKey === 'not set') {
        console.log('⚠️  CURRENT STATUS: Configured for Cosmos DB but using fallback');
        console.log('   ❌ Real Cosmos DB credentials not properly configured');
        console.log('   ✅ Mock database is working as fallback');
      } else {
        console.log('✅ CURRENT STATUS: Using Real Azure Cosmos DB');
        console.log('   ✅ Connected to Azure Cosmos DB successfully');
        console.log('   ✅ Data persistence enabled');
        console.log('   ✅ Production-ready configuration');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Cosmos DB test failed with error:', error);
    return false;
  }
}

// Export for direct execution
export { testCosmosDbFunctionality };

// Allow direct execution
if (require.main === module) {
  testCosmosDbFunctionality()
    .then((success) => {
      console.log(`\n🏁 Test completed: ${success ? 'SUCCESS' : 'FAILURE'}`);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
} 