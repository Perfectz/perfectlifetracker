# Quick Azure Free Tier Deployment Guide

## 🚀 **Deploy Perfect LifeTracker Pro to Azure in 5 Steps**

### **Option 1: Automated Script (Recommended)**

Run the PowerShell script to create all Azure resources automatically:

```powershell
# Run from your project root directory
.\deploy-azure-free.ps1 -SubscriptionId "51b2af70-f5ce-453b-a9cc-be9240defcbf"
```

This script will create:
- ✅ Resource Group (perfectltp-free-rg)
- ✅ Cosmos DB Free Tier (perfectltp-cosmos-free)
- ✅ Storage Account (perfectltpstgfree)
- ✅ App Service F1 Free (perfectltp-api-free)
- ✅ Application Insights (perfectltp-insights-free)

### **Option 2: Manual Commands**

If you prefer manual setup, run these commands one by one:

```bash
# 1. Login and set subscription
az login
az account set --subscription "51b2af70-f5ce-453b-a9cc-be9240defcbf"

# 2. Create resource group
az group create --name perfectltp-free-rg --location eastus2

# 3. Create Cosmos DB (Free Tier)
az cosmosdb create \
  --name perfectltp-cosmos-free \
  --resource-group perfectltp-free-rg \
  --kind GlobalDocumentDB \
  --locations regionName=eastus2 \
  --enable-free-tier true

# 4. Create App Service (F1 Free)
az appservice plan create \
  --name perfectltp-api-plan \
  --resource-group perfectltp-free-rg \
  --sku F1 \
  --is-linux

az webapp create \
  --name perfectltp-api-free \
  --resource-group perfectltp-free-rg \
  --plan perfectltp-api-plan \
  --runtime "NODE:18-lts"

# 5. Configure environment variables
COSMOS_ENDPOINT=$(az cosmosdb show --name perfectltp-cosmos-free --resource-group perfectltp-free-rg --query "documentEndpoint" -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --name perfectltp-cosmos-free --resource-group perfectltp-free-rg --query "primaryMasterKey" -o tsv)

az webapp config appsettings set \
  --name perfectltp-api-free \
  --resource-group perfectltp-free-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    USE_KEY_VAULT=false \
    COSMOS_DB_ENDPOINT="$COSMOS_ENDPOINT" \
    COSMOS_DB_KEY="$COSMOS_KEY" \
    JWT_SECRET="$(openssl rand -base64 64)" \
    SESSION_SECRET="$(openssl rand -base64 64)" \
    ENCRYPTION_KEY="$(openssl rand -base64 64)"
```

## 📱 **Frontend Deployment (Static Web App)**

Create a Static Web App manually in Azure Portal:

1. **Go to Azure Portal** → Create a resource → Static Web Apps
2. **Configure:**
   - Resource group: `perfectltp-free-rg`
   - Name: `perfectltp-frontend-free`
   - Source: GitHub
   - Repository: Your GitHub repository
   - Branch: `master` or `main`
   - App location: `/frontend`
   - Output location: `dist`

3. **Get deployment token:**
```bash
az staticwebapp secrets list \
  --name perfectltp-frontend-free \
  --resource-group perfectltp-free-rg \
  --query "properties.apiKey" -o tsv
```

## 🔑 **GitHub Secrets Setup**

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **AZURE_WEBAPP_PUBLISH_PROFILE:**
```bash
az webapp deployment list-publishing-profiles \
  --name perfectltp-api-free \
  --resource-group perfectltp-free-rg \
  --xml
```

2. **AZURE_STATIC_WEB_APPS_API_TOKEN:**
Use the token from the Static Web App creation step above.

## 🚀 **Deploy and Test**

1. **Push to GitHub:**
```bash
git add .
git commit -m "feat: Azure free tier deployment setup"
git push origin master
```

2. **Check deployment status:**
   - GitHub Actions will automatically deploy both frontend and backend
   - Monitor progress in the "Actions" tab of your GitHub repository

3. **Test your deployment:**
   - Backend: `https://perfectltp-api-free.azurewebsites.net/api/health`
   - Frontend: Check Azure Portal for Static Web App URL

## 📊 **Resource Overview**

| Service | Free Tier Limits | Perfect LifeTracker Usage |
|---------|------------------|---------------------------|
| **App Service F1** | 60 CPU minutes/day, 1GB RAM | Backend API |
| **Cosmos DB** | 1000 RU/s, 25GB storage | User data, tasks, fitness |
| **Static Web Apps** | 100GB bandwidth/month | React frontend |
| **Storage** | 5GB, 20,000 operations | File uploads, avatars |
| **Application Insights** | 5GB data/month | Monitoring, analytics |

**Total Monthly Cost: $0.00** 💰

## 🔍 **Monitoring and Management**

**View logs:**
```bash
# App Service logs
az webapp log tail --name perfectltp-api-free --resource-group perfectltp-free-rg

# View resource status
az resource list --resource-group perfectltp-free-rg --output table
```

**Scale resources (within free tier limits):**
```bash
# Restart App Service
az webapp restart --name perfectltp-api-free --resource-group perfectltp-free-rg

# View metrics
az monitor metrics list --resource-id /subscriptions/51b2af70-f5ce-453b-a9cc-be9240defcbf/resourceGroups/perfectltp-free-rg/providers/Microsoft.Web/sites/perfectltp-api-free
```

## 🎉 **Success! Your app is now live on Azure Free Tier**

✅ **Frontend:** React app hosted on Static Web Apps  
✅ **Backend:** Node.js API on App Service F1  
✅ **Database:** Cosmos DB with 1000 RU/s free  
✅ **Storage:** 5GB for uploads and files  
✅ **Monitoring:** Application Insights tracking  
✅ **CI/CD:** Automated GitHub Actions deployment  

**Total setup time:** 15-20 minutes  
**Total monthly cost:** $0.00  

Your Perfect LifeTracker Pro is now running on enterprise-grade Azure infrastructure completely free! 🚀 