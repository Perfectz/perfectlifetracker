# Azure Deployment Configuration Guide
**Perfect LifeTracker Pro - Production Deployment**

## Overview
This guide provides step-by-step instructions for deploying your updated Perfect LifeTracker Pro application to your existing Azure infrastructure with Cosmos DB.

## Prerequisites ✅
- Azure subscription (already have)
- Azure Cosmos DB instance (already configured)
- Azure App Service or Container Apps (existing)

## Step 1: Azure AD Application Registration

### 1.1 Create App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: Perfect LifeTracker Pro
   - **Supported account types**: Accounts in any organizational directory (Any Azure AD directory - Multitenant)
   - **Redirect URI**: 
     - Type: SPA (Single-page application)
     - URI: `https://your-app-name.azurewebsites.net`

### 1.2 Configure Authentication
1. In your app registration, go to **Authentication**
2. Add redirect URIs:
   - `https://your-app-name.azurewebsites.net`
   - `https://your-app-name.azurewebsites.net/auth/callback` 
   - `http://localhost:3000` (for development)
3. Enable **Access tokens** and **ID tokens**
4. Save changes

### 1.3 Configure API Permissions
1. Go to **API permissions**
2. Add permissions:
   - **Microsoft Graph** > **User.Read** (Delegated)
   - **Microsoft Graph** > **openid** (Delegated)
   - **Microsoft Graph** > **profile** (Delegated)
   - **Microsoft Graph** > **email** (Delegated)
3. Grant admin consent

### 1.4 Get Required Values
Note down these values:
- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Authority URL**: `https://login.microsoftonline.com/[tenant-id]`

## Step 2: Update Environment Configuration

### 2.1 Frontend Environment Variables
Create `.env.production` in the frontend folder:

```env
# Production mode
NODE_ENV=production

# API Configuration - Replace with your actual Azure backend URL
VITE_API_BASE_URL=https://[your-backend-app-name].azurewebsites.net
VITE_AZURE_UPLOAD_URL=https://[your-backend-app-name].azurewebsites.net

# Azure Authentication - Replace with your values from Step 1.4
VITE_AZURE_CLIENT_ID=[your-client-id]
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/[your-tenant-id]

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Application Configuration
VITE_APP_NAME=Perfect LifeTracker Pro
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Build Configuration
GENERATE_SOURCEMAP=false
VITE_BUILD_OPTIMIZATION=true
VITE_MINIFY=true
```

### 2.2 Backend Environment Variables
Update your Azure App Service Configuration:

1. Go to your **Azure App Service** > **Configuration**
2. Add/Update Application Settings:

```
COSMOS_DB_ENDPOINT=[your-cosmos-endpoint]
COSMOS_DB_KEY=[your-cosmos-key]
JWT_SECRET=[generate-random-secret]
SESSION_SECRET=[generate-random-secret]
ENCRYPTION_KEY=[generate-random-secret]
NODE_ENV=production
PORT=80
CORS_ORIGIN=https://[your-frontend-app-name].azurewebsites.net
```

## Step 3: Build and Deploy

### 3.1 Build Frontend
```bash
cd frontend
npm run build
```

### 3.2 Deploy Frontend to Azure Static Web Apps or App Service
```bash
# If using Azure Static Web Apps
npm run deploy:azure

# If using App Service, zip the dist folder and deploy via:
# - Azure CLI
# - Visual Studio Code Azure extension
# - GitHub Actions (configured)
```

### 3.3 Deploy Backend
```bash
# Build backend
cd backend
npm run build

# Deploy to Azure App Service
# Use your preferred method:
# - Azure CLI
# - Visual Studio Code Azure extension  
# - GitHub Actions (already configured)
```

## Step 4: Verify Deployment

### 4.1 Test Authentication
1. Navigate to your deployed frontend URL
2. Click **Sign In**
3. Verify Microsoft/Google login works
4. Check that user profile displays correctly

### 4.2 Test API Endpoints
1. Verify weight tracking functionality
2. Test task management features
3. Check data persistence in Cosmos DB

### 4.3 Test Mobile Responsiveness
1. Open app on mobile browser
2. Test all major features
3. Verify PWA installation works

## Step 5: Configure Custom Domain (Optional)

### 5.1 Set Up Custom Domain
1. In Azure App Service, go to **Custom domains**
2. Add your domain
3. Configure SSL certificate
4. Update redirect URIs in Azure AD

### 5.2 Update Environment Variables
Update all URLs to use your custom domain instead of `.azurewebsites.net`

## Security Checklist

- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured properly
- [ ] Azure AD authentication working
- [ ] API endpoints require authentication
- [ ] Secrets stored in Azure Key Vault or App Settings
- [ ] Debug mode disabled in production
- [ ] Source maps disabled in production

## Performance Optimization

- [ ] CDN configured for static assets
- [ ] Gzip compression enabled
- [ ] Browser caching configured
- [ ] Database connection pooling enabled
- [ ] Cosmos DB request units optimized

## Monitoring & Logging

- [ ] Application Insights enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Health check endpoints working

## Next Steps After Deployment

1. **Mobile App Preparation**: Use React Native to create mobile versions
2. **Performance Monitoring**: Set up alerts and monitoring
3. **User Feedback**: Collect feedback on weight tracking and task management
4. **Feature Enhancement**: Add AI-powered insights using Azure OpenAI

## Support & Troubleshooting

### Common Issues
1. **Authentication not working**: Check redirect URIs match exactly
2. **API calls failing**: Verify CORS configuration and authentication headers
3. **Database connection issues**: Check Cosmos DB connection string and firewall rules

### Useful Commands
```bash
# Check deployment status
az webapp show --name [app-name] --resource-group [resource-group]

# View logs
az webapp log tail --name [app-name] --resource-group [resource-group]

# Restart app
az webapp restart --name [app-name] --resource-group [resource-group]
``` 