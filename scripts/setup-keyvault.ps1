# scripts/setup-keyvault.ps1
# Setup script for Azure Key Vault integration

param(
    [Parameter(Mandatory=$true)]
    [string]$KeyVaultName,
    
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US"
)

Write-Host "Setting up Azure Key Vault integration for Perfect LifeTracker Pro..." -ForegroundColor Green

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI is not installed. Please install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Login to Azure (if not already logged in)
Write-Host "Checking Azure authentication..." -ForegroundColor Yellow
$account = az account show --query "name" -o tsv 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please log in to Azure..." -ForegroundColor Yellow
    az login
}

# Create Key Vault (if it doesn't exist)
Write-Host "Creating Key Vault: $KeyVaultName..." -ForegroundColor Yellow
$keyVaultExists = az keyvault show --name $KeyVaultName --resource-group $ResourceGroupName --query "name" -o tsv 2>$null
if ($LASTEXITCODE -ne 0) {
    az keyvault create --name $KeyVaultName --resource-group $ResourceGroupName --location $Location --enable-rbac-authorization true
    Write-Host "Key Vault created successfully!" -ForegroundColor Green
} else {
    Write-Host "Key Vault already exists." -ForegroundColor Yellow
}

# Get current user object ID
$currentUser = az ad signed-in-user show --query "id" -o tsv
Write-Host "Current user ID: $currentUser" -ForegroundColor Cyan

# Assign Key Vault Administrator role to current user
Write-Host "Assigning Key Vault Administrator role..." -ForegroundColor Yellow
$keyVaultId = az keyvault show --name $KeyVaultName --resource-group $ResourceGroupName --query "id" -o tsv
az role assignment create --role "Key Vault Administrator" --assignee $currentUser --scope $keyVaultId

# Create secrets with placeholder values (you'll need to update these)
Write-Host "Creating initial secrets..." -ForegroundColor Yellow

$secrets = @{
    "cosmos-db-key" = "your-cosmos-db-primary-key"
    "cosmos-db-endpoint" = "https://your-cosmos-account.documents.azure.com:443/"
    "jwt-secret" = -join ((1..64) | ForEach {[char]((65..90) + (97..122) + (48..57) | Get-Random)})
    "session-secret" = -join ((1..64) | ForEach {[char]((65..90) + (97..122) + (48..57) | Get-Random)})
    "encryption-key" = -join ((1..64) | ForEach {[char]((65..90) + (97..122) + (48..57) | Get-Random)})
    "azure-storage-connection" = "your-azure-storage-connection-string"
    "azure-openai-key" = "your-azure-openai-api-key"
}

foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    
    try {
        az keyvault secret set --vault-name $KeyVaultName --name $secretName --value $secretValue --output none
        Write-Host "✓ Created secret: $secretName" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to create secret: $secretName"
    }
}

Write-Host "`nKey Vault setup completed!" -ForegroundColor Green
Write-Host "Key Vault URL: https://$KeyVaultName.vault.azure.net/" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env files with USE_KEY_VAULT=true" -ForegroundColor White
Write-Host "2. Set AZURE_KEY_VAULT_URL=https://$KeyVaultName.vault.azure.net/" -ForegroundColor White
Write-Host "3. Update the placeholder secret values in the Key Vault with your actual values" -ForegroundColor White
Write-Host "4. Configure managed identity for your App Service to access the Key Vault" -ForegroundColor White 