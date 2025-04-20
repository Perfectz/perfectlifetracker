# Azure AD B2C Application Registration Script
# This script registers both the SPA and API applications in Azure AD B2C

# Parameters
param(
    [Parameter(Mandatory=$true)]
    [string]$TenantName,

    [Parameter(Mandatory=$false)]
    [string]$TenantId = "$TenantName.onmicrosoft.com",

    [Parameter(Mandatory=$false)]
    [string]$ApiAppDisplayName = "LifeTracker Pro API",

    [Parameter(Mandatory=$false)]
    [string]$SpaAppDisplayName = "LifeTracker Pro SPA",
    
    [Parameter(Mandatory=$false)]
    [string]$SpaRedirectUri = "http://localhost:3000",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiScope = "user.read",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiScopeName = "LifeTracker.Read",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiScopeDescription = "Read access to LifeTracker Pro API"
)

# Functions
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Check Azure CLI installation
try {
    $azVersion = az --version
    Write-ColorOutput Green "Azure CLI is installed. Proceeding..."
} catch {
    Write-ColorOutput Red "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Check if user is logged in
try {
    $account = az account show
    Write-ColorOutput Green "User is logged in. Proceeding..."
} catch {
    Write-ColorOutput Yellow "User is not logged in. Please login..."
    az login
}

# Ensure we're using the B2C tenant
Write-ColorOutput Cyan "Setting Azure AD B2C tenant: $TenantId"
az account set --subscription $TenantId

# Register the API application
Write-ColorOutput Cyan "Creating API application registration: $ApiAppDisplayName"
$apiApp = az ad app create --display-name $ApiAppDisplayName --available-to-other-tenants $false --reply-urls "http://localhost:4000" | ConvertFrom-Json
$apiAppId = $apiApp.appId
Write-ColorOutput Green "API Application created with App ID: $apiAppId"

# Create service principal for the API app
Write-ColorOutput Cyan "Creating service principal for API application"
az ad sp create --id $apiAppId | Out-Null

# Add scope to API application
Write-ColorOutput Cyan "Adding scope to API application"
$apiIdentifierUri = "api://$apiAppId"
az ad app update --id $apiAppId --identifier-uris $apiIdentifierUri

$scopeConfigJson = @"
[
  {
    "adminConsentDescription": "$ApiScopeDescription",
    "adminConsentDisplayName": "$ApiScopeName",
    "id": "$ApiScope",
    "isEnabled": true,
    "type": "Admin",
    "userConsentDescription": "$ApiScopeDescription",
    "userConsentDisplayName": "$ApiScopeName",
    "value": "$ApiScope"
  }
]
"@

$scopeConfigFile = "scope_config.json"
$scopeConfigJson | Out-File -FilePath $scopeConfigFile
az ad app update --id $apiAppId --oauth2-permissions @$scopeConfigFile
Remove-Item $scopeConfigFile

# Register the SPA application
Write-ColorOutput Cyan "Creating SPA application registration: $SpaAppDisplayName"
$spaApp = az ad app create --display-name $SpaAppDisplayName --available-to-other-tenants $false --reply-urls $SpaRedirectUri --native-app $false | ConvertFrom-Json
$spaAppId = $spaApp.appId
Write-ColorOutput Green "SPA Application created with App ID: $spaAppId"

# Create service principal for the SPA app
Write-ColorOutput Cyan "Creating service principal for SPA application"
az ad sp create --id $spaAppId | Out-Null

# Configure SPA application
Write-ColorOutput Cyan "Configuring SPA application for implicit flow"
az ad app update --id $spaAppId --oauth2-allow-implicit-flow true

# Grant API permissions to SPA app
Write-ColorOutput Cyan "Granting API permissions to SPA application"
$apiPermissionJson = @"
[
  {
    "resourceAppId": "$apiAppId",
    "resourceAccess": [
      {
        "id": "$ApiScope",
        "type": "Scope"
      }
    ]
  }
]
"@

$apiPermissionFile = "api_permission.json"
$apiPermissionJson | Out-File -FilePath $apiPermissionFile
az ad app update --id $spaAppId --required-resource-accesses @$apiPermissionFile
Remove-Item $apiPermissionFile

# Output the registration details
Write-ColorOutput Green "==================== REGISTRATION DETAILS ===================="
Write-ColorOutput Green "Tenant ID: $TenantId"
Write-ColorOutput Green "API Application ID: $apiAppId"
Write-ColorOutput Green "API Scope: $ApiScope"
Write-ColorOutput Green "SPA Application ID: $spaAppId"
Write-ColorOutput Green "SPA Redirect URI: $SpaRedirectUri"
Write-ColorOutput Green "=============================================================="

# Create .env files for frontend and backend
Write-ColorOutput Cyan "Creating .env file for frontend"
$frontendEnv = @"
REACT_APP_AZURE_AD_B2C_TENANT_NAME=$TenantName
REACT_APP_AZURE_AD_B2C_TENANT_ID=$TenantId
REACT_APP_AZURE_AD_B2C_CLIENT_ID=$spaAppId
REACT_APP_AZURE_AD_B2C_API_CLIENT_ID=$apiAppId
REACT_APP_AZURE_AD_B2C_API_SCOPE=https://$TenantName.onmicrosoft.com/$apiAppId/$ApiScope
REACT_APP_API_BASE_URL=http://localhost:4000
"@
$frontendEnv | Out-File -FilePath "..\frontend\.env" -Encoding utf8

Write-ColorOutput Cyan "Creating .env file for backend"
$backendEnv = @"
PORT=4000
AZURE_AD_B2C_TENANT_NAME=$TenantName
AZURE_AD_B2C_TENANT_ID=$TenantId
AZURE_AD_B2C_CLIENT_ID=$apiAppId
AZURE_AD_B2C_ALLOWED_CLIENT_ID=$spaAppId
AZURE_AD_B2C_POLICY_NAME=B2C_1_signupsignin
CORS_ALLOWED_ORIGINS=http://localhost:3000
"@
$backendEnv | Out-File -FilePath "..\backend\.env" -Encoding utf8

Write-ColorOutput Green "Setup completed successfully!"
Write-ColorOutput Yellow "IMPORTANT: You need to manually grant admin consent for the API permissions in the Azure portal."
Write-ColorOutput Yellow "Navigate to Azure Portal > Azure AD B2C > App registrations > $SpaAppDisplayName > API permissions > Grant admin consent for <tenant>" 