# Azure Free Tier Deployment Guide for Perfect LifeTracker Pro

## 🆓 **Azure Free Tier Services Overview**

Deploy Perfect LifeTracker Pro using **100% Azure free tier services**:

- **Azure Static Web Apps** - Frontend hosting (100GB bandwidth/month free)
- **Azure App Service F1** - Backend API (1GB RAM, 1GB storage, 60 CPU minutes/day)
- **Azure Cosmos DB Free** - Database (1000 RU/s + 25GB storage free forever)
- **Azure Key Vault** - Secrets management (10,000 operations/month free)
- **Azure Storage** - File storage (5GB free)
- **Application Insights** - Monitoring (5GB data/month free)

**Total Monthly Cost: $0** 🎉

## 🚀 **Prerequisites**

- Azure subscription with free tier available
- GitHub account and repository: https://github.com/Perfectz/perfectlifetracker
- Azure CLI installed and logged in
- Node.js 18+ installed

## 📋 **Step 1: Prepare Your Repository**

Ensure your repository is accessible and has the correct structure:
```
perfectlifetracker/
├── frontend/          # React application
├── backend/           # Express API
├── .github/workflows/ # CI/CD workflows
└── deployment files
```

## 🏗️ **Step 2: Create Azure Resources**

Run these commands to create all required Azure resources:

```bash
# Login to Azure (if not already done)
az login

# Set your subscription (use your actual subscription ID)
az account set --subscription "51b2af70-f5ce-453b-a9cc-be9240defcbf"

# Create resource group for free tier resources
az group create \
  --name perfectltp-free-rg \
  --location eastus2

# Create Cosmos DB with free tier enabled
az cosmosdb create \
  --name perfectltp-cosmos-free \
  --resource-group perfectltp-free-rg \
  --kind GlobalDocumentDB \
  --locations regionName=eastus2 \
  --default-consistency-level Session \
  --enable-free-tier true

# Create database and containers
az cosmosdb sql database create \
  --account-name perfectltp-cosmos-free \
  --resource-group perfectltp-free-rg \
  --name perfectltp

# Create containers (using shared 1000 RU/s from free tier)
az cosmosdb sql container create \
  --account-name perfectltp-cosmos-free \
  --resource-group perfectltp-free-rg \
  --database-name perfectltp \
  --name users \
  --partition-key-path "/id"

az cosmosdb sql container create \
  --account-name perfectltp-cosmos-free \
  --resource-group perfectltp-free-rg \
  --database-name perfectltp \
  --name tasks \
  --partition-key-path "/userId"

az cosmosdb sql container create \
  --account-name perfectltp-cosmos-free \
  --resource-group perfectltp-free-rg \
  --database-name perfectltp \
  --name fitness \
  --partition-key-path "/userId"

# Create storage account for file uploads
az storage account create \
  --name perfectltpstgfree \
  --resource-group perfectltp-free-rg \
  --location eastus2 \
  --sku Standard_LRS \
  --kind StorageV2

# Create App Service Plan (F1 Free tier)
az appservice plan create \
  --name perfectltp-api-plan \
  --resource-group perfectltp-free-rg \
  --location eastus2 \
  --sku F1 \
  --is-linux

# Create Web App for backend API
az webapp create \
  --name perfectltp-api-free \
  --resource-group perfectltp-free-rg \
  --plan perfectltp-api-plan \
  --runtime "NODE:18-lts"

# Create Static Web App for frontend
az staticwebapp create \
  --name perfectltp-frontend-free \
  --resource-group perfectltp-free-rg \
  --location eastus2 \
  --source https://github.com/Perfectz/perfectlifetracker \
  --branch master \
  --app-location "/frontend" \
  --output-location "dist" \
  --app-build-command "npm run build"

# Create Application Insights for monitoring
az extension add --name application-insights
az monitor app-insights component create \
  --app perfectltp-insights-free \
  --location eastus2 \
  --resource-group perfectltp-free-rg \
  --kind web \
  --application-type web
```

## 🔐 **Step 3: Configure Environment Variables**

```bash
# Get connection details
COSMOS_ENDPOINT=$(az cosmosdb show --name perfectltp-cosmos-free --resource-group perfectltp-free-rg --query "documentEndpoint" -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --name perfectltp-cosmos-free --resource-group perfectltp-free-rg --query "primaryMasterKey" -o tsv)
STORAGE_CONNECTION=$(az storage account show-connection-string --name perfectltpstgfree --resource-group perfectltp-free-rg --query "connectionString" -o tsv)
INSIGHTS_KEY=$(az monitor app-insights component show --app perfectltp-insights-free --resource-group perfectltp-free-rg --query "instrumentationKey" -o tsv)

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -base64 64)

# Configure App Service environment variables
az webapp config appsettings set \
  --name perfectltp-api-free \
  --resource-group perfectltp-free-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    USE_KEY_VAULT=false \
    COSMOS_DB_ENDPOINT="$COSMOS_ENDPOINT" \
    COSMOS_DB_KEY="$COSMOS_KEY" \
    JWT_SECRET="$JWT_SECRET" \
    SESSION_SECRET="$SESSION_SECRET" \
    ENCRYPTION_KEY="$ENCRYPTION_KEY" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" \
    APPINSIGHTS_INSTRUMENTATIONKEY="$INSIGHTS_KEY"

echo "Configuration complete!"
echo "Frontend URL: Check Azure portal for Static Web App URL"
echo "Backend URL: https://perfectltp-api-free.azurewebsites.net"
```

## 📦 **Step 4: Create GitHub Repository Secrets**

You'll need to set up GitHub repository secrets for automated deployment:

1. **Get Azure App Service Publish Profile:**
```bash
# Download publish profile for App Service
az webapp deployment list-publishing-profiles \
  --name perfectltp-api-free \
  --resource-group perfectltp-free-rg \
  --xml > publish-profile.xml

# Copy the content and add as GitHub secret: AZURE_WEBAPP_PUBLISH_PROFILE
```

2. **Get Static Web App API Token:**
```bash
# Get the API token for Static Web App
az staticwebapp secrets list \
  --name perfectltp-frontend-free \
  --resource-group perfectltp-free-rg \
  --query "properties.apiKey" -o tsv

# Copy this token and add as GitHub secret: AZURE_STATIC_WEB_APPS_API_TOKEN
```

**GitHub Repository Secrets Required:**
- `AZURE_WEBAPP_PUBLISH_PROFILE` - App Service publish profile (XML content)
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Static Web App deployment token

## 🚀 **Step 5: Deploy Your Application**

Now let's deploy your application! First, let me provide you with a simple deployment script. 