# 🔐 Azure AD Setup Guide for Perfect LifeTracker Pro

## Overview
This guide will help you set up Azure Active Directory authentication for your Perfect LifeTracker Pro application.

---

## 📋 **Prerequisites**

- Azure account with access to Entra ID (Azure AD)
- Your frontend domain (after deployment)
- Backend API URL (after deployment)

---

## 🔧 **Step 1: Register Application in Azure AD**

### 1.1 Navigate to Azure AD
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"Entra ID"** or **"Azure Active Directory"**
3. Click on **Azure Active Directory**

### 1.2 Create App Registration
1. In the left sidebar, click **"App registrations"**
2. Click **"+ New registration"**
3. Fill in the form:

   **Application Details:**
   - **Name**: `Perfect LifeTracker Pro`
   - **Description**: `Personal life tracking application with weight and task management`

   **Supported Account Types:**
   - Select: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"**
   - This allows users to sign in with personal Microsoft accounts

   **Redirect URI:**
   - **Platform**: Single-page application (SPA)
   - **URI**: `http://localhost:3000` (for now, we'll add production URL later)

4. Click **"Register"**

---

## 🔑 **Step 2: Configure Authentication**

### 2.1 Add Production Redirect URIs
1. In your app registration, go to **"Authentication"**
2. Under **"Single-page application"**, click **"Add URI"**
3. Add your production URLs:
   - `https://your-vercel-app.vercel.app`
   - `https://your-netlify-app.netlify.app`
   - `https://your-custom-domain.com` (if applicable)

### 2.2 Configure Token Settings
1. Scroll down to **"Implicit grant and hybrid flows"**
2. Check the boxes for:
   - ✅ **Access tokens** (used for calling APIs)
   - ✅ **ID tokens** (used for user sign-in)

### 2.3 Advanced Settings
1. Scroll to **"Advanced settings"**
2. Set **"Allow public client flows"** to **No**
3. Keep **"Live SDK support"** as **Yes**

### 2.4 Save Configuration
Click **"Save"** at the top of the page

---

## 📝 **Step 3: Get Application Credentials**

### 3.1 Copy Client ID
1. Go to **"Overview"** in your app registration
2. Copy the **Application (client) ID**
   - This is your `VITE_AZURE_CLIENT_ID`
   - Example: `12345678-1234-1234-1234-123456789abc`

### 3.2 Copy Tenant ID
1. Still in **"Overview"**, copy the **Directory (tenant) ID**
   - You'll use this to construct your authority URL
   - Example: `87654321-4321-4321-4321-cba987654321`

### 3.3 Construct Authority URL
Your authority URL will be:
```
https://login.microsoftonline.com/[YOUR-TENANT-ID]
```

---

## 🌐 **Step 4: Configure API Permissions (Optional)**

### 4.1 Add Permissions
1. Go to **"API permissions"**
2. Click **"+ Add a permission"**
3. Select **"Microsoft Graph"**
4. Choose **"Delegated permissions"**
5. Add these permissions:
   - `User.Read` (already there by default)
   - `profile`
   - `openid`
   - `email`

### 4.2 Grant Admin Consent
1. Click **"Grant admin consent for [Your Organization]"**
2. Click **"Yes"** to confirm

---

## 📱 **Step 5: Configure for Mobile**

### 5.1 Platform Configuration
1. Go to **"Authentication"**
2. Click **"+ Add a platform"**
3. Select **"Mobile and desktop applications"**
4. Add these redirect URIs for mobile testing:
   - `https://your-app.vercel.app`
   - `https://your-app.netlify.app`

---

## 🔧 **Step 6: Update Your Application**

### 6.1 Frontend Environment Variables
Create or update your `.env.production` file:

```bash
# Your deployed backend URL
VITE_API_URL=https://your-backend.azurewebsites.net

# From Step 3.1
VITE_AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789abc

# From Step 3.3
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/87654321-4321-4321-4321-cba987654321
```

### 6.2 Update Hosting Platform
**For Vercel:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the variables above

**For Netlify:**
1. Go to your Netlify dashboard
2. Select your site
3. Go to Site Settings → Environment Variables
4. Add the variables above

---

## ✅ **Step 7: Test Authentication**

### 7.1 Test Flow
1. Deploy your application with the new environment variables
2. Open your deployed app
3. Click the **"Login"** button
4. You should see a Microsoft login popup
5. Sign in with any Microsoft account
6. You should be redirected back to your app as a logged-in user

### 7.2 Troubleshooting Common Issues

**Issue: "AADSTS50011: The reply URL specified in the request does not match..."**
- Solution: Double-check your redirect URIs in Azure AD match your deployed URLs exactly

**Issue: Login popup doesn't appear**
- Solution: Check browser popup blockers
- Ensure HTTPS is enabled for production

**Issue: "Invalid client ID"**
- Solution: Verify the client ID is correct and the app registration exists

---

## 🔒 **Security Best Practices**

### 7.1 Regular Maintenance
- [ ] Rotate client secrets every 90 days (if using any)
- [ ] Review app permissions quarterly
- [ ] Monitor sign-in logs for suspicious activity
- [ ] Keep redirect URIs updated

### 7.2 Production Checklist
- [ ] Remove localhost URLs from production app registration
- [ ] Enable logging and monitoring
- [ ] Set up conditional access policies if needed
- [ ] Configure app branding (optional)

---

## 📊 **Step 8: Monitor and Maintain**

### 8.1 Sign-in Logs
1. Go to **Entra ID** → **Sign-in logs**
2. Filter by your application name
3. Monitor for failed sign-ins or unusual activity

### 8.2 App Registration Monitoring
1. Check **"Usage and insights"** in your app registration
2. Monitor authentication metrics
3. Set up alerts for failures

---

## 🎉 **Completion Checklist**

- [ ] App registered in Azure AD
- [ ] Redirect URIs configured for production
- [ ] Client ID and Tenant ID copied
- [ ] Environment variables updated in hosting platform
- [ ] Application deployed with new settings
- [ ] Authentication tested successfully
- [ ] Mobile access verified

---

## 📞 **Need Help?**

**Common Resources:**
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)

**Your Application Settings Summary:**
```bash
Application Name: Perfect LifeTracker Pro
Client ID: [Copy from Azure AD]
Tenant ID: [Copy from Azure AD]
Authority: https://login.microsoftonline.com/[tenant-id]
Redirect URIs: [Your deployed app URLs]
```

🎊 **Once complete, your app will have secure Microsoft authentication ready for mobile use!** 