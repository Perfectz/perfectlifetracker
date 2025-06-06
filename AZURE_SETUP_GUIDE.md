# Azure Setup Guide for Perfect LifeTracker Pro

## 🎯 **Your Azure Configuration**

**Subscription Details:**
- **Subscription ID:** `51b2af70-f5ce-453b-a9cc-be9240defcbf`
- **Subscription Name:** Personal AI POC Subscription
- **Tenant ID:** `78e9993f-a208-4c38-9d9d-6b15f0d2407d`
- **Directory:** Default Directory (pzgambogmail.onmicrosoft.com)

**Created Resources:**
- **Resource Group:** `perfectltp-prod-rg` (East US 2)
- **Key Vault:** `perfectltpkv202506061150`
- **Key Vault URL:** `https://perfectltpkv202506061150.vault.azure.net/`

## ✅ **Completed Setup Steps**

### 1. Azure CLI Authentication ✅
```bash
az login
az account set --subscription "51b2af70-f5ce-453b-a9cc-be9240defcbf"
```

### 2. Resource Group Creation ✅
```bash
az group create --name perfectltp-prod-rg --location eastus2
```

### 3. Key Vault Creation ✅
```bash
az keyvault create --name "perfectltpkv202506061150" --resource-group perfectltp-prod-rg --location eastus2 --sku standard --enabled-for-template-deployment true
```

### 4. Key Vault Permissions ✅
```bash
az role assignment create --role "Key Vault Administrator" --assignee "8c5e9081-6b67-4937-93ef-e60c9455e4e7" --scope "/subscriptions/51b2af70-f5ce-453b-a9cc-be9240defcbf/resourceGroups/perfectltp-prod-rg/providers/Microsoft.KeyVault/vaults/perfectltpkv202506061150"
```

### 5. Essential Secrets Created ✅
- **jwt-secret** - Secure JWT token signing key
- **session-secret** - Session encryption key
- **encryption-key** - Data encryption key

## 🚀 **Next Steps: Complete Azure Services Setup**

### Step 1: Create Cosmos DB
```bash
# Register the DocumentDB provider (if not already done)
az provider register --namespace Microsoft.DocumentDB

# Create Cosmos DB account
az cosmosdb create \
  --name "perfectltp-cosmos-$(date +%Y%m%d%H%M)" \
  --resource-group perfectltp-prod-rg \
  --kind GlobalDocumentDB \
  --locations regionName=eastus2 \
  --default-consistency-level Session

# Get connection details
az cosmosdb show --name "perfectltp-cosmos-YYYYMMDDHHMM" --resource-group perfectltp-prod-rg --query "documentEndpoint" -o tsv
az cosmosdb keys list --name "perfectltp-cosmos-YYYYMMDDHHMM" --resource-group perfectltp-prod-rg --query "primaryMasterKey" -o tsv

# Add to Key Vault
az keyvault secret set --vault-name "perfectltpkv202506061150" --name "cosmos-db-endpoint" --value "YOUR_COSMOS_ENDPOINT"
az keyvault secret set --vault-name "perfectltpkv202506061150" --name "cosmos-db-key" --value "YOUR_COSMOS_KEY"
```

### Step 2: Create Azure OpenAI Service
```bash
# Register Cognitive Services provider
az provider register --namespace Microsoft.CognitiveServices

# Create Azure OpenAI account
az cognitiveservices account create \
  --name "perfectltp-openai-$(date +%Y%m%d%H%M)" \
  --resource-group perfectltp-prod-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus2 \
  --custom-domain "perfectltp-openai-$(date +%Y%m%d%H%M)"

# Get connection details
az cognitiveservices account show --name "perfectltp-openai-YYYYMMDDHHMM" --resource-group perfectltp-prod-rg --query "properties.endpoint" -o tsv
az cognitiveservices account keys list --name "perfectltp-openai-YYYYMMDDHHMM" --resource-group perfectltp-prod-rg --query "key1" -o tsv

# Add to Key Vault
az keyvault secret set --vault-name "perfectltpkv202506061150" --name "azure-openai-endpoint" --value "YOUR_OPENAI_ENDPOINT"
az keyvault secret set --vault-name "perfectltpkv202506061150" --name "azure-openai-key" --value "YOUR_OPENAI_KEY"
```

