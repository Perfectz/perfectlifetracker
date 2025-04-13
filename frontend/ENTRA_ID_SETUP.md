# Microsoft Entra ID Authentication Setup Guide

This guide will help you set up Microsoft Entra ID (formerly Azure AD) for authentication in Perfect LifeTracker Pro, including social identity providers like Facebook and Google.

## Step 1: Create a Microsoft Entra ID App Registration

1. Sign in to the [Azure Portal](https://portal.azure.com).
2. Navigate to **Microsoft Entra ID** > **App registrations** > **New registration**.
3. Enter a name for your application (e.g., "Perfect LifeTracker Pro").
4. For **Supported account types**, select "Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)".
5. For **Redirect URI**, select "Single-page application (SPA)" and enter the URL of your application (e.g., `http://localhost:3000` for local development or your production URL).
6. Click **Register**.

## Step 2: Configure Authentication

1. In your newly created app registration, navigate to **Authentication**.
2. Under **Platform configurations**, ensure your SPA redirect URI is listed.
3. Under **Implicit grant and hybrid flows**, check "Access tokens" and "ID tokens".
4. Click **Save**.

## Step 3: Configure API Permissions

1. Navigate to **API permissions**.
2. Click **Add a permission**.
3. Select **Microsoft Graph**.
4. Select **Delegated permissions**.
5. Add the following permissions:
   - `User.Read` (to read the user's profile)
   - `profile` (to access basic profile information)
   - `openid` (for OpenID Connect)
   - `email` (to access the user's email address)
6. Click **Add permissions**.
7. Click **Grant admin consent** (if you're an admin).

## Step 4: Configure App Roles (Optional)

If you want to use roles in your application:

1. Navigate to **App roles**.
2. Click **Create app role**.
3. Set the following:
   - **Display name**: "Admin"
   - **Allowed member types**: Both (Users/Groups + Applications)
   - **Value**: "Admin"
   - **Description**: "Administrators have full access"
4. Click **Apply**.
5. Create additional roles as needed (e.g., "User", "Manager").

## Step 5: Set Up Social Identity Providers

### For Google:

1. Navigate to **Identity providers** in Microsoft Entra ID.
2. Click **Google**.
3. Enable the provider and enter your Google OAuth credentials:
   - **Client ID**: Create in [Google Cloud Console](https://console.cloud.google.com)
   - **Client secret**: From Google Cloud Console
4. Configure the attribute mappings as needed.
5. Click **Save**.

### For Facebook:

1. Navigate to **Identity providers** in Microsoft Entra ID.
2. Click **Facebook**.
3. Enable the provider and enter your Facebook App credentials:
   - **Client ID**: Create in [Facebook Developer Portal](https://developers.facebook.com)
   - **Client secret**: From Facebook Developer Portal
4. Configure the attribute mappings as needed.
5. Click **Save**.

## Step 6: Configure Environment Variables

Update the `.env` file in your project with the following values:

```
REACT_APP_AZURE_CLIENT_ID=YOUR_APPLICATION_CLIENT_ID
REACT_APP_AZURE_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID
REACT_APP_AZURE_REDIRECT_URI=YOUR_APPLICATION_REDIRECT_URI
```

Replace the placeholders with the actual values from your Azure portal.

## Step 7: Test Your Configuration

1. Start your application.
2. Click on the login button.
3. You should see options for Microsoft, Google, and Facebook logins.
4. Test each login method to ensure they work correctly.

## Troubleshooting

- **Redirect URI Errors**: Make sure the redirect URI in your code exactly matches what's configured in Azure.
- **Scopes Issues**: If permissions aren't working, ensure you've granted admin consent.
- **CORS Errors**: Make sure your application domain is properly configured in the Azure portal.
- **Social Login Failures**: Verify that the social provider credentials are correct and that the provider is properly configured in Azure.

## Additional Resources

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Social Identity Provider Configuration](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/add-application-portal-setup-oidc-oauth-identity-provider) 