/**
 * backend/src/simple-server.js
 * Simple JavaScript server to test Key Vault integration
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    keyVaultEnabled: process.env.USE_KEY_VAULT === 'true',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Key Vault test endpoint
app.get('/api/test/keyvault', async (req, res) => {
  try {
    const { SecretClient } = require('@azure/keyvault-secrets');
    const { DefaultAzureCredential } = require('@azure/identity');
    
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(
      process.env.AZURE_KEY_VAULT_URL || 'https://perfectltpkv202506061150.vault.azure.net/',
      credential
    );
    
    // Test retrieving a secret
    const secret = await client.getSecret('jwt-secret');
    
    res.json({
      success: true,
      message: 'Key Vault connection successful',
      keyVaultUrl: process.env.AZURE_KEY_VAULT_URL,
      secretExists: !!secret.value,
      secretLength: secret.value?.length || 0,
      keyVaultEnabled: process.env.USE_KEY_VAULT === 'true'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      keyVaultUrl: process.env.AZURE_KEY_VAULT_URL,
      keyVaultEnabled: process.env.USE_KEY_VAULT === 'true'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple server running on port ${port}`);
  console.log(`📊 Key Vault enabled: ${process.env.USE_KEY_VAULT === 'true'}`);
  console.log(`🔗 Key Vault URL: ${process.env.AZURE_KEY_VAULT_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Test endpoints:`);
  console.log(`   - Health: http://localhost:${port}/api/health`);
  console.log(`   - Key Vault: http://localhost:${port}/api/test/keyvault`);
}); 