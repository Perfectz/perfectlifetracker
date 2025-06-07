# GitHub Repository Secrets Setup

To enable automatic deployment via GitHub Actions, you need to configure the following secrets in your GitHub repository.

## How to Add Secrets

1. Go to your GitHub repository: https://github.com/yourusername/PerfectLTP
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

## Required Secrets

### 1. AZURE_WEBAPP_PUBLISH_PROFILE

**Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`

**Value:** Get this from Azure Portal or run this command:

```bash
az webapp deployment list-publishing-profiles --name perfectltp-api-free --resource-group perfectltp-free-rg --xml
```

The publish profile is an XML document that contains deployment credentials for your Azure App Service.

### 2. AZURE_STATIC_WEB_APPS_API_TOKEN

**Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`

**Value:** Get this from Azure Portal or run this command:

```bash
az staticwebapp secrets list --name perfectltp-frontend-free --query "properties.apiKey" --output tsv
```

## Verification

After adding both secrets:

1. Go to **Actions** tab in your GitHub repository
2. You should see workflow runs when you push changes
3. The workflow will automatically deploy to:
   - **Frontend:** https://blue-sea-05cd4b10f.6.azurestaticapps.net/
   - **Backend:** https://perfectltp-api-free.azurewebsites.net/

## Current Deployment Status

✅ **Manual Deployment Complete:**
- Frontend: Successfully deployed and working
- Backend: Successfully deployed with Cosmos DB integration
- All API endpoints functional and tested

🔄 **Next Step:**
- Set up GitHub secrets to enable automatic deployments on code changes

## Test After Setup

Once secrets are configured, push any change to trigger the workflow:

```bash
git add .
git commit -m "test: Trigger automated deployment"
git push origin master
```

The GitHub Actions workflow will automatically:
1. Build and test the frontend
2. Deploy the working backend server
3. Deploy the frontend to Static Web Apps
4. Run health checks
5. Provide deployment summary

## Support

If you encounter issues:
1. Check the **Actions** tab for workflow logs
2. Verify both secrets are properly set
3. Ensure the repository has the correct permissions 