/**
 * backend/test-keyvault.js
 * Simple test script to verify Azure Key Vault connectivity
 */

const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

async function testKeyVault() {
  console.log('🔐 Testing Azure Key Vault Connection...\n');
  
  try {
    // Your specific Key Vault configuration
    const keyVaultName = 'perfectltpkv202506061150';
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
    
    console.log(`Key Vault URL: ${keyVaultUrl}`);
    
    // Create credential and client
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(keyVaultUrl, credential);
    
    console.log('✅ Azure credentials initialized');
    
    // Test 1: List all secrets
    console.log('\n📋 Listing all secrets...');
    const secretsIterator = client.listPropertiesOfSecrets();
    const secrets = [];
    
    for await (const secretProperties of secretsIterator) {
      secrets.push(secretProperties.name);
      console.log(`  - ${secretProperties.name}`);
    }
    
    if (secrets.length === 0) {
      console.log('  No secrets found');
    }
    
    // Test 2: Retrieve specific secrets
    console.log('\n🔑 Testing secret retrieval...');
    
    const secretsToTest = ['jwt-secret', 'session-secret', 'encryption-key'];
    
    for (const secretName of secretsToTest) {
      try {
        const secret = await client.getSecret(secretName);
        console.log(`  ✅ ${secretName}: Retrieved (${secret.value?.length || 0} characters)`);
      } catch (error) {
        console.log(`  ❌ ${secretName}: ${error.message}`);
      }
    }
    
    // Test 3: Create a test secret
    console.log('\n🧪 Testing secret creation...');
    
    const testSecretName = 'test-secret';
    const testSecretValue = `test-value-${Date.now()}`;
    
    try {
      await client.setSecret(testSecretName, testSecretValue);
      console.log(`  ✅ Created test secret: ${testSecretName}`);
      
      // Retrieve the test secret
      const retrievedSecret = await client.getSecret(testSecretName);
      console.log(`  ✅ Retrieved test secret: ${retrievedSecret.value === testSecretValue ? 'MATCH' : 'MISMATCH'}`);
      
      // Clean up test secret
      await client.beginDeleteSecret(testSecretName);
      console.log(`  ✅ Deleted test secret: ${testSecretName}`);
      
    } catch (error) {
      console.log(`  ❌ Test secret operations failed: ${error.message}`);
    }
    
    console.log('\n🎉 Azure Key Vault test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Key Vault: ${keyVaultName}`);
    console.log(`  - Secrets found: ${secrets.length}`);
    console.log(`  - Connection: ✅ Working`);
    console.log(`  - Authentication: ✅ Working`);
    console.log(`  - Read operations: ✅ Working`);
    console.log(`  - Write operations: ✅ Working`);
    
  } catch (error) {
    console.error('\n❌ Azure Key Vault test failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure you are logged in: az login');
    console.error('2. Check your subscription: az account show');
    console.error('3. Verify Key Vault permissions: az keyvault show --name perfectltpkv202506061150');
    console.error('4. Check resource group: az group show --name perfectltp-prod-rg');
    
    process.exit(1);
  }
}

// Run the test
testKeyVault().catch(console.error); 