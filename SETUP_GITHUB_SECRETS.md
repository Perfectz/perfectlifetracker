# 🔐 GitHub Repository Secrets Configuration

## Step-by-Step Instructions

### 1. Access GitHub Repository Settings

1. **Go to your repository**: https://github.com/Perfectz/perfectlifetracker
2. **Click "Settings"** tab (top of the page)
3. **In left sidebar**: Click **"Secrets and variables"** → **"Actions"**
4. **Click "New repository secret"**

---

### 2. Add Secret #1: Azure App Service Publish Profile

**Secret Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`

**Instructions:**
1. Click **"New repository secret"**
2. **Name:** Enter exactly: `AZURE_WEBAPP_PUBLISH_PROFILE`
3. **Value:** Copy the content from the file `publish-profile-temp.xml` in your project directory
4. **Click "Add secret"**

**To get the value:**
```bash
# Option 1: Open the file and copy all content
notepad publish-profile-temp.xml

# Option 2: Display in terminal (copy all output)
Get-Content publish-profile-temp.xml
```

---

### 3. Add Secret #2: Static Web Apps API Token

**Secret Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`

**Instructions:**
1. Click **"New repository secret"** again
2. **Name:** Enter exactly: `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. **Value:** Copy the content from the file `swa-token-temp.txt` in your project directory
4. **Click "Add secret"**

**To get the value:**
```bash
# Option 1: Open the file and copy the token
notepad swa-token-temp.txt

# Option 2: Display in terminal (copy the output)
Get-Content swa-token-temp.txt
```

---

### 4. Verify Secrets Are Added

After adding both secrets, you should see:
- ✅ `AZURE_WEBAPP_PUBLISH_PROFILE` (Updated X seconds ago)
- ✅ `AZURE_STATIC_WEB_APPS_API_TOKEN` (Updated X seconds ago)

---

### 5. Test Automated Deployment

Once both secrets are configured, test the workflow:

```bash
# Make a small change to trigger deployment
echo "# Test automated deployment" >> README.md
git add README.md
git commit -m "test: Trigger automated deployment workflow"
git push origin master
```

---

### 6. Monitor the Deployment

1. Go to **"Actions"** tab in your GitHub repository
2. You should see a new workflow run starting
3. Click on the workflow to see the progress
4. The workflow will:
   - ✅ Test the frontend
   - ✅ Deploy the backend API
   - ✅ Deploy the frontend to Static Web Apps
   - ✅ Run health checks

---

### 7. Expected Results

After successful deployment:
- **Backend API**: https://perfectltp-api-free.azurewebsites.net/api/health
- **Frontend**: https://blue-sea-05cd4b10f.6.azurestaticapps.net/

---

### 🚨 Security Notes

- Never share these secret values
- The temporary files (`publish-profile-temp.xml`, `swa-token-temp.txt`) contain sensitive information
- Delete these files after setting up the secrets:
  ```bash
  rm publish-profile-temp.xml swa-token-temp.txt
  ```

### 🆘 Troubleshooting

**If deployment fails:**
1. Check the **Actions** tab for error messages
2. Verify both secret names are exactly correct (case-sensitive)
3. Ensure the secret values were copied completely
4. Check that Azure resources are still running

**Common issues:**
- Secret name typos (must be exact)
- Incomplete secret values (missing characters)
- Azure resource sleeping (free tier limitation)

---

### ✅ Success Indicators

You'll know it's working when:
1. ✅ GitHub Actions workflow completes without errors
2. ✅ Backend health check returns 200 OK
3. ✅ Frontend loads successfully
4. ✅ Both applications are automatically updated on each push

**Ready to start automated deployments!** 🚀 