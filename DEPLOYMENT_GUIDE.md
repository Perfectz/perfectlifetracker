# 🚀 Perfect LifeTracker Pro - Deployment Guide

## Overview
This guide will walk you through deploying your Perfect LifeTracker Pro application to production. The app will be accessible on mobile devices with real authentication and database persistence.

---

## ⚡ **Quick Deploy Options**

### Option A: Deploy to Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy frontend
cd frontend
npm run deploy:vercel
```

### Option B: Deploy to Netlify
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Deploy frontend
cd frontend
npm run deploy:netlify
```

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Deploy Backend to Azure**

#### 1.1 Prepare Azure Resources
```bash
# Your backend is already configured for Azure!
# The following are already set up:
# - Azure Cosmos DB connection
# - Environment variables
# - Docker configuration
```

#### 1.2 Deploy to Azure Container Apps (Recommended)
```bash
# From the backend directory
cd backend

# Build Docker image
docker build -t perfect-lifetracker-backend .

# Tag for Azure Container Registry
docker tag perfect-lifetracker-backend your-registry.azurecr.io/lifetracker-backend:latest

# Push to Azure Container Registry
docker push your-registry.azurecr.io/lifetracker-backend:latest
```

#### 1.3 Alternative: Deploy to Azure Web Apps
Your backend is already configured for this. Just:
1. Go to Azure Portal
2. Create new Web App
3. Deploy from your GitHub repository
4. Set environment variables in Azure

### **Step 2: Configure Azure AD Authentication**

#### 2.1 Register App in Azure AD
1. Go to **Azure Portal** → **Entra ID** → **App registrations**
2. Click **"New registration"**
3. Fill in:
   - **Name**: Perfect LifeTracker Pro
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Type: SPA (Single Page Application)
     - URI: `https://your-frontend-domain.com`

#### 2.2 Configure Authentication
1. In your app registration, go to **Authentication**
2. Add redirect URIs:
   - `https://your-frontend-domain.com`
   - `http://localhost:3000` (for development)
3. Enable **ID tokens** and **Access tokens**
4. Save the configuration

#### 2.3 Get Credentials
Copy these values for later:
- **Application (client) ID**
- **Directory (tenant) ID**

### **Step 3: Deploy Frontend**

#### 3.1 Update Environment Variables
Create a `.env.production` file in the frontend directory:
```bash
VITE_API_URL=https://your-backend-domain.azurewebsites.net
VITE_AZURE_CLIENT_ID=your-client-id-from-step-2
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
```

#### 3.2 Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-backend-domain.azurewebsites.net
# VITE_AZURE_CLIENT_ID=your-client-id
# VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
```

#### 3.3 Alternative: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd frontend
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### **Step 4: Update Azure AD with Production URLs**

1. Go back to your Azure AD app registration
2. Update **Redirect URIs** with your production domain:
   - `https://your-vercel-app.vercel.app`
   - `https://your-netlify-app.netlify.app`
3. Update **Logout URLs** if needed

### **Step 5: Test the Deployment**

#### 5.1 Test Authentication
1. Open your deployed app
2. Click "Login"
3. Sign in with your Microsoft account
4. Verify you're redirected back to the app

#### 5.2 Test Features
1. **Weight Tracker**: Add a weight entry
2. **Task Manager**: Create and complete tasks
3. **Mobile**: Test on your phone's browser

---

## 📱 **Mobile Access Setup**

### For iOS Safari:
1. Open your deployed app in Safari
2. Tap the **Share** button
3. Select **"Add to Home Screen"**
4. Your app will appear like a native app!

### For Android Chrome:
1. Open your deployed app in Chrome
2. Tap the **Menu** (three dots)
3. Select **"Add to Home Screen"**
4. Install the web app

---

## 🔧 **Quick Deployment Commands**

I've already prepared everything for you. Just run these commands:

### Deploy Frontend to Vercel:
```bash
cd frontend
npm run deploy:vercel
```

### Deploy Frontend to Netlify:
```bash
cd frontend
npm run deploy:netlify
```

### Build and Preview Locally:
```bash
cd frontend
npm run deploy:preview
```

---

## 🎯 **Environment Variables Checklist**

### Frontend (.env.production):
- [ ] `VITE_API_URL` - Your backend URL
- [ ] `VITE_AZURE_CLIENT_ID` - From Azure AD app registration
- [ ] `VITE_AZURE_AUTHORITY` - Azure tenant URL

### Backend (already configured):
- [x] `COSMOS_DB_ENDPOINT` - Already set
- [x] `COSMOS_DB_KEY` - Already set
- [x] `JWT_SECRET` - Already set
- [x] `AZURE_CLIENT_ID` - Already set

---

## 🚨 **Important Notes**

1. **Domain Updates**: Update all placeholder URLs with your actual domains
2. **CORS Configuration**: Ensure your backend allows requests from your frontend domain
3. **HTTPS Required**: Azure AD requires HTTPS for production
4. **Mobile Testing**: Test thoroughly on actual mobile devices

---

## 🎉 **You're Ready!**

Once deployed, your Perfect LifeTracker Pro will:
- ✅ Work on any mobile device
- ✅ Sync data across devices
- ✅ Use real Microsoft authentication
- ✅ Store data in Azure Cosmos DB
- ✅ Provide a professional user experience

**Your app will be available at:**
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`

## 📞 **Need Help?**

The configuration files are already created:
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration
- Package.json scripts updated with deploy commands

Just update the placeholder URLs with your actual domains and deploy! 