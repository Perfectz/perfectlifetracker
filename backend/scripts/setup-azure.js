/**
 * backend/scripts/setup-azure.js
 * Interactive Azure setup script for Perfect LifeTracker Pro
 */
const readline = require('readline');
const fs = require('fs-extra');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Your specific Azure configuration
const AZURE_CONFIG = {
  subscriptionId: '51b2af70-f5ce-453b-a9cc-be9240defcbf',
  tenantId: '78e9993f-a208-4c38-9d9d-6b15f0d2407d',
  resourceGroup: 'perfectltp-prod-rg',
  keyVaultName: 'perfectltpkv202506061150',
  location: 'eastus2'
};

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAzureServices() {
  console.log('🚀 Perfect LifeTracker Pro - Azure Setup');
  console.log('=========================================\n');
  
  console.log('✅ Your Azure Configuration:');
  console.log(`   Subscription: ${AZURE_CONFIG.subscriptionId}`);
  console.log(`   Tenant ID: ${AZURE_CONFIG.tenantId}`);
  console.log(`   Resource Group: ${AZURE_CONFIG.resourceGroup}`);
  console.log(`   Key Vault: ${AZURE_CONFIG.keyVaultName}`);
  console.log(`   Location: ${AZURE_CONFIG.location}\n`);

  // Check if user wants to continue with existing setup
  const continueSetup = await question('Continue with Azure service setup? (y/n): ');
  if (continueSetup.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Create Cosmos DB (if not already created)');
  console.log('2. Create Azure OpenAI Service');
  console.log('3. Create Storage Account');
  console.log('4. Update Key Vault secrets\n');

  // Cosmos DB Setup
  const setupCosmos = await question('Create Cosmos DB? (y/n): ');
  if (setupCosmos.toLowerCase() === 'y') {
    console.log('\n🗄️  Creating Cosmos DB...');
    console.log('Run this command:');
    console.log(`az cosmosdb create --name "perfectltp-cosmos-$(date +%Y%m%d%H%M)" --resource-group ${AZURE_CONFIG.resourceGroup} --kind GlobalDocumentDB --locations regionName=${AZURE_CONFIG.location} --default-consistency-level Session`);
    
    const cosmosEndpoint = await question('Enter Cosmos DB endpoint (e.g., https://your-cosmos.documents.azure.com:443/): ');
    const cosmosKey = await question('Enter Cosmos DB primary key: ');
    
    if (cosmosEndpoint && cosmosKey) {
      console.log('Adding Cosmos DB secrets to Key Vault...');
      console.log(`az keyvault secret set --vault-name "${AZURE_CONFIG.keyVaultName}" --name "cosmos-db-endpoint" --value "${cosmosEndpoint}"`);
      console.log(`az keyvault secret set --vault-name "${AZURE_CONFIG.keyVaultName}" --name "cosmos-db-key" --value "${cosmosKey}"`);
    }
  }

  // Azure OpenAI Setup
  const setupOpenAI = await question('\nCreate Azure OpenAI Service? (y/n): ');
  if (setupOpenAI.toLowerCase() === 'y') {
    console.log('\n🤖 Creating Azure OpenAI Service...');
    console.log('Run this command:');
    console.log(`az cognitiveservices account create --name "perfectltp-openai-$(date +%Y%m%d%H%M)" --resource-group ${AZURE_CONFIG.resourceGroup} --kind OpenAI --sku S0 --location ${AZURE_CONFIG.location} --custom-domain "perfectltp-openai-$(date +%Y%m%d%H%M)"`);
    
    const openaiEndpoint = await question('Enter Azure OpenAI endpoint (e.g., https://your-openai.openai.azure.com/): ');
    const openaiKey = await question('Enter Azure OpenAI API key: ');
    
    if (openaiEndpoint && openaiKey) {
      console.log('Adding OpenAI secrets to Key Vault...');
      console.log(`az keyvault secret set --vault-name "${AZURE_CONFIG.keyVaultName}" --name "azure-openai-endpoint" --value "${openaiEndpoint}"`);
      console.log(`az keyvault secret set --vault-name "${AZURE_CONFIG.keyVaultName}" --name "azure-openai-key" --value "${openaiKey}"`);
    }
  }

  // Storage Account Setup
  const setupStorage = await question('\nCreate Storage Account? (y/n): ');
  if (setupStorage.toLowerCase() === 'y') {
    console.log('\n💾 Creating Storage Account...');
    console.log('Run this command:');
    console.log(`az storage account create --name "perfectltpstorage$(date +%Y%m%d%H%M)" --resource-group ${AZURE_CONFIG.resourceGroup} --location ${AZURE_CONFIG.location} --sku Standard_LRS`);
    
    const storageConnection = await question('Enter Storage Account connection string: ');
    
    if (storageConnection) {
      console.log('Adding Storage connection to Key Vault...');
      console.log(`az keyvault secret set --vault-name "${AZURE_CONFIG.keyVaultName}" --name "azure-storage-connection" --value "${storageConnection}"`);
    }
  }

  console.log('\n✅ Azure Setup Complete!');
  console.log('\n📝 Summary of created secrets in Key Vault:');
  console.log('   - jwt-secret (✅ already created)');
  console.log('   - session-secret (✅ already created)');
  console.log('   - encryption-key (✅ already created)');
  console.log('   - cosmos-db-endpoint (create if needed)');
  console.log('   - cosmos-db-key (create if needed)');
  console.log('   - azure-openai-endpoint (create if needed)');
  console.log('   - azure-openai-key (create if needed)');
  console.log('   - azure-storage-connection (create if needed)');

  console.log('\n🔧 To test your setup, run:');
  console.log('   cd .. && npm run dev');

  rl.close();
}

// Run the setup
setupAzureServices().catch(console.error); 