### Step 3: Create Storage Account
```bash
# Create storage account
az storage account create \
  --name "perfectltpstorage$(date +%Y%m%d%H%M)" \
  --resource-group perfectltp-prod-rg \
  --location eastus2 \
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string --name "perfectltpstorage-YYYYMMDDHHMM" --resource-group perfectltp-prod-rg --query "connectionString" -o tsv

# Add to Key Vault
az keyvault secret set --vault-name "perfectltpkv202506061150" --name "azure-storage-connection" --value "YOUR_STORAGE_CONNECTION_STRING"
```

## 🔧 **Interactive Setup Script**

Run the interactive setup script to guide you through the remaining steps:

```bash
cd backend
node scripts/setup-azure.js
```

## 📋 **Required Key Vault Secrets**

| Secret Name | Status | Description |
|-------------|--------|-------------|
| `jwt-secret` | ✅ Created | JWT token signing key |
| `session-secret` | ✅ Created | Session encryption key |
| `encryption-key` | ✅ Created | Data encryption key |
| `cosmos-db-endpoint` | ⏳ Pending | Cosmos DB endpoint URL |
| `cosmos-db-key` | ⏳ Pending | Cosmos DB primary key |
| `azure-openai-endpoint` | ⏳ Pending | Azure OpenAI endpoint |
| `azure-openai-key` | ⏳ Pending | Azure OpenAI API key |
| `azure-storage-connection` | ⏳ Pending | Storage account connection string |

## 🔍 **Verify Your Setup**

### Check Key Vault Secrets
```bash
az keyvault secret list --vault-name "perfectltpkv202506061150" --query "[].name" -o table
```

### Test Application with Key Vault
```bash
cd backend
npm run dev
```

Look for these log messages:
- ✅ `Secret AZURE_OPENAI_API_KEY loaded successfully`
- ✅ `Secret AZURE_STORAGE_CONNECTION_STRING loaded successfully`
- ✅ `Secrets initialization completed`

## 💰 **Cost Estimation**

**Monthly Azure Costs (Estimated):**
- **Key Vault:** $3-5/month
- **Cosmos DB:** $25-35/month (400 RU/s)
- **Azure OpenAI:** $20-50/month (depending on usage)
- **Storage Account:** $5-10/month
- **Total:** ~$53-100/month

## 🔒 **Security Best Practices**

1. **Key Vault Access:** Only grant minimum required permissions
2. **Secrets Rotation:** Regularly rotate secrets (quarterly recommended)
3. **Monitoring:** Enable Key Vault logging and monitoring
4. **Network Security:** Consider private endpoints for production

## 🆘 **Troubleshooting**

### Common Issues:

**1. Provider Registration Errors**
```bash
az provider register --namespace Microsoft.KeyVault
az provider register --namespace Microsoft.DocumentDB
az provider register --namespace Microsoft.CognitiveServices
```

**2. Permission Denied Errors**
```bash
# Verify your role assignment
az role assignment list --assignee "8c5e9081-6b67-4937-93ef-e60c9455e4e7" --scope "/subscriptions/51b2af70-f5ce-453b-a9cc-be9240defcbf/resourceGroups/perfectltp-prod-rg/providers/Microsoft.KeyVault/vaults/perfectltpkv202506061150"
```

**3. Application Can't Access Key Vault**
- Ensure `AZURE_KEY_VAULT_ENABLED=true` in your .env file
- Verify Azure CLI is logged in: `az account show`
- Check tenant ID matches in configuration

## 📞 **Support**

If you encounter issues:
1. Check the Azure portal for resource status
2. Review application logs for specific error messages
3. Verify all environment variables are correctly set
4. Ensure Azure CLI authentication is valid

---

**Next:** Once all services are created, run `npm run dev` to test your complete Azure-integrated Perfect LifeTracker Pro application! 