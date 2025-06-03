# Perfect LifeTracker Pro - Production Deployment Guide

This guide covers the complete process for deploying Perfect LifeTracker Pro to production with proper security and configuration.

## 📋 Prerequisites

### Azure Resources Required
- [ ] Azure Cosmos DB account (SQL API)
- [ ] Azure Storage Account (for file uploads)
- [ ] Azure Active Directory B2C tenant
- [ ] Azure App Service or Azure Kubernetes Service
- [ ] Azure Application Insights (optional, for monitoring)
- [ ] Azure OpenAI Service (optional, for AI features)

### Local Development Tools
- [ ] Node.js 18.x or higher
- [ ] npm 9.x or higher
- [ ] Azure CLI 2.x
- [ ] Docker (for containerized deployment)

## 🔧 Environment Configuration

### 1. Backend Environment Setup

Copy the production environment template:
```bash
cp backend/env-templates/production.env.template backend/.env
```

**Required Environment Variables to Replace:**

#### Database Configuration
```bash
# Replace with your Cosmos DB details
COSMOS_DB_ENDPOINT=https://YOUR_COSMOS_ACCOUNT.documents.azure.com:443/
COSMOS_DB_KEY=YOUR_COSMOS_PRIMARY_KEY
```

#### Authentication Configuration
```bash
# Replace with your Azure AD B2C details
AZURE_CLIENT_ID=YOUR_AZURE_CLIENT_ID
AZURE_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID
```

#### Storage Configuration
```bash
# Replace with your Azure Storage details
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=YOUR_STORAGE_ACCOUNT;AccountKey=YOUR_STORAGE_KEY;EndpointSuffix=core.windows.net
```

#### Security Secrets (Generate Secure Random Values)
```bash
# Generate secure 256-bit secrets
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
```

### 2. Frontend Environment Setup

Copy the production environment template:
```bash
cp frontend/env-templates/production.env.template frontend/.env.production
```

**Required Environment Variables to Replace:**
```bash
# Replace with your Azure AD B2C details
VITE_AZURE_CLIENT_ID=YOUR_AZURE_CLIENT_ID
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID

# Replace with your production API URL
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 🚀 Deployment Options

### Option 1: Azure App Service (Recommended for Small-Medium Scale)

#### Backend Deployment
```bash
# Build the backend
cd backend
npm run build

# Deploy to Azure App Service
az webapp up --name perfectltp-api --resource-group perfectltp-rg
```

#### Frontend Deployment
```bash
# Build the frontend
cd frontend
npm run build

# Deploy to Azure Static Web Apps or App Service
az staticwebapp create --name perfectltp-frontend --source .
```

### Option 2: Azure Kubernetes Service (Recommended for Enterprise Scale)

#### 1. Build Docker Images
```bash
# Backend
docker build -t perfectltp/backend:latest -f backend/Dockerfile .

# Frontend
docker build -t perfectltp/frontend:latest -f frontend/Dockerfile .
```

#### 2. Push to Azure Container Registry
```bash
az acr login --name yourregistryname
docker tag perfectltp/backend:latest yourregistryname.azurecr.io/perfectltp/backend:latest
docker push yourregistryname.azurecr.io/perfectltp/backend:latest
```

#### 3. Deploy to AKS
```bash
kubectl apply -f kubernetes/production/
```

## 🔒 Security Checklist

### Pre-Deployment Security
- [ ] All placeholder values replaced in environment files
- [ ] JWT secrets generated with 256-bit entropy
- [ ] CORS origins restricted to production domains only
- [ ] `USE_MOCK_AUTH=false` in production
- [ ] `USE_MOCK_DATABASE=false` in production
- [ ] HTTPS enforced for all endpoints
- [ ] Rate limiting enabled and configured

### Post-Deployment Security
- [ ] SSL certificates configured and valid
- [ ] Security headers enabled (Helmet.js)
- [ ] Database access restricted to application IPs only
- [ ] Storage account access keys rotated
- [ ] Application Insights monitoring enabled
- [ ] Backup and disaster recovery configured

## 📊 Monitoring and Maintenance

### Application Insights Setup
1. Create Application Insights resource in Azure
2. Add instrumentation key to backend environment:
   ```bash
   APPINSIGHTS_INSTRUMENTATIONKEY=your_instrumentation_key
   ```

### Health Checks
- Backend health: `https://api.yourdomain.com/api/health`
- Frontend health: Check main application loads properly

### Log Monitoring
- Application logs available in Azure App Service logs
- Custom metrics in Application Insights
- Error tracking and alerting configured

## 🔄 CI/CD Pipeline

### GitHub Actions Configuration
Create `.github/workflows/production.yml`:

```yaml
name: Production Deployment
on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
      - name: Build applications
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build
      - name: Deploy to Azure
        # Add your deployment steps here
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Verify Cosmos DB endpoint and key
- Check network security groups allow connections
- Ensure database and containers exist

#### 2. Authentication Errors
- Verify Azure AD B2C configuration
- Check client ID and tenant ID are correct
- Ensure redirect URLs are configured

#### 3. File Upload Issues
- Verify Azure Storage connection string
- Check container exists and permissions
- Verify CORS settings on storage account

#### 4. CORS Errors
- Ensure frontend URL is in `ALLOWED_ORIGINS`
- Check Azure AD B2C redirect URIs
- Verify API gateway CORS configuration

### Debugging Commands
```bash
# Check backend logs
az webapp log tail --name perfectltp-api --resource-group perfectltp-rg

# Check frontend deployment
az staticwebapp show --name perfectltp-frontend

# Test API connectivity
curl -X GET https://api.yourdomain.com/api/health
```

## 📞 Support

For deployment support and issues:
1. Check the troubleshooting section above
2. Review Azure service health status
3. Check application logs in Azure portal
4. Contact the development team with specific error messages

## 🔄 Rolling Back

### Quick Rollback Commands
```bash
# Rollback backend
az webapp deployment slot swap --name perfectltp-api --resource-group perfectltp-rg --slot staging --target-slot production

# Rollback frontend
az staticwebapp environment set --name perfectltp-frontend --environment-name production --source previous-deployment
```

---

**⚠️ Important Security Notes:**
- Never commit `.env` files to version control
- Rotate secrets regularly (every 90 days minimum)
- Monitor access logs for suspicious activity
- Keep all Azure services updated with latest patches 