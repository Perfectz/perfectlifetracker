# docs/azure-deployment.md
# Azure Deployment Guide for Perfect LifeTracker Pro

This guide provides step-by-step instructions for deploying Perfect LifeTracker Pro to the Azure ecosystem.

## 🏗️ Architecture Overview

The application is deployed using the following Azure services:

- **Azure Static Web Apps** - Frontend hosting (React/Vite)
- **Azure App Service** - Backend API hosting (Node.js/Express)
- **Azure Cosmos DB** - NoSQL database with serverless capability
- **Azure Key Vault** - Secure secrets management
- **Azure Storage Account** - File uploads and backups
- **Azure Application Insights** - Monitoring and logging
- **Azure Log Analytics** - Centralized logging

## 📋 Prerequisites

### Required Tools
- **Azure CLI** v2.50+ (`az --version`)
- **Terraform** v1.5+ (`terraform version`)
- **Node.js** v20+ (`node --version`)
- **PowerShell** 7+ (for deployment scripts)
- **Git** (`git --version`)

### Azure Requirements
- **Azure Subscription** with Owner or Contributor role
- **Azure AD** access for authentication setup
- **Resource Provider Registration** for:
  - Microsoft.Web
  - Microsoft.DocumentDB
  - Microsoft.KeyVault
  - Microsoft.Storage
  - Microsoft.Insights

### Install Azure CLI
```bash
# Windows (via winget)
winget install Microsoft.AzureCLI

# macOS (via Homebrew)
brew install azure-cli

# Linux (Ubuntu/Debian)
curl -sL https://aka.ms/InstallAzureCLI | sudo bash
```

### Install Terraform
```bash
# Windows (via Chocolatey)
choco install terraform

# macOS (via Homebrew)
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip
unzip terraform_1.5.7_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

## 🚀 Deployment Methods

### Method 1: Automated Deployment (Recommended)

#### Using PowerShell Script
```powershell
# Navigate to project root
cd PerfectLTP

# Run deployment script
.\scripts\deploy-azure.ps1 -Environment dev -Force

# For production deployment
.\scripts\deploy-azure.ps1 -Environment prod -SubscriptionId "your-sub-id"
```

#### Using GitHub Actions
1. Fork the repository
2. Set up GitHub Secrets (see [GitHub Secrets Setup](#github-secrets-setup))
3. Push to `master` branch or run workflow manually

### Method 2: Manual Deployment

#### Step 1: Configure Variables
```bash
# Copy and edit Terraform variables
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

#### Step 2: Deploy Infrastructure
```bash
# Login to Azure
az login

# Initialize and deploy with Terraform
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

#### Step 3: Deploy Backend
```bash
cd ../backend

# Install dependencies and build
npm ci
npm run build

# Deploy to App Service
az webapp deployment source config-zip \
  --resource-group perfectltp-dev-rg \
  --name perfectltp-dev-backend \
  --src dist.zip
```

#### Step 4: Deploy Frontend
```bash
cd ../frontend

# Install dependencies and build
npm ci
npm run build

# Deploy using Azure Static Web Apps CLI or GitHub Actions
```

## 🔧 Configuration

### Environment Variables

#### Development Environment (.env)
```bash
# Backend configuration
NODE_ENV=development
USE_KEY_VAULT=false
USE_MOCK_DATABASE=true
USE_MOCK_AUTH=true

# Database
COSMOS_DB_ENDPOINT=https://your-cosmos.documents.azure.com:443/
COSMOS_DB_KEY=your-cosmos-key
COSMOS_DB_DATABASE=lifetrackpro-db

# Authentication (for production)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id

# Storage
AZURE_STORAGE_CONNECTION_STRING=your-storage-connection
```

#### Production Environment (Azure Key Vault)
```bash
# These values are stored in Azure Key Vault
cosmos-db-key
cosmos-db-endpoint
jwt-secret
session-secret
encryption-key
azure-storage-connection
app-insights-key
```

### Terraform Variables (terraform.tfvars)
```hcl
# Required
subscription_id = "your-azure-subscription-id"
tenant_id       = "your-azure-tenant-id"

# Environment
environment = "dev"  # dev, staging, prod
location    = "East US"
prefix      = "perfectltp"

# Resources
app_service_plan_sku = "B1"
static_web_app_sku   = "Free"
cosmos_db_throughput = 400
enable_monitoring    = true

# CORS
allowed_origins = [
  "https://localhost:3000",
  "https://yourdomain.com"
]
```

## 🔐 Security Setup

### Azure AD Authentication

#### 1. Register Application
```bash
# Create app registration
az ad app create \
  --display-name "PerfectLifeTracker-Dev" \
  --sign-in-audience "AzureADMyOrg" \
  --web-redirect-uris "https://your-frontend-url/auth/callback"

# Note the Application (client) ID and Directory (tenant) ID
```

#### 2. Configure Authentication
1. Go to Azure Portal > Azure AD > App Registrations
2. Select your app
3. Configure:
   - **Redirect URIs**: Add your frontend URLs
   - **Token configuration**: Add optional claims
   - **API permissions**: Add required permissions

#### 3. Create Client Secret
```bash
# Create client secret
az ad app credential reset \
  --id your-app-id \
  --display-name "Production Secret"

# Store the secret in Key Vault
az keyvault secret set \
  --vault-name your-keyvault \
  --name "azure-client-secret" \
  --value "your-secret-value"
```

### GitHub Secrets Setup

For GitHub Actions deployment, configure these secrets:

```yaml
# Required secrets in GitHub repository settings
AZURE_CREDENTIALS: |
  {
    "clientId": "your-service-principal-id",
    "clientSecret": "your-service-principal-secret",
    "subscriptionId": "your-subscription-id",
    "tenantId": "your-tenant-id"
  }

AZURE_SUBSCRIPTION_ID: "your-subscription-id"
AZURE_TENANT_ID: "your-tenant-id"
AZURE_STATIC_WEB_APPS_API_TOKEN: "your-swa-deployment-token"
```

### Service Principal Creation
```bash
# Create service principal for deployments
az ad sp create-for-rbac \
  --name "PerfectLifeTracker-Deploy" \
  --role Contributor \
  --scopes /subscriptions/your-subscription-id \
  --sdk-auth
```

## 📊 Monitoring and Logging

### Application Insights Setup
```bash
# Get instrumentation key
az monitor app-insights component show \
  --app perfectltp-dev-ai \
  --resource-group perfectltp-dev-rg \
  --query instrumentationKey
```

### Log Analytics Queries
```kql
// Application errors
traces
| where severityLevel >= 3
| order by timestamp desc
| take 100

// API performance
requests
| where timestamp > ago(1h)
| summarize avg(duration), count() by name
| order by avg_duration desc

// Database operations
dependencies
| where type == "Azure DocumentDB"
| summarize avg(duration), count() by name
| order by avg_duration desc
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The repository includes a complete GitHub Actions workflow (`.github/workflows/azure-deploy.yml`) that:

1. **Infrastructure**: Deploys/updates Azure resources with Terraform
2. **Backend**: Builds, tests, and deploys Node.js API
3. **Frontend**: Builds, tests, and deploys React application
4. **Health Checks**: Verifies deployment success

### Manual Trigger
```bash
# Trigger deployment via GitHub CLI
gh workflow run azure-deploy.yml \
  --field environment=staging
```

## 🧪 Testing Deployment

### Health Checks
```bash
# Backend health
curl https://perfectltp-dev-backend.azurewebsites.net/api/health

# Frontend availability
curl https://perfectltp-dev-frontend.azurestaticapps.net

# Database connectivity test
curl -X POST https://perfectltp-dev-backend.azurewebsites.net/api/test/db
```

### Load Testing
```bash
# Install Artillery for load testing
npm install -g artillery

# Run load test
artillery run loadtest/api-test.yml
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Terraform State Issues
```bash
# Reset Terraform state
terraform refresh
terraform plan

# Force unlock if needed
terraform force-unlock LOCK_ID
```

#### 2. App Service Deployment Failures
```bash
# Check deployment logs
az webapp log tail \
  --name perfectltp-dev-backend \
  --resource-group perfectltp-dev-rg

# Restart app service
az webapp restart \
  --name perfectltp-dev-backend \
  --resource-group perfectltp-dev-rg
```

#### 3. Key Vault Access Issues
```bash
# Check access policies
az keyvault show \
  --name perfectltp-dev-kv-123456 \
  --resource-group perfectltp-dev-rg

# Add access policy for app service
az keyvault set-policy \
  --name perfectltp-dev-kv-123456 \
  --object-id your-app-service-principal-id \
  --secret-permissions get list
```

#### 4. Database Connection Issues
- Verify Cosmos DB endpoint and key in Key Vault
- Check network access rules
- Verify managed identity permissions

### Logging and Debugging

#### Application Logs
```bash
# Stream live logs
az webapp log tail \
  --name perfectltp-dev-backend \
  --resource-group perfectltp-dev-rg

# Download log files
az webapp log download \
  --name perfectltp-dev-backend \
  --resource-group perfectltp-dev-rg
```

#### Application Insights
```bash
# Query recent errors
az monitor app-insights query \
  --app perfectltp-dev-ai \
  --analytics-query "exceptions | limit 10"
```

## 📈 Scaling and Performance

### Auto Scaling
```bash
# Configure auto-scaling for App Service
az monitor autoscale create \
  --resource-group perfectltp-prod-rg \
  --resource perfectltp-prod-backend \
  --resource-type Microsoft.Web/serverfarms \
  --name perfectltp-autoscale \
  --min-count 1 \
  --max-count 10 \
  --count 2
```

### Performance Optimization
- Enable Application Insights profiling
- Configure CDN for static assets
- Optimize Cosmos DB indexing policies
- Use connection pooling for database

## 💰 Cost Optimization

### Development Environment
- Use **Free Tier** services where available
- Enable **auto-pause** for Cosmos DB
- Use **B1** App Service plan (can scale to 0)

### Production Environment
- Use **Premium v3** App Service for better performance
- Enable **reserved capacity** for Cosmos DB
- Configure **auto-scaling** based on metrics
- Use **Azure Monitor** to track costs

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)

## 🆘 Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Azure Portal logs
3. Check Application Insights for errors
4. Contact the development team with specific error messages